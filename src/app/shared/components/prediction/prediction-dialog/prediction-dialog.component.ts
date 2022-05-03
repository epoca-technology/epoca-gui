import { Component, Inject, OnInit } from '@angular/core';
import {MatDialogRef, MAT_DIALOG_DATA} from "@angular/material/dialog";
import * as moment from 'moment';
import { 
	CandlestickService, 
	ICandlestick, 
	IModel, 
	IPrediction,
	IPredictionMetaData,
	IArimaModel,
	PredictionService, 
	UtilsService, 
} from '../../../../core';
import { ChartService, ILineChartOptions, NavService, SnackbarService } from '../../../../services';
import { 
	IPredictionDialogComponent, 
	IPredictionDialogComponentData, 
	IMetadata,
	IChangeMetadata,
	IChangeMetadataResult,
	IChangeMetadataChartSeries,
	ISeparatedCandlesticks
} from './interfaces';

@Component({
  selector: 'app-prediction-dialog',
  templateUrl: './prediction-dialog.component.html',
  styleUrls: ['./prediction-dialog.component.scss']
})
export class PredictionDialogComponent implements OnInit, IPredictionDialogComponent {
	// Init main data
	public model!: IModel;
	public prediction!: IPrediction;

	// General Info
	public resultName!: string;
	public modelTypeName!: string;

	// Metadata
	public metadata: IMetadata[] = []

	// Load state
	public loaded: boolean = false;

	constructor(
		public dialogRef: MatDialogRef<PredictionDialogComponent>,
		@Inject(MAT_DIALOG_DATA) private data: IPredictionDialogComponentData,
		private _snackbar: SnackbarService,
		public _nav: NavService,
		public _prediction: PredictionService,
		private _utils: UtilsService,
		private _candlestick: CandlestickService,
		private _chart: ChartService
	) {}

	
	async ngOnInit(): Promise<void> {
		// Make sure the data was provided
		if (!this.data) {
			console.error(this.data);
			this._snackbar.error('A model and a prediction must be provided to the prediction dialog.');
			setTimeout(() => { this.close() }, 700);
			return;
		}

		// Make sure the model was provided
		if (!this.data.model) {
			console.error(this.data);
			this._snackbar.error('A valid model must be provided in order to visualize a prediction.');
			setTimeout(() => { this.close() }, 700);
			return;
		}

		// Make sure the prediction was provided
		if (!this.data.prediction) {
			console.error(this.data)
			this._snackbar.error('A valid prediction must be provided in order to visualize it.');
			setTimeout(() => { this.close() }, 700)
			return;
		}

		// Init Essential Properties
		this.model = this.data.model;
		this.prediction = this.data.prediction;
		this.resultName = this._prediction.resultNames[this.prediction.r];
		this.modelTypeName = this._prediction.getModelTypeName(this.model);

		// Initialize the Metadata
		try {
			await this.initializeMetadata();
		} catch (e) {
			this._snackbar.error(e);
			setTimeout(() => { this.close() }, 700)
			return;
		}

		// Set Load State
		this.loaded = true;
	}





	/* Metadata Initialization */



	/**
	 * Initializes all the metadata for the given prediction.
	 * @returns Promise<void>
	 */
	private async initializeMetadata(): Promise<void> {
		// Make sure the prediction has metadata
		if (!this.prediction.md.length) throw new Error('The provided prediction has no metadata.');

		// Check if the metadata is based on prediction price change
		if (this.prediction.md[0].pl) {
			// Retrieve the maximum amount of predictions
			const maxPredictions: number = this._utils.getMax(this.prediction.md.map((md) => {return md.pl!.length}));

			// Retrieve the candlesticks that will be used to build the lines chart
			const candlesticks: ICandlestick[] = await this.getCandlesticks(maxPredictions);

			// Iterate over each item and build the metadata
			for (let i = 0; i < this.prediction.md.length; i++) {
				this.metadata.push({
					description: this.prediction.md[i].d,
					priceChange: this.getChangeMetadata(this.model.arima_models[i], this.prediction.md[i], candlesticks)
				});
			}
		} 
		
		// Otherwise, populate other relevant data
		else {
			// Iterate over each item and populate the metadata
			for (let md of this.prediction.md) {
				this.metadata.push({
					description: md.d,
				})
			}
		}
	}





	/**
	 * Retrieves all the metadata that is related to prediction price change.
	 * @param sm 
	 * @param md 
	 * @param candlesticks 
	 * @returns IChangeMetadata
	 */
	private getChangeMetadata(sm: IArimaModel, md: IPredictionMetaData, candlesticks: ICandlestick[]): IChangeMetadata {
		// Calculate the % change from first to last price predictions
		const change: number = <number>this._utils.calculatePercentageChange(md.pl![0], md.pl![md.pl!.length - 1], {ru: true});

		// If the increase is greater than the requirement, it is a long
		if (change >= sm.interpreter.long) {
			return {
				value: change,
				result: 'long',
				badge: 'square-badge-success',
				chart: this.getChangeMetadataChart(md.pl!, candlesticks, 'long')
			}
		}

		// If the decreater is smaller than the requirement, it is a short
		else if (change <= -(sm.interpreter.short)) {
			return {
				value: change,
				result: 'short',
				badge: 'square-badge-error',
				chart: this.getChangeMetadataChart(md.pl!, candlesticks, 'short')
			}
		}

		// Otherwise, it is neutral
		else {
			return {
				value: change,
				result: 'neutral',
				badge: 'square-badge',
				chart: this.getChangeMetadataChart(md.pl!, candlesticks, 'neutral')
			}
		}
	}





