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
	public resultImage: string;

	// Prediction Outcome
	public showOutcome: boolean = false;
	public outcome: boolean|undefined;
	private readonly outcomeCandlesticksRequirement: number = 200;

	// Prediction Features
	public showFeatures: boolean = false;

	// Prediction Chart
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

		// Prediction Result Details
		this.resultName = this._prediction.resultNames[this.prediction.r];
		this.resultImage = this._prediction.resultImagePaths[this.prediction.r];

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
		}, 750);
    }





	/* Prediction Chart */





	/**
	 * Retrieves all the candlesticks within the prediction's 
	 * range and charts all relevant information.
	 */
	private async initChart(): Promise<void> {
		// Firstly, retrieve the candlesticks
		const { list, active } = await this.getCandlesticks();

		// Calculate the estimated open price
		const openPrice: number = this._utils.getMean([active.o, active.h, active.l, active.c]);

		// Init the annotations
		let annotations: ApexAnnotations = {
			yaxis: [],
			points: [
				{
					x: this.prediction.t,
					y: openPrice,
					marker: { size: 0},
					image: { 
						path: this.resultImage,
						width: 18,
						height: 18,
					}
				},		
			]
		};

		// Include additional annotations in case it is a non-neutral prediction
		if (this.prediction.r != 0) {
			// Calculate the price targets based on the active candlestick
			const { takeProfit, stopLoss} = this.calculatePriceTargets(openPrice);

			// Include the take profit and stop loss annotations
			annotations.yaxis = [
				{
					y: takeProfit,
					borderColor: this._chart.upwardColor,
					strokeDashArray: 3,
					borderWidth: 3,
					label: {
						borderColor: this._chart.upwardColor,
						style: { color: "#FFFFFF", background: this._chart.upwardColor,},
						text: "TP",
						position: "left",
						offsetX: 10
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
						text: "SL",
						position: "left",
						offsetX: 10
					}
				}
			];

			// Include the outcome annotation if applies
			const { outcome, closeTime, closePrice } = this.getPredictionOutcome(
				list.slice(this.predictions),
				takeProfit,
				stopLoss
			);
			if (typeof outcome == "boolean" && typeof closeTime == "number" && typeof closePrice == "number") {
				const basePath: string = "/assets/img/prediction_badges";
				annotations.points!.push({
					x: closeTime,
					y: closePrice,
					marker: { size: 0},
					image: { 
						path: outcome ? `${basePath}/successful_outcome.png`: `${basePath}/unsuccessful_outcome.png`,
						width: 18,
						height: 18,
					}
				});
				this.outcome = outcome;
				this.showOutcome = true;
			}
		}

		// Retrieve the chart options
		this.chart = this._chart.getCandlestickChartOptions(list, annotations, false, false);
		this.chart.chart!.toolbar = {show: true,tools: {selection: true,zoom: true,zoomin: true,zoomout: true,download: false}};
		this.chart.chart!.zoom = {enabled: true, type: "xy"};
		this.chart.chart!.height = 370;
	}









	/**
	 * Derives the outcome in case it wasn't provided to the component and
	 * also attempts to determine when it took place. To do so, it makes use
	 * of candlesticks that came into existance after the creation of the 
	 * prediction.
	 * If an outcome was provided and it differs from the derived one, it will
	 * ignore it and stick to whatever was provided to the component.
	 * @param candlesticks 
	 * @param takeProfit 
	 * @param stopLoss 
	 * @returns {outcome: boolean|undefined,closeTime: number|undefined,closePrice: number|undefined}
	 */
	private getPredictionOutcome(candlesticks: ICandlestick[], takeProfit: number, stopLoss: number): {
		outcome: boolean|undefined, 
		closeTime: number|undefined, 
		closePrice: number|undefined
	} {
		// Init values
		let deductedOutcome: boolean|undefined = undefined;
		let closeTime: number|undefined = undefined;
		let closePrice: number|undefined = undefined;

		// Iterate over the candlesticks until the outcome is determined
		let i: number = 0;
		while (i < candlesticks.length && deductedOutcome == undefined) {
			// Validate a long position
			if (this.prediction.r == 1) {
				// Check the stop loss
				if (candlesticks[i].l <= stopLoss) {
					deductedOutcome = false;
					closeTime = candlesticks[i].ct;
					closePrice = stopLoss;
				}

				// Check the take profit
				else if (candlesticks[i].h >= takeProfit) {
					deductedOutcome = true;
					closeTime = candlesticks[i].ct;
					closePrice = takeProfit;
				}
			}

			// Validate a short position
			else {
				// Check the stop loss
				if (candlesticks[i].h >= stopLoss) {
					deductedOutcome = false;
					closeTime = candlesticks[i].ct;
					closePrice = stopLoss;
				}


				// Check the take profit
				else if (candlesticks[i].l <= takeProfit) {
					deductedOutcome = true;
					closeTime = candlesticks[i].ct;
					closePrice = takeProfit;
				}
			}

			// Increment the counter
			i += 1;
		}

		// If an outcome was provided and it differs from the deducted one, ignore whatever was found
		if (
			typeof this.outcome == "boolean" && 
			typeof deductedOutcome == "boolean" && 
			this.outcome != deductedOutcome
		) {
			deductedOutcome = undefined;
			closeTime = undefined;
			closePrice = undefined;
		}

		// Finally, return the outcome
		return {
			outcome: typeof this.outcome == "boolean" ? this.outcome: deductedOutcome,
			closeTime: closeTime,
			closePrice: closePrice
		}
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
	 * Retrieves the start of the candlesticks time range that sufficient to
	 * give the prediction some context.
	 * @returns number
	 */
	private getCandlestickStartTime(): number {
		return moment(this.prediction.t)
				.subtract(this._candlestick.predictionCandlestickInterval * this.predictions, "minutes")
				.valueOf();
	}




	/**
	 * Retrieves the end of the candlesticks time range that hopefully
	 * is sufficient in order to identify the prediction's outcome.
	 * @returns number
	 */
	private getCandlestickEndTime(): number {
		return moment(this.prediction.t)
				.add(this._candlestick.predictionCandlestickInterval * this.outcomeCandlesticksRequirement, "minutes")
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
