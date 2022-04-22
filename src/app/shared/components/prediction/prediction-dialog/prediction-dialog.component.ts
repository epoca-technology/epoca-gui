import { Component, Inject, OnInit } from '@angular/core';
import {MatDialogRef, MAT_DIALOG_DATA} from "@angular/material/dialog";
import * as moment from 'moment';
import { 
	CandlestickService, 
	ICandlestick, 
	IModel, 
	IPrediction,
	IPredictionMetaData,
	ISingleModel,
	PredictionService, 
	UtilsService, 
} from '../../../../core';
import { ChartService, ILineChartOptions, NavService, SnackbarService } from '../../../../services';
import { 
	IPredictionDialogComponent, 
	IPredictionDialogComponentData, 
	IMetadata,
	IChangeMetadata,
	IRSIMetadata,
	IEMAMetadata,
	IChangeMetadataResult,
	IChangeMetadataChartSeries
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
		this.modelTypeName = this._prediction.getModelTypeName(this.model.single_models.length);

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
					priceChange: {
						change: this.getChangeMetadata(this.model.single_models[i], this.prediction.md[i], candlesticks),
						rsi: this.getRSIMetadata(this.model.single_models[i], this.prediction.md[i]),
						ema: this.getEMAMetadata(this.model.single_models[i], this.prediction.md[i]),
					}
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
	private getChangeMetadata(sm: ISingleModel, md: IPredictionMetaData, candlesticks: ICandlestick[]): IChangeMetadata {
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
			xaxis: {categories: series.categories}
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

		// Iterate over each candlestick
		// @TODO

		// Finally, return the series data
		return {
			predictions: predictions,
			real: real,
			categories: categories
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










	/**
	 * If the RSI is active it will return its metadata, otherwise returns undefined.
	 * @param sm 
	 * @param md 
	 * @returns IRSIMetadata|undefined
	 */
	private getRSIMetadata(sm: ISingleModel, md: IPredictionMetaData): IRSIMetadata|undefined {
		// Make sure the RSI is enabled
		if (
			sm.interpreter.rsi.active && 
			sm.interpreter.rsi.overbought &&
			sm.interpreter.rsi.oversold &&
			md.rsi
		) {
			// Check if the RSI is overbought
			if (md.rsi >= sm.interpreter.rsi.overbought) {
				return { value: md.rsi, result: 'overbought', badge: 'square-badge-success' }
			}

			// Check if the RSI is oversold
			else if (md.rsi <= sm.interpreter.rsi.oversold) {
				return { value: md.rsi, result: 'oversold', badge: 'square-badge-error' }
			}

			// Otherwise, it is neutral
			else {
				return { value: md.rsi, result: 'neutral', badge: 'square-badge' }
			}
		} else { return undefined }
	}





	/**
	 * If the EMA is active it will return its metadata, otherwise returns undefined.
	 * @param sm 
	 * @param md 
	 * @returns IEMAMetadata|undefined
	 */
	 private getEMAMetadata(sm: ISingleModel, md: IPredictionMetaData): IEMAMetadata|undefined {
		 // Make sure the EMA is enabled
		 if (
			sm.interpreter.ema.active && 
			sm.interpreter.ema.distance && 
			md.sema &&
			md.lema
		 ) {
			// If short is above long means it could be an uptrend
			if (md.sema > md.lema) {
				// Calculate the distance from long to short
				const distance: number = <number>this._utils.calculatePercentageChange(md.lema, md.sema, {ru: true});

				// If the distance is equals or greater, it is an uptrend
				if (distance >= sm.interpreter.ema.distance) {
					return {shortValue: md.sema, longValue: md.lema, distanceValue: distance, result: 'upwards', badge: 'square-badge-success'}
				}

				// Otherwise, it is neutral
				else {
					return {shortValue: md.sema, longValue: md.lema, distanceValue: distance, result: 'sideways', badge: 'square-badge'}
				}
			}

			// If the long is above the short means it could be a downtrend
			else if (md.sema < md.lema) {
				// Calculate the distance from short to long
				const distance: number = <number>this._utils.calculatePercentageChange(md.sema, md.lema, {ru: true});

				// If the distance is equals or greater, it is an downtrend
				if (distance >= sm.interpreter.ema.distance) {
					return {shortValue: md.sema, longValue: md.lema, distanceValue: distance, result: 'downwards', badge: 'square-badge-error'}
				}

				// Otherwise, it is neutral
				else {
					return {shortValue: md.sema, longValue: md.lema, distanceValue: distance, result: 'sideways', badge: 'square-badge'}
				}
			}

			// Otherwise, the trend is unknown
			else {
				return {shortValue: md.sema, longValue: md.lema, distanceValue: 0, result: 'sideways', badge: 'square-badge'}
			}
		 } else { return undefined }
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
