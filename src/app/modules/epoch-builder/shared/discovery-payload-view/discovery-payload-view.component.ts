import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { IDiscoveryPayload } from '../../../../core';
import { AppService, ChartService, IBarChartOptions, ILayout, IPieChartOptions, IScatterChartOptions } from '../../../../services';
import { IDiscoveryPayloadViewComponent, IPredictionInsight } from "./interfaces";

@Component({
  selector: 'app-discovery-payload-view',
  templateUrl: './discovery-payload-view.component.html',
  styleUrls: ['./discovery-payload-view.component.scss']
})
export class DiscoveryPayloadViewComponent implements OnInit, OnDestroy, IDiscoveryPayloadViewComponent {
	// Layout
	public layout: ILayout = this._app.layout.value;
	private layoutSub?: Subscription;
	
	// The ID of the model
	@Input() id!: string;

	// Discovery Payload
	@Input() discovery!: IDiscoveryPayload;

	// Accuracy
	public accuracyChart!: IBarChartOptions;

	// Predictions Insight
	public predictionInsights: IPredictionInsight[] = [
		{ name: "Increase", class: "increase_insight", icon: "trending_up", color: "#4DB6AC" },
		{ name: "Successful Increase", class: "successful_increase_insight", icon: "trending_up", color: "#004D40" },
		{ name: "Decrease", class: "decrease_insight", icon: "trending_down", color: "#E57373" },
		{ name: "Successful Decrease", class: "successful_decrease_insight", icon: "trending_down", color: "#B71C1C" },
	]
	public activeInsight!: IPredictionInsight;
	public predictionInsightChart!: IScatterChartOptions;

	// Predictions
	public predictionsChart!: IPieChartOptions;
	public outcomesChart!: IPieChartOptions;

	constructor(
		private _app: AppService,
		private _chart: ChartService,
	) { }

	ngOnInit(): void {
		// Subscribe to the layout
		this.layoutSub = this._app.layout.subscribe((nl: ILayout) => this.layout = nl);

		// Init the accuracy chart
		this.accuracyChart = this._chart.getBarChartOptions(
			{
				series: [
					{name: "Increase Acc.%", data: [this.discovery.increase_accuracy]},
					{name: "Decrease Acc.%", data: [this.discovery.decrease_accuracy]},
					{name: "General Acc.%", data: [this.discovery.accuracy]}
				], 
				colors: [this._chart.upwardColor, this._chart.downwardColor, "#000000"],
				xaxis: {categories: [this.id], labels: {show: false}},
				yaxis: {labels: {show: false}},
			}, 
			[this.id], 
			130
		);

		// Prediction Insights
		this.activateInsight(0);

		// Predictions
		this.predictionsChart = this._chart.getPieChartOptions({
			series: [
				this.discovery.increase_num || 0, 
				this.discovery.decrease_num || 0
			],
			colors: [this._chart.upwardColor, this._chart.downwardColor],
			legend: {show: false}
		}, ["Increase", "Decrease"], 280);

		// Outcomes
		this.outcomesChart =  this._chart.getPieChartOptions({
			series: [
				this.discovery.increase_outcome_num || 0, 
				this.discovery.decrease_outcome_num || 0
			],
			colors: [this._chart.upwardColor, this._chart.downwardColor],
			legend: {show: false}
		}, ["Increase", "Decrease"], 280);
	}


	ngOnDestroy(): void {
		if (this.layoutSub) this.layoutSub.unsubscribe();
	}






	/**
	 * Activates a prediction insight based on an index.
	 * @param index 
	 */
	public activateInsight(index: number): void {
		// Populate the active insight
		this.activeInsight = this.predictionInsights[index];

		// Retrieve the list of predictions
		const preds: number[] = this.getPredictions();

		// Build the chart
		this.predictionInsightChart = this._chart.getScatterChartOptions(
			{ series: [{name: "Prediction", data: preds, color: this.activeInsight.color}]},
			350, 
			true
		);
	}





	/**
	 * Retrievs the prediction list for the active insight.
	 * @returns number[]
	 */
	private getPredictions(): number[] {
		if (this.activeInsight.class == "increase_insight") { return this.discovery.increase_list }
		else if (this.activeInsight.class == "successful_increase_insight") { return this.discovery.increase_successful_list }
		else if (this.activeInsight.class == "decrease_insight") { return this.discovery.decrease_list }
		else if (this.activeInsight.class == "successful_decrease_insight") { return this.discovery.decrease_successful_list }
		else { throw new Error("Invalid prediction insight.") }
	}
}
