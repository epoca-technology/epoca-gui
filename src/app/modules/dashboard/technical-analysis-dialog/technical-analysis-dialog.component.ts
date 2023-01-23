import { Component, OnInit, Inject } from '@angular/core';
import {MatDialogRef, MAT_DIALOG_DATA} from "@angular/material/dialog";
import { ITAIntervalID, ITAIntervalState, ITAIntervalStateResult, MarketStateService } from '../../../core';
import { AppService, ChartService, IBarChartOptions, ILayout, NavService } from '../../../services';
import { ITechnicalAnalysisDialogComponent } from './interfaces';

@Component({
  selector: 'app-technical-analysis-dialog',
  templateUrl: './technical-analysis-dialog.component.html',
  styleUrls: ['./technical-analysis-dialog.component.scss']
})
export class TechnicalAnalysisDialogComponent implements OnInit, ITechnicalAnalysisDialogComponent {
	// User's Layout
	public layout: ILayout = this._app.layout.value;
	
	// Inherited properties
	public intervalState!: ITAIntervalState;

	// Chart
	public summary!: IBarChartOptions;
	public oscillators!: IBarChartOptions;
	public movingAverages!: IBarChartOptions;

	// Tabs
	public activeIndex: number = 0;

	// Load state
	public loaded: boolean = false;

	constructor(
		public dialogRef: MatDialogRef<TechnicalAnalysisDialogComponent>,
		@Inject(MAT_DIALOG_DATA) public intervalID: ITAIntervalID,
		public _nav: NavService,
		public _app: AppService,
		private _chart: ChartService,
		public _ms: MarketStateService
	) { }

	async ngOnInit(): Promise<void> {
		try {
			// Populate the core properties
			this.intervalState = await this._ms.getTAIntervalState(this.intervalID);

			// Build the charts
			this.summary = this.buildChart("Summary", this.intervalState.s);
			this.oscillators = this.buildChart("Oscillators", this.intervalState.o);
			this.movingAverages = this.buildChart("Moving Averages", this.intervalState.m);
		} catch (e) { this._app.error(e) }
		this.loaded = true;
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
			this.layout == "desktop" ? 250: 250
		);
	}






	/**
	 * Displays the technical analysis tooltip.
	 */
	public displayTooltip(): void {
		this._nav.displayTooltip("Technical Analysis", [
            `Epoca calculates a series of oscillators and moving averages for the most popular intervals every 
			~20 seconds. The results of these calculations are put through an interpreter based on TradingView. 
			The possible outputs are:`,
			`-2 = Strong Sell`,
			`-1 = Sell`,
			` 0 = Neutral`,
			` 1 = Buy`,
			` 2 = Strong Buy`,
        ]);
	}





	// Close Dialog
	public close(): void { this.dialogRef.close() }
}
