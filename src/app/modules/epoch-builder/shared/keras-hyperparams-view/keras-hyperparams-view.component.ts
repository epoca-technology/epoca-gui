import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { IRegressionTrainingCertificate } from '../../../../core';
import { AppService, ChartService, IBarChartOptions, ILayout } from '../../../../services';
import { IKerasHyperparamsViewComponent, IKerasHyperparamsCounter } from './interfaces';

@Component({
  selector: 'app-keras-hyperparams-view',
  templateUrl: './keras-hyperparams-view.component.html',
  styleUrls: ['./keras-hyperparams-view.component.scss']
})
export class KerasHyperparamsViewComponent implements OnInit, OnDestroy, IKerasHyperparamsViewComponent {
	// Layout
	public layout: ILayout = this._app.layout.value;
	private layoutSub?: Subscription;
	
	// Certificates
	@Input() certs!: IRegressionTrainingCertificate[];

	// Height of the grid charts
	private readonly gridChartHeight: number = 230;

	/* Counters */

	// Optimizer
	private optimizerCounter: IKerasHyperparamsCounter = {
		"Adam": 0,
		"RMSprop": 0,
		"Unknown": 0
	};

	// Learning Rate
	private learningRateCounter: IKerasHyperparamsCounter = {
		"-1": 0,
		"0.001": 0,
		"0.0001": 0,
		"Unknown": 0
	};

	// Loss
	private lossCounter: IKerasHyperparamsCounter = {
		"mean_absolute_error": 0,
		"mean_squared_error": 0,
		"Unknown": 0
	};

	// Network Type
	private networkTypeCounter: IKerasHyperparamsCounter = {
		"DNN": 0,
		"CDNN": 0,
		"CDNN_MP": 0,
		"LSTM": 0,
		"CLSTM": 0,
		"CLSTM_MP": 0,
		"Unknown": 0
	};

	// Network Series
	private networkSeriesCounter: IKerasHyperparamsCounter = {
		"S2": 0,
		"S3": 0,
		"S4": 0,
		"S5": 0,
		"Unknown": 0
	};

	// Network Capacity Counter
	private networkCapacityCounter: IKerasHyperparamsCounter = {};



	/* Charts */

    // Optimizer Functions: "Adam"|"RMSprop" (IKerasOptimizerName)
    optimizer!: IBarChartOptions;

    // ILearningRate: "-1", "0.001" (IKerasHyperparamsLearningRate)
    learningRate!: IBarChartOptions;

    // "mean_absolute_error"|"mean_squared_error"|"categorical_crossentropy"|"binary_crossentropy" (IKerasLoss)
    loss!: IBarChartOptions;

    // "DNN"|"CDNN"|"LSTM"|"CLSTM"|Unknown (IKerasHyperparamsNetwork)
    networkType!: IBarChartOptions;

    // Neural Network Series
    networkSeries!: IBarChartOptions;

    // Only present in regressions: Single Shot vs Autoregressive
    regressionType?: IBarChartOptions;

    // Network Capacities
    networkCapacity!: IBarChartOptions;


	constructor(
		private _app: AppService,
		private _chart: ChartService
	) { }




