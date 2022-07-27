import { Component, Inject, OnInit } from '@angular/core';
import {MatDialogRef, MAT_DIALOG_DATA} from "@angular/material/dialog";
import * as moment from 'moment';
import { 
	CandlestickService, 
	ICandlestick, 
	IModel, 
	IPrediction,
	PredictionService, 
	UtilsService, 
	IPercentChangeInterpreterConfig,
	IClassificationModelConfig
} from '../../../../core';
import { ChartService, ILineChartOptions, NavService, SnackbarService } from '../../../../services';
import { 
	IPredictionDialogComponent, 
	IPredictionDialogComponentData, 
	IMetadata,
	IChangeMetadata,
	IProbabilityMetadata,
	IMetadataResultName,
	IChangeMetadataChartSeries,
	ISeparatedCandlesticks,
	IMetadataResultBadge,
	IProbabilityMetadataFeature,
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
	public metadata: IMetadata[] = [];

	// Prediction Outcome
	public showOutcome: boolean = false;
	public outcome?: boolean;

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
		this.showOutcome = typeof this.data.outcome == "boolean";
		if (this.showOutcome) { this.outcome = this.data.outcome }


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

		// Build the metadata for the consensus model
		if (this.modelTypeName == "ConsensusModel" && this.model.consensus_model) {
			// Iterate over each metadata item
			for (let i = 0; i < this.prediction.md.length; i++) {
				// Init the metadata item
				let metadata: IMetadata = { description: this.prediction.md[i].d};

				// Check if the metadata contains arima related values
				if (
					this.prediction.md[i].pl && 
					this._prediction.getModelTypeName(this.model.consensus_model.sub_models[i]) == "ArimaModel"
				) {
					metadata.priceChange = await this.getChangeMetadata(
						this.model.consensus_model.sub_models[i].arima_models![0].interpreter, 
						this.prediction.md[i].pl!
					);
				}

				// Check if the metadata contains regression related
				else if (
					this.prediction.md[i].npl && 
					this._prediction.getModelTypeName(this.model.consensus_model.sub_models[i]) == "RegressionModel"
				) {
					metadata.priceChange = await this.getChangeMetadata(
						this.model.consensus_model.sub_models[i].regression_models![0].interpreter, 
						this.prediction.md[i].npl!
					);
				}

				// Check if the metadata contains classification related values
				else if (
					this.prediction.md[i].f && this.prediction.md[i].up && this.prediction.md[i].dp &&
					this._prediction.getModelTypeName(this.model.consensus_model.sub_models[i]) == "ClassificationModel"
				) {
					metadata.probabilities = this.getProbabilityMetadata(
						this.model.consensus_model.sub_models[i].classification_models![0],
						this.prediction.md[i].f!,
						this.prediction.md[i].up!,
						this.prediction.md[i].dp!
					)
				}

				// Finally, add the item to the list
				this.metadata.push(metadata);
			}
		}

		// Otherwise, build the metadata for a single model
		else {
			// Init the metadata item
			let metadata: IMetadata = { description: this.prediction.md[0].d};

			// Check if the metadata contains arima related values
			if (this.prediction.md[0].pl && this.model.arima_models) {
				metadata.priceChange = await this.getChangeMetadata(this.model.arima_models[0].interpreter, this.prediction.md[0].pl!)
			}

			// Check if the metadata contains regression related values
			else if (this.prediction.md[0].npl && this.model.regression_models) {
				metadata.priceChange = await this.getChangeMetadata(this.model.regression_models[0].interpreter, this.prediction.md[0].npl!)
			}

			// Check if the metadata contains classification related values
			else if (this.prediction.md[0].f && this.prediction.md[0].up && this.prediction.md[0].dp && this.model.classification_models) {
				metadata.probabilities = this.getProbabilityMetadata(
					this.model.classification_models[0],
					this.prediction.md[0].f,
					this.prediction.md[0].up,
					this.prediction.md[0].dp
				)
			}

			// Finally, add the metadata to the list
			this.metadata.push(metadata);
		}
	}








	/* Classification Prediction Builder */



	/**
	 * Retrieves all the metadata related to a prediction based on probability.
	 * @param interpreter 
	 * @param features 
	 * @param upProbability 
	 * @param downProbability 
	 * @returns IProbabilityMetadata
	 */
	private getProbabilityMetadata(
		classificationConfig: IClassificationModelConfig, 
		features: number[],
		upProbability: number, 
		downProbability: number
	): IProbabilityMetadata {
		// Init values
		let result: IMetadataResultName = "neutral";
		let badge: IMetadataResultBadge = "square-badge-neutral";
		let finalFeatures: IProbabilityMetadataFeature[] = [];

		// Check if the model predicted a long
		if (upProbability >= classificationConfig.interpreter.min_probability) {
			result = "long";
			badge = "square-badge-success";
		}

		// Check if the model predicted a short
		else if (downProbability >= classificationConfig.interpreter.min_probability) {
			result = "short";
			badge = "square-badge-error";
		}

		// Include the regression features
		for (let i = 0; i < classificationConfig.classification.models.length; i++) {
			finalFeatures.push({value: features[i], type: "regression", model: classificationConfig.classification.models[i]})
		}

		// Include the technical analysis features
		let currentIndex: number = classificationConfig.classification.models.length;
		if (classificationConfig.classification.include_rsi) {
			finalFeatures.push({value: features[currentIndex], type: "rsi"});
			currentIndex += 1;
		}
		if (classificationConfig.classification.include_stoch) {
			finalFeatures.push({value: features[currentIndex], type: "stoch"})
			currentIndex += 1;
		}
		if (classificationConfig.classification.include_aroon) {
			finalFeatures.push({value: features[currentIndex], type: "aroon"})
			currentIndex += 1;
		}
		if (classificationConfig.classification.include_stc) {
			finalFeatures.push({value: features[currentIndex], type: "stc"})
			currentIndex += 1;
		}
		if (classificationConfig.classification.include_mfi) {
			finalFeatures.push({value: features[currentIndex], type: "mfi"})
			currentIndex += 1;
		}


		// Finally, return the metadata
		return {
			result: result,
			badge: badge,
			upProbability: <number>this._utils.outputNumber(upProbability*100, {dp: 2}),
			downProbability: <number>this._utils.outputNumber(downProbability*100, {dp: 2}),
			features: finalFeatures
		}
	}













	/* Regression Prediction Builder */




	/**
	 * Retrieves all the metadata that is related to prediction price change.
	 * @param interpreter 
	 * @param preds
	 * @returns Promise<IChangeMetadata>
	 */
	private async getChangeMetadata(interpreter: IPercentChangeInterpreterConfig, preds: number[]): Promise<IChangeMetadata> {
		// Calculate the % change from first to last price predictions
		const change: number = <number>this._utils.calculatePercentageChange(preds[0], preds[preds.length - 1], {ru: true});

		// Round the predictions to a maximum of 5 decimals
		preds = preds.map((p) => { return <number>this._utils.outputNumber(p, {dp: p > 1 ? 2: 6}) })

		// If the increase is greater than the requirement, it is a long
		if (change >= interpreter.long) {
			return {
				value: change,
				result: 'long',
				badge: 'square-badge-success',
				chart: await this.getRegressionMetadataChart(preds, 'long')
			}
		}

		// If the decreater is smaller than the requirement, it is a short
		else if (change <= -(interpreter.short)) {
			return {
				value: change,
				result: 'short',
				badge: 'square-badge-error',
				chart: await this.getRegressionMetadataChart(preds, 'short')
			}
		}

		// Otherwise, it is neutral
		else {
			return {
				value: change,
				result: 'neutral',
				badge: 'square-badge-neutral',
				chart: await this.getRegressionMetadataChart(preds, 'neutral')
			}
		}
	}




	/**
	 * Retrieves a prediction line chart for a regression based on its
	 * type.
	 * @param preds 
	 * @param result 
	 * @returns Promise<ILineChartOptions>
	 */
	private async getRegressionMetadataChart(preds: number[], result: IMetadataResultName): Promise<ILineChartOptions> {
		// Arima Line Chart
		if (this.modelTypeName == "ArimaModel") {
			return this.getArimaMetadataChart(preds, result);
		}

		// Regression Line Chart
		else if (this.modelTypeName == "RegressionModel") {
			// Return the line chart
			return this._chart.getLineChartOptions({
				series: [{name: "Prediction", data: preds, color: this.getPredictionLineColor(result)}],
			}, 300, true);
		}

		// Otherwise, the provided model is invalid
		else {
			throw new Error("The getRegressionMetadataChart could not be built because the provided model is invalid.")
		}
	}







	/**
	 * Builds the line chart that will compare real prices vs the predicted ones.
	 * @param preds 
	 * @param result 
	 * @returns Promise<ILineChartOptions>
	 */
	private async getArimaMetadataChart(preds: number[], result: IMetadataResultName): Promise<ILineChartOptions> {
		// Retrieve the candlesticks that will be used to build the lines chart
		const candlesticks: ICandlestick[] = await this.getCandlesticks(preds.length);

		// Build series data
		const series: IChangeMetadataChartSeries = this.getArimaMetadataChartSeries(preds, candlesticks);

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
		}, 300, true);
	}




	/**
	 * Based on the predictions and the candlesticks that cover the range,
	 * returns the series to be used on the chart.
	 * @param preds 
	 * @param candlesticks 
	 * @returns IChangeMetadataChartSeries
	 */
	private getArimaMetadataChartSeries(preds: number[], candlesticks: ICandlestick[]): IChangeMetadataChartSeries {
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





	/**
	 * Returns the color for the prediction line based on the result.
	 * @param result 
	 * @returns string
	 */
	 private getPredictionLineColor(result: IMetadataResultName): string {
		switch(result) {
			case 'long':
				return this._chart.upwardColor;
			case 'short':
				return this._chart.downwardColor;
			default:
				return this._chart.neutralColor;
		}
	}







	/*
	* Closes the dialog.
	* @returns void
	* */
	public close(): void { this.dialogRef.close() }
}
