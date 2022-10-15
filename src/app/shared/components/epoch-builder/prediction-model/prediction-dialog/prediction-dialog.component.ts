import { Component, Inject, OnInit, ViewChild } from "@angular/core";
import {MatDialogRef, MAT_DIALOG_DATA} from "@angular/material/dialog";
import * as moment from "moment";
import { 
	CandlestickService, 
	ICandlestick, 
	IPrediction, 
	IPredictionModelConfig, 
	PredictionService, 
	UtilsService 
} from "../../../../../core";
import { ChartService, ICandlestickChartOptions, NavService } from "../../../../../services";
import { IPredictionDialogComponent, IPredictionDialogData } from "./interfaces";
import { BigNumber } from "bignumber.js";
import { ApexAnnotations, ChartComponent } from "ng-apexcharts";

@Component({
  selector: "app-prediction-dialog",
  templateUrl: "./prediction-dialog.component.html",
  styleUrls: ["./prediction-dialog.component.scss"]
})
export class PredictionDialogComponent implements OnInit, IPredictionDialogComponent {
	// Init main data
	public model: IPredictionModelConfig;
	private lookback: number;
	private predictions: number;
	public prediction: IPrediction;
	public featuresSum: number;

	// Prediction Result Name
	public resultName: string;

	// Prediction Outcome
	public showOutcome: boolean = false;
	public outcome: boolean|undefined;

	// Prediction Features
	public showFeatures: boolean = false;

	// Prediction Chart
	private rawCandlesticks: ICandlestick[] = [];
	@ViewChild("chartComp") chartComp?: ChartComponent;
	public chart?: Partial<ICandlestickChartOptions>;
	public chartLoaded: boolean = false;

	// Load State
	public loaded: boolean = false;


    constructor(
		public dialogRef: MatDialogRef<PredictionDialogComponent>,
		@Inject(MAT_DIALOG_DATA) private data: IPredictionDialogData,
		private _utils: UtilsService,
		public _nav: NavService,
		private _prediction: PredictionService,
		private _candlestick: CandlestickService,
        private _chart: ChartService,
	) { 
		// Main Data
		this.model = this.data.model;
		this.lookback = this.model.regressions[0].lookback;
		this.predictions = this.model.regressions[0].predictions;
		this.prediction = this.data.prediction;
		this.featuresSum = <number>this._utils.outputNumber(BigNumber.sum.apply(null, this.prediction.f), { dp: 6 });

		// Prediction Result Name
		this.resultName = this._prediction.resultNames[this.prediction.r];

		// Outcome
		this.showOutcome = typeof this.data.outcome == "boolean";
		this.outcome = this.data.outcome;
	}



    async ngOnInit(): Promise<void> {
		try { 
			await this.initChart();
		} catch (e) { 
			console.log(e);
			this.showFeatures = true;
		}
		this.loaded = true;
		setTimeout(() => { 
			this.chartComp!.resetSeries();
			this.chartLoaded = true;
		}, 300);
    }





	/* Prediction Chart */





	/**
	 * Retrieves all the candlesticks within the prediction's 
	 * range and charts all relevant information.
	 */
	private async initChart(): Promise<void> {
		// Firstly, retrieve the candlesticks
		const { list, active } = await this.getCandlesticks();
		this.rawCandlesticks = list;

		// Calculate the price targets based on the active candlestick
		const { takeProfit, stopLoss} = this.calculatePriceTargets(active.c);

		// Init the annotations if it isn't a neutral prediction
		let annotations: ApexAnnotations = {};
		if (this.prediction.r != 0) {
			annotations = {
				yaxis: [
					{
						y: takeProfit,
						borderColor: this._chart.upwardColor,
						strokeDashArray: 3,
						borderWidth: 3,
						label: {
							borderColor: this._chart.upwardColor,
							style: { color: "#FFFFFF", background: this._chart.upwardColor,},
							text: "Take Profit"
						}
					},					
					{
						y: stopLoss,
						borderColor: this._chart.downwardColor,
						strokeDashArray: 3,
						borderWidth: 3,
						label: {
							borderColor: this._chart.downwardColor,
							style: { color: '#fff', background: this._chart.downwardColor,},
							text: "Stop Loss"
						}
					}
				],
				xaxis: [
					{
						x: this.prediction.t,
						strokeDashArray: 3,
						borderWidth: 3,
						borderColor: "#000000",
						label: {
							borderColor: "#000000",
							style: { color: "#FFFFFF", background: "#000000",},
							text: `${this.resultName.toUpperCase()}`,
							offsetY: 270
						}
					},		
				]
			}
		}

		// Retrieve the chart options
		this.chart = this._chart.getCandlestickChartOptions(list, annotations, false, false);
		this.chart.chart!.toolbar = {show: true,tools: {selection: true,zoom: true,zoomin: true,zoomout: true,download: true}}
		this.chart.chart!.height = 400;
	}








	/* Candlestick Retrievers */





	/**
	 * Retrieves a list of candlesticks that cover ~5 candlesticks from the past
	 * all the way until the end based on the maxPredictions. The future candlesticks
	 * may not exist yet.
	 * @returns Promise<{list: ICandlestick[], active: ICandlestick}>
	 */
	 private async getCandlesticks(): Promise<{list: ICandlestick[], active: ICandlestick}> {
		// Retrieve the list of candlesticks within the prediction's range
		const candlesticks: ICandlestick[] = await this._candlestick.getForPeriod(
			this.getCandlestickStartTime(), 
			this.getCandlestickEndTime()
		);

		// Find the candlestick that was active when the prediction was made
		const active: ICandlestick[] = candlesticks.filter((c) => this.prediction.t >= c.ot  && this.prediction.t <= c.ct);
		
		// Finally, return the packed values
		return {list: candlesticks, active: active[0]}
	}





	/**
	 * Retrieves the start of the candlesticks time range.
	 * @returns number
	 */
	private getCandlestickStartTime(): number {
		return moment(this.prediction.t)
				.subtract(this._candlestick.predictionCandlestickInterval * this.predictions, "minutes")
				.valueOf();
	}




	/**
	 * Retrieves the end of the candlesticks time range based on the metadata
	 * that has the most prediction prices.
	 * @returns number
	 */
	private getCandlestickEndTime(): number {
		return moment(this.prediction.t)
				.add(this._candlestick.predictionCandlestickInterval * this.lookback, "minutes")
				.valueOf();
	}












	/* Misc Helpers */





	/**
	 * Calculates the take profit and the stop loss prices based on the
	 * candlestick that was active when the prediction was generated. 
	 * @param initialPrice 
	 * @returns {takeProfit: number, stopLoss: number}
	 */
	private calculatePriceTargets(initialPrice: number): {takeProfit: number, stopLoss: number} {
		// Calculate the targets for a long position
		if (this.prediction.r == 1) {
			return {
				takeProfit: <number>this._utils.alterNumberByPercentage(initialPrice, this.model.price_change_requirement), 
				stopLoss: <number>this._utils.alterNumberByPercentage(initialPrice, -this.model.price_change_requirement)
			};
		}
		// Calculate the targets for a short position
		else if (this.prediction.r == -1) {
			return {
				takeProfit: <number>this._utils.alterNumberByPercentage(initialPrice, -this.model.price_change_requirement), 
				stopLoss: <number>this._utils.alterNumberByPercentage(initialPrice, this.model.price_change_requirement)
			};
		}

		// There are no targets in a neutral position
		else {
			return {takeProfit: 0, stopLoss: 0};
		}
	}





	/*
	* Closes the dialog.
	* @returns void
	* */
	public close(): void { this.dialogRef.close() }
}
