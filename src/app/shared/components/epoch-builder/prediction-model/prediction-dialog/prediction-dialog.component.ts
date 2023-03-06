import { Component, Inject, OnInit } from "@angular/core";
import {MatDialogRef, MAT_DIALOG_DATA} from "@angular/material/dialog";
import { BigNumber } from "bignumber.js";
import { ApexAxisChartSeries } from "ng-apexcharts";
import { 
	IPrediction, 
	IPredictionModelConfig, 
	PredictionService, 
	UtilsService 
} from "../../../../../core";
import { ChartService, IBarChartOptions, NavService } from "../../../../../services";
import { IPredictionDialogComponent, IPredictionDialogData } from "./interfaces";

@Component({
  selector: "app-prediction-dialog",
  templateUrl: "./prediction-dialog.component.html",
  styleUrls: ["./prediction-dialog.component.scss"]
})
export class PredictionDialogComponent implements OnInit, IPredictionDialogComponent {
	// Init main data
	public model!: IPredictionModelConfig;
	public prediction!: IPrediction;
	public featuresSum!: number;
	public features!: IBarChartOptions;


    constructor(
		public dialogRef: MatDialogRef<PredictionDialogComponent>,
		@Inject(MAT_DIALOG_DATA) private data: IPredictionDialogData,
		private _utils: UtilsService,
		public _nav: NavService,
		private _prediction: PredictionService,
		private _chart: ChartService
	) {}



    async ngOnInit(): Promise<void> {
		// Main Data
		this.model = this.data.model;
		this.prediction = this.data.prediction;
		this.featuresSum = <number>this._utils.outputNumber(BigNumber.sum.apply(null, this.prediction.f), { dp: 6 });

		// Build the chart
		let series: ApexAxisChartSeries = [];
		let colors: string[] = [];
		for (let i = 0; i < this.model.regressions.length; i++) {
			series.push({
				name: this.model.regressions[i].id.slice(0, 12),
				data: [ this.prediction.f[i] ]
			});
			let color: string = this._chart.neutralColor;
			if (this.prediction.f[i] > 0) { color = this._chart.upwardColor }
			if (this.prediction.f[i] < 0) { color = this._chart.downwardColor }
			colors.push(color);
		}
		this.features = this._chart.getBarChartOptions(
			{
				series: series, 
				colors: colors,
				xaxis: {categories: [ "Features" ], labels: {show: false}},
				//yaxis: {labels: {show: false}},
				plotOptions: { bar: { horizontal: false}},
			}, 
			[ "Features" ], 
			300,
			undefined,
			//true,
			//{ min: -1, max: 1}
		);
		this.features.xaxis.axisBorder = {show: false};
		const self = this;
		this.features.chart.events = {
			click: function(e: any, cc: any, c: any) {
				if (c.dataPointIndex >= 0 && c.dataPointIndex < self.model.regressions.length) {
					self._nav.displayKerasModelDialog(self.model.regressions[c.dataPointIndex])
				}
			}
		};
    }












	/* Misc Helpers */




	/*
	* Closes the dialog.
	* @returns void
	* */
	public close(): void { this.dialogRef.close() }
}
