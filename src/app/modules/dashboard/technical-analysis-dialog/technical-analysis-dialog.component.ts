import { Component, OnInit, Inject } from '@angular/core';
import {MatDialogRef, MAT_DIALOG_DATA} from "@angular/material/dialog";
import { ITAIntervalID, ITAIntervalState, ITAIntervalStateResult, ITAState } from '../../../core';
import { AppService, ChartService, IBarChartOptions, ILayout, NavService } from '../../../services';
import { ITechnicalAnalysisDialogComponent, ITechnicalAnalysisDialogData } from './interfaces';

@Component({
  selector: 'app-technical-analysis-dialog',
  templateUrl: './technical-analysis-dialog.component.html',
  styleUrls: ['./technical-analysis-dialog.component.scss']
})
export class TechnicalAnalysisDialogComponent implements OnInit, ITechnicalAnalysisDialogComponent {
	// User's Layout
	public layout: ILayout = this._app.layout.value;
	
	// Inherited properties
	public intervalID: ITAIntervalID;
	public intervalState: ITAIntervalState;
	private state: ITAState;

	// Chart
	public summary: IBarChartOptions;
	public oscillators: IBarChartOptions;
	public movingAverages: IBarChartOptions;

	// Action Pretty Names
	public actionNames = {
		STRONG_SELL: "Strong Sell",
		SELL: "Sell",
		NEUTRAL: "Neutral",
		BUY: "Buy",
		STRONG_BUY: "Strong Buy",
	}

	// Tabs
	public activeIndex: number = 0;

	constructor(
		public dialogRef: MatDialogRef<TechnicalAnalysisDialogComponent>,
		@Inject(MAT_DIALOG_DATA) private data: ITechnicalAnalysisDialogData,
		public _nav: NavService,
		public _app: AppService,
		private _chart: ChartService
	) { 
		// Populate the core properties
		this.intervalID = this.data.id;
		this.intervalState = this.data.state[this.data.id]
		this.state = this.data.state;

		// Build the charts
		this.summary = this.buildChart("Summary", this.intervalState.s);
		this.oscillators = this.buildChart("Oscillators", this.intervalState.o);
		this.movingAverages = this.buildChart("Moving Averages", this.intervalState.m);
	}

	ngOnInit(): void {
	}





	/**
	 * Builds the TA Barchart that acts as the trading view's gauge.
	 * @param category 
	 * @param result 
	 * @returns IBarChartOptions
	 */
	private buildChart(
		category: "Oscillators"|"Summary"|"Moving Averages", 
		result: ITAIntervalStateResult
	): IBarChartOptions {
		return this._chart.getBarChartOptions(
			{
				series: [
					{ name: "Sell", data: [ result.s ] },
					{ name: "Neutral", data: [ result.n ] },
					{ name: "Buy", data: [ result.b ] }
				], 
				colors: [ this._chart.downwardColor, this._chart.neutralColor, this._chart.upwardColor ],
				xaxis: {categories: [ category ], labels: {show: false}},
				yaxis: {labels: {show: false}},
				plotOptions: { bar: { horizontal: false, borderRadius: 4, columnWidth: this.layout == "desktop" ? "40%": "70%"}},
			}, 
			[ category ], 
			this.layout == "desktop" ? 300: 300
		);
	}









	// Close Dialog
	public close(): void { this.dialogRef.close() }
}
