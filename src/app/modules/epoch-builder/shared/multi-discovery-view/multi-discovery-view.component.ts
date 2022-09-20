import { Component, Input, Output, OnInit, OnDestroy, EventEmitter } from '@angular/core';
import { Subscription } from 'rxjs';
import { IRegressionMetadata } from '../../../../core';
import { AppService, ChartService, IBarChartOptions, ILayout } from '../../../../services';
import { IMultiDiscoveryViewComponent, IDiscoveryRecord } from './interfaces';

@Component({
  selector: 'app-multi-discovery-view',
  templateUrl: './multi-discovery-view.component.html',
  styleUrls: ['./multi-discovery-view.component.scss']
})
export class MultiDiscoveryViewComponent implements OnInit, OnDestroy, IMultiDiscoveryViewComponent {

	// Layout
	public layout: ILayout = this._app.layout.value;
	private layoutSub?: Subscription;

    // Certificates, Backtests or anything
	private ids: string[] = [];
    @Input() items!: IDiscoveryRecord[];

	// Metadata
	@Input() md!: IRegressionMetadata;

	// Discovery View
	public discoveryView!: {
		accuracy: IBarChartOptions,
		predictions: IBarChartOptions,
		successfulPredictions: IBarChartOptions,
		increasePredictionRanges: IBarChartOptions
		decreasePredictionRanges: IBarChartOptions
	};
	public activeDiscoveryTab: number = 0;
	public activeDiscoveryAccuracyBadge: number = 0;
	public activeDiscoveryPredictionsBadge: number = 0;
	public activeDiscoverySuccessfulPredictionsBadge: number = 0;

    // Model Activation
    @Output() activateModel = new EventEmitter<string>();


	constructor(
		private _app: AppService,
		private _chart: ChartService,
	) { }


