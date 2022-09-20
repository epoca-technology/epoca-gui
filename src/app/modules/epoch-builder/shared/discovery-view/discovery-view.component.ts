import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { IDiscovery, IRegressionConfig, IPredictionModelConfig, UtilsService } from '../../../../core';
import { AppService, ChartService, IBarChartOptions, ILayout, ILineChartOptions, IPieChartOptions } from '../../../../services';
import { IDiscoveryViewComponent, IPredictionInsight } from "./interfaces";


@Component({
  selector: 'app-discovery-view',
  templateUrl: './discovery-view.component.html',
  styleUrls: ['./discovery-view.component.scss']
})
export class DiscoveryViewComponent implements OnInit, OnDestroy, IDiscoveryViewComponent {
	// Layout
	public layout: ILayout = this._app.layout.value;
	private layoutSub?: Subscription;
	
	// The model's configuration
	@Input() modelConfig!: IRegressionConfig|IPredictionModelConfig|any;

	// Discovery
	@Input() discovery!: IDiscovery;

	// The name of the type of model
	public modelName!: "Regression"|"PredictionModel";

	// Accuracy
	public accuracyChart!: IBarChartOptions;

	// Points Hist
	public pointsHistChart!: ILineChartOptions;

	// Predictions Insight
	public predictionInsights: IPredictionInsight[] = [
		{ name: "All Increase", class: "increase_insight", icon: "trending_up", color: "#004D40" },
		{ name: "Successful Increase", class: "increase_insight", icon: "trending_up", color: "#004D40" },
		{ name: "Unsuccessful Increase", class: "increase_insight", icon: "trending_up", color: "#004D40" },
		{ name: "All Decrease", class: "decrease_insight", icon: "trending_down", color: "#B71C1C" },
		{ name: "Successful Decrease", class: "decrease_insight", icon: "trending_down", color: "#B71C1C" },
		{ name: "Unsuccessful Decrease", class: "decrease_insight", icon: "trending_down", color: "#B71C1C" },
	]
	public activeInsight!: IPredictionInsight;
	public predictionInsightChart!: ILineChartOptions;
	public insightsVisible: boolean = false;

	// Predictions
	public predictionsChart!: IPieChartOptions;
	public outcomesChart!: IPieChartOptions;

	constructor(
		private _app: AppService,
		private _chart: ChartService,
		private _utils: UtilsService
	) { }

	ngOnInit(): void {
		// Subscribe to the layout
		this.layoutSub = this._app.layout.subscribe((nl: ILayout) => this.layout = nl);

		// Init the name of the model
		this.modelName = this.modelConfig.id.includes("KR_") ? "Regression": "PredictionModel";

		// Init the accuracy chart
		this.accuracyChart = this._chart.getBarChartOptions(
			{
				series: [
					{name: "Increase Acc.%", data: [this.discovery.increase_accuracy]},
					{name: "Decrease Acc.%", data: [this.discovery.decrease_accuracy]},
					{name: "General Acc.%", data: [this.discovery.accuracy]}
				], 
				colors: [this._chart.upwardColor, this._chart.downwardColor, "#000000"],
				xaxis: {categories: [this.modelConfig.id], labels: {show: false}},
				yaxis: {labels: {show: false}},
			}, 
			[this.modelConfig.id], 
			130
		);

		// Build the points history
		let hist_x: string[] = [];
		for (let i = 10; i <= 100; i = i + 10) { hist_x.push(`${i}%`) }
		this.pointsHistChart = this._chart.getLineChartOptions(
			{ 
				series: [{name: "Points", data: this.discovery.points_hist, color: "#000000"}],
				stroke: {curve: "straight", width:3},
				xaxis: {categories: hist_x, labels: { show: true }, axisTicks: {show: true} }
			},
			280, 
			true
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
		this.predictionInsightChart = this._chart.getLineChartOptions(
			{ 
				series: [{name: "Prediction", data: preds, color: this.activeInsight.color}],
				stroke: {curve: "straight", width:1}
			},
			300, 
			true
		);
	}





	/**
	 * Retrievs the prediction list for the active insight.
	 * @returns number[]
	 */
	private getPredictions(): number[] {
		if (this.activeInsight.name == "All Increase") { return this.discovery.increase_list }
		else if (this.activeInsight.name == "Successful Increase") { return this.discovery.increase_successful_list }
		else if (this.activeInsight.name == "Unsuccessful Increase") { return this.discovery.increase_unsuccessful_list }
		else if (this.activeInsight.name == "All Decrease") { return this.discovery.decrease_list }
		else if (this.activeInsight.name == "Successful Decrease") { return this.discovery.decrease_successful_list }
		else if (this.activeInsight.name == "Unsuccessful Decrease") { return this.discovery.decrease_unsuccessful_list }
		else { throw new Error("Invalid prediction insight.") }
	}
}