	/**
	 * Builds the line chart that will compare real prices vs the predicted ones.
	 * @param preds 
	 * @param candlesticks 
	 * @param result 
	 * @returns ILineChartOptions
	 */
	private getChangeMetadataChart(preds: number[], candlesticks: ICandlestick[], result: IChangeMetadataResult): ILineChartOptions {
		// Build series data
		const series: IChangeMetadataChartSeries = this.getChangeMetadataChartSeries(preds, candlesticks);

		// Return the line chart
		return this._chart.getLineChartOptions({
			series: [
				{
					name: "Prediction",
					data: series.predictions, 
					color: this.getPredictionLineColor(result),
				},
				{
					name: "Real",
					data: series.real, 
					color: '#000000'
				},
			],
			stroke: {curve: "straight", dashArray: [8, 0]},
			xaxis: {categories: series.categories, type: "datetime", labels: {datetimeUTC: false},tooltip: {enabled: false} },
		}, 300);
	}




	/**
	 * Based on the predictions and the candlesticks that cover the range,
	 * returns the series to be used on the chart.
	 * @param preds 
	 * @param candlesticks 
	 * @returns IChangeMetadataChartSeries
	 */
	private getChangeMetadataChartSeries(preds: number[], candlesticks: ICandlestick[]): IChangeMetadataChartSeries {
		// Init Data
		let predictions: number[] = [];
		let real: number[] = [];
		let categories: number[] = [];

		// Retrieve the separated candlesticks
		const sc: ISeparatedCandlesticks = this.getCandlestickHeadAndTail(candlesticks, preds.length);

		// Process the head
		for (let headC of sc.head) {
			predictions.push(headC.c);
			real.push(headC.c);
			categories.push(headC.ct);
		}

		// Process the tail
		for (let tailC of sc.tail) {
			real.push(tailC.c);
			categories.push(tailC.ct);
		}

		// Finally, return the series data
		return {
			predictions: predictions.concat(preds),
			real: real,
			categories: categories
		}
	}




	/**
	 * Retrieves the candlesticks head and tail in order to build the series.
	 * @param candlesticks 
	 * @param predictionCount 
	 * @returns ISeparatedCandlesticks
	 */
	private getCandlestickHeadAndTail(candlesticks: ICandlestick[], predictionCount: number): ISeparatedCandlesticks {
		// Init the lists
		let head: ICandlestick[] = [];
		let tail: ICandlestick[] = [];

		// Iterate over each candlestick and separate the values
		for (let c of candlesticks) {
			// Append items to the head
			if (c.ct <= this.prediction.t) { head.push(c) }
			// Append items to the tail
			else { tail.push(c) }
		}

		// Set the time on the last item in the head as the prediction's time
		head[head.length - 1].ct = this.prediction.t;

		// Return the final values
		return {
			head: head,
			tail: tail.slice(0, predictionCount)
		}
	}







	/**
	 * Returns the color for the prediction line based on the result.
	 * @param result 
	 * @returns string
	 */
	private getPredictionLineColor(result: IChangeMetadataResult): string {
		switch(result) {
			case 'long':
				return this._chart.upwardColor;
			case 'short':
				return this._chart.downwardColor;
			default:
				return '#546E7A';
		}
	}
















	/* Candlesticks */





	/**
	 * Retrieves a list of candlesticks that cover ~5 candlesticks from the past
	 * all the way until the end based on the maxPredictions. The future candlesticks
	 * may not exist yet.
	 * @param maxPredictions 
	 * @returns Promise<ICandlestick[]>
	 */
	private async getCandlesticks(maxPredictions: number): Promise<ICandlestick[]> {
		return this._candlestick.getForPeriod(this.getCandlestickStartTime(), this.getCandlestickEndTime(maxPredictions))
	}





	/**
	 * Retrieves the start of the candlesticks time range.
	 * @returns number
	 */
	private getCandlestickStartTime(): number {
		return moment(this.prediction.t)
				.subtract(this._candlestick.predictionCandlestickInterval * 6, 'minutes')
				.valueOf();
	}




	/**
	 * Retrieves the end of the candlesticks time range based on the metadata
	 * that has the most prediction prices.
	 * @param maxPredictions 
	 * @returns number
	 */
	private getCandlestickEndTime(maxPredictions: number): number {
		return moment(this.prediction.t)
				.add(this._candlestick.predictionCandlestickInterval * maxPredictions, 'minutes')
				.valueOf();
	}






	/* Misc Helpers */


	/*
	* Closes the dialog.
	* @returns void
	* */
	public close(): void { this.dialogRef.close() }
}