	ngOnInit(): void {
		// Subscribe to the layout
		this.layoutSub = this._app.layout.subscribe((nl: ILayout) => this.layout = nl);

		// Init accuracy values
		let increaseAccuracy: number[] = [];
		let decreaseAccuracy: number[] = [];
		let accuracy: number[] = [];

		// Init prediction values
		let increasePredictions: number[] = [];
		let decreasePredictions: number[] = [];
		let predictions: number[] = [];
		let neutralPredictions: number[] = [];

		// Init successful prediction values
		let successfulIncreaseMean: number[] = [];
		let successfulDecreaseMean: number[] = [];

		// Init increase prediction ranges values
		let increasePredictionMin: number[] = [];
		let increasePredictionMean: number[] = [];
		let increasePredictionMax: number[] = [];

		// Init decrease prediction ranges values
		let decreasePredictionMin: number[] = [];
		let decreasePredictionMean: number[] = [];
		let decreasePredictionMax: number[] = [];

		// Iterate over each certificate and build the data
		for (let r of this.items) {
			// Append the IDs
			this.ids.push(r.id);

			// Append the accuracies
			increaseAccuracy.push(r.discovery.increase_accuracy);
			decreaseAccuracy.push(r.discovery.decrease_accuracy);
			accuracy.push(r.discovery.accuracy);

			// Append the prediction counts
			increasePredictions.push(r.discovery.increase_num);
			decreasePredictions.push(r.discovery.decrease_num);
			predictions.push(r.discovery.increase_num + r.discovery.decrease_num);
			neutralPredictions.push(r.discovery.neutral_num);

			// Append the successful prediction values
			successfulIncreaseMean.push(r.discovery.increase_successful_mean);
			successfulDecreaseMean.push(r.discovery.decrease_successful_mean > 0 ? r.discovery.decrease_successful_mean: -(r.discovery.decrease_successful_mean));

			// Append the increase prediction ranges
			increasePredictionMin.push(r.discovery.increase_min);
			increasePredictionMean.push(r.discovery.increase_mean);
			increasePredictionMax.push(r.discovery.increase_max);

			// Append the decrease prediction ranges
			decreasePredictionMin.push(r.discovery.decrease_min);
			decreasePredictionMean.push(r.discovery.decrease_mean);
			decreasePredictionMax.push(r.discovery.decrease_max);
		}

		// Build the view
		this.discoveryView = {
			accuracy: this._chart.getBarChartOptions(
				{
					series: [
						{name:'Increase Acc.%', data: increaseAccuracy},
						{name:'Decrease Acc.%', data: decreaseAccuracy},
						{name:'General Acc.%', data: accuracy}
					], 
					colors: [this._chart.upwardColor, this._chart.downwardColor, "#000000"],
				}, 
				this.ids, 
				this._chart.calculateChartHeight(110, 20, this.ids.length, 3)
			),
			predictions: this._chart.getBarChartOptions(
				{
					series: [
						{name:'Increase Preds.', data: increasePredictions},
						{name:'Decrease Preds.', data: decreasePredictions},
						{name:'Total Preds.', data: predictions},
						{name:'Neutral Preds.', data: neutralPredictions},
					], 
					colors: [this._chart.upwardColor, this._chart.downwardColor, "#000000", this._chart.neutralColor],
				}, 
				this.ids, 
				this._chart.calculateChartHeight(110, 20, this.ids.length, 4)
			),
			successfulPredictions: this._chart.getBarChartOptions(
				{
					series: [
						{name:'Succ. Increase Mean', data: successfulIncreaseMean},
						{name:'Succ. Decrease Mean', data: successfulDecreaseMean}
					], 
					colors: [this._chart.upwardColor, this._chart.downwardColor],
				}, 
				this.ids, 
				this._chart.calculateChartHeight(110, 20, this.ids.length, 2)
			),
			increasePredictionRanges: this._chart.getBarChartOptions(
				{
					series: [
						{name:'Increase Prediction Min', data: increasePredictionMin},
						{name:'Increase Prediction Mean', data: increasePredictionMean},
						{name:'Increase Prediction Max', data: increasePredictionMax}
					], 
					colors: ["#26A69A", "#00796B", "#004D40"],
				}, 
				this.ids, 
				this._chart.calculateChartHeight(110, 20, this.ids.length, 3)
			),
			decreasePredictionRanges: this._chart.getBarChartOptions(
				{
					series: [
						{name:'Decrease Prediction Min', data: decreasePredictionMin},
						{name:'Decrease Prediction Mean', data: decreasePredictionMean},
						{name:'Decrease Prediction Max', data: decreasePredictionMax}
					], 
					colors: ["#F44336", "#D32F2F", "#B71C1C"],
				}, 
				this.ids, 
				this._chart.calculateChartHeight(110, 20, this.ids.length, 3)
			),
		};

		// Finally, Attach the click events
		const self = this;
		this.discoveryView.accuracy.chart.events = {
			click: function(e: any, cc: any, c: any) {
				if (c.dataPointIndex >= 0) setTimeout(() => {self._activateModel(c.dataPointIndex)}, 300)
			}
		}
		this.discoveryView.predictions.chart.events = {
			click: function(e: any, cc: any, c: any) {
				if (c.dataPointIndex >= 0) setTimeout(() => {self._activateModel(c.dataPointIndex)}, 300)
			}
		}
		this.discoveryView.successfulPredictions.chart.events = {
			click: function(e: any, cc: any, c: any) {
				if (c.dataPointIndex >= 0) setTimeout(() => {self._activateModel(c.dataPointIndex)}, 300)
			}
		}
		this.discoveryView.increasePredictionRanges.chart.events = {
			click: function(e: any, cc: any, c: any) {
				if (c.dataPointIndex >= 0) setTimeout(() => {self._activateModel(c.dataPointIndex)}, 300)
			}
		}
		this.discoveryView.decreasePredictionRanges.chart.events = {
			click: function(e: any, cc: any, c: any) {
				if (c.dataPointIndex >= 0) setTimeout(() => {self._activateModel(c.dataPointIndex)}, 300)
			}
		}
	}



	ngOnDestroy(): void {
		if (this.layoutSub) this.layoutSub.unsubscribe();
	}




	/**
	 * Emmits an event with the ID of the model that should be activated.
	 * @param indexOrID
	 */
	public _activateModel(indexOrID: number|string): void { 
		this.activateModel.emit(typeof indexOrID == "string" ? indexOrID: this.ids[indexOrID]) 
	}
}