	ngOnInit(): void {
		// Subscribe to the layout
		this.layoutSub = this._app.layout.subscribe((nl: ILayout) => this.layout = nl);

		// Iterate over each certificate and build the counters
		for (let cert of this.certs) {
			// Update the optimizer counter
			if (typeof this.optimizerCounter[cert.optimizer] == "number") { this.optimizerCounter[cert.optimizer] += 1 }
			else { this.optimizerCounter["Unknown"] += 1 }

			// Update the learning rates
			if (typeof this.learningRateCounter[String(cert.learning_rate)] == "number") { this.learningRateCounter[String(cert.learning_rate)] += 1 }
			else { this.learningRateCounter["Unknown"] += 1 }

			// Update the loss
			if (typeof this.lossCounter[cert.loss] == "number") { this.lossCounter[cert.loss] += 1 }
			else { this.lossCounter["Unknown"] += 1 }

			// Update the network type
			if (cert.id.includes("DNN")) { this.networkTypeCounter["DNN"] += 1 }
			else if (cert.id.includes("CDNN_MP")) { this.networkTypeCounter["CDNN_MP"] += 1 }
			else if (cert.id.includes("CDNN")) { this.networkTypeCounter["CDNN"] += 1 }
			else if (cert.id.includes("CLSTM_MP")) { this.networkTypeCounter["CLSTM_MP"] += 1 }
			else if (cert.id.includes("CLSTM")) { this.networkTypeCounter["CLSTM"] += 1 }
			else if (cert.id.includes("LSTM")) { this.networkTypeCounter["LSTM"] += 1 }
			else { this.networkTypeCounter["Unknown"] += 1 }

			// Update the network series
			if (cert.id.includes("S2")) { this.networkSeriesCounter["S2"] += 1 }
			else if (cert.id.includes("S3")) { this.networkSeriesCounter["S3"] += 1 }
			else if (cert.id.includes("S4")) { this.networkSeriesCounter["S4"] += 1 }
			else if (cert.id.includes("S5")) { this.networkSeriesCounter["S5"] += 1 }
			else { this.networkSeriesCounter["Unknown"] += 1 }

			// Update the network capacities
			const capacity: string = cert.keras_model_config.units!.join("_");
			if (typeof this.networkCapacityCounter[capacity] == "number") { this.networkCapacityCounter[capacity] += 1 }
			else { this.networkCapacityCounter[capacity] = 1 }
		}

		// Build the optimizer hyperparams
		this.optimizer = this._chart.getBarChartOptions(
			{
				series: [
					{ name: "Adam", data: [ this.optimizerCounter["Adam"] ] },
					{ name: "RMSprop", data: [ this.optimizerCounter["RMSprop"] ] },
					{ name: "Unknown", data: [ this.optimizerCounter["Unknown"] ] }
				], 
				colors: [ "#311B92", "#512DA8", "#9E9E9E" ],
				xaxis: {categories: [ "Optimizer" ], labels: {show: false}},
				yaxis: {labels: {show: false}},
				plotOptions: { bar: { horizontal: false, borderRadius: 4, columnWidth: "25%"}},
			}, 
			[ "Optimizer" ], 
			this.gridChartHeight
		)
		

		// Build the learning rates hyperparams
		this.learningRate = this._chart.getBarChartOptions(
			{
				series: [
					{ name: "-1", data: [ this.learningRateCounter["-1"] ] },
					{ name: "0.001", data: [ this.learningRateCounter["0.001"]  ] },
					{ name: "0.0001", data: [ this.learningRateCounter["0.0001"]  ] },
					{ name: "Unknown", data: [ this.learningRateCounter["Unknown"]  ] }
				], 
				colors: [ "#0D47A1", "#1976D2", "#2196F3", "#64B5F6", "#9E9E9E" ],
				xaxis: {categories: [ "Learning Rate" ], labels: {show: false}},
				yaxis: {labels: {show: false}},
				plotOptions: { bar: { horizontal: false, borderRadius: 4, columnWidth: "25%"}},
			}, 
			[ "Learning Rate" ], 
			this.gridChartHeight
		)


		// Build the loss hyperparams
		let lossSeries: any[] = [];
		for (let lossKey in this.lossCounter) { lossSeries.push({ name: lossKey, data: [ this.lossCounter[lossKey] ] }) }
		this.loss = this._chart.getBarChartOptions(
			{
				series: lossSeries, 
				colors: [ "#B71C1C", "#D32F2F", "#9E9E9E" ],
				xaxis: {categories: [ "Loss" ], labels: {show: false}},
				yaxis: {labels: {show: false}},
				plotOptions: { bar: { horizontal: false, borderRadius: 4, columnWidth: "25%"}},
			}, 
			[ "Loss" ], 
			this.gridChartHeight
		)


		// Build the network type hyperparams
		this.networkType = this._chart.getBarChartOptions(
			{
				series: [
					{ name: "DNN", data: [ this.networkTypeCounter["DNN"] ] },
					{ name: "CDNN", data: [ this.networkTypeCounter["CDNN"] ] },
					{ name: "CDNN_MP", data: [ this.networkTypeCounter["CDNN_MP"] ] },
					{ name: "LSTM", data: [ this.networkTypeCounter["LSTM"] ] },
					{ name: "CLSTM", data: [ this.networkTypeCounter["CLSTM"] ] },
					{ name: "CLSTM_MP", data: [ this.networkTypeCounter["CLSTM_MP"] ] },
					{ name: "Unknown", data: [ this.networkTypeCounter["Unknown"] ] }
				], 
				colors: [ "#004D40", "#00695C", "#00796B", "#00897B", "#009688", "#26A69A", "#9E9E9E" ],
				xaxis: {categories: [ "Network Type" ], labels: {show: false}},
				yaxis: {labels: {show: false}},
				plotOptions: { bar: { horizontal: false, borderRadius: 4, columnWidth: "20%"}},
			}, 
			[ "Network Type" ], 
			180
		)


		// Build the network series hyperparams
		this.networkSeries = this._chart.getBarChartOptions(
			{
				series: [
					{ name: "S2", data: [ this.networkSeriesCounter["S2"] ] },
					{ name: "S3", data: [ this.networkSeriesCounter["S3"] ] },
					{ name: "S4", data: [ this.networkSeriesCounter["S4"] ] },
					{ name: "S5", data: [ this.networkSeriesCounter["S5"] ] },
					{ name: "Unknown", data: [ this.networkSeriesCounter["Unknown"] ] }
				], 
				colors: [ "#1B5E20", "#388E3C", "#4CAF50", "#81C784", "#9E9E9E" ],
				xaxis: {categories: [ "Network Series" ], labels: {show: false}},
				yaxis: {labels: {show: false}},
				plotOptions: { bar: { horizontal: false, borderRadius: 4, columnWidth: "40%"}},
			}, 
			[ "Network Series" ], 
			this.gridChartHeight
		)

		// Build the network capacity hyperparams
		let capacityIDs: string[] = [];
		let capacityCounts: number[] = []
		for (let cap in this.networkCapacityCounter) { 
			capacityIDs.push(cap);
			capacityCounts.push(this.networkCapacityCounter[cap]);
		}
		this.networkCapacity = this._chart.getBarChartOptions(
			{
				series: [{name: "Capacity Counts", data: capacityCounts, color: "#000000"}],
			}, 
			capacityIDs, 
			this._chart.calculateChartHeight(140, 30, capacityIDs.length, 1)
		)
	}





	
	ngOnDestroy(): void {
		if (this.layoutSub) this.layoutSub.unsubscribe();
	}
}
