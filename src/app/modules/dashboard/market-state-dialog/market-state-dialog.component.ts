import { Component, OnInit, Inject } from '@angular/core';
import {MatDialogRef, MAT_DIALOG_DATA} from "@angular/material/dialog";
import { ApexAnnotations, YAxisAnnotations } from 'ng-apexcharts';
import * as moment from "moment";
import { 
	ICoinState,
	ISplitStateID, 
	ISplitStates, 
	ISplitStateSeriesItem, 
	IStateType, 
	IVolumeState, 
	IVolumeStateIntensity, 
	MarketStateService, 
	UtilsService 
} from '../../../core';
import { AppService, ChartService, IBarChartOptions, ILayout, ILineChartOptions, NavService } from '../../../services';
import { IMarketStateDialogComponent, IMarketStateDialogConfig, IMarketStateModule } from './interfaces';

@Component({
  selector: 'app-market-state-dialog',
  templateUrl: './market-state-dialog.component.html',
  styleUrls: ['./market-state-dialog.component.scss']
})
export class MarketStateDialogComponent implements OnInit, IMarketStateDialogComponent {
	// Layout
	private layout: ILayout = this._app.layout.value;

	// Module
	public module!: IMarketStateModule;

	// Active Split
	public activeSplitID: ISplitStateID = "s100";
	public stateAverage!: IStateType;
	public states!: ISplitStates;
	private series!: ISplitStateSeriesItem[];
	private seriesName!: string;
	public lineChart?: ILineChartOptions;

	// Volume
	public volumeState?: IVolumeState;
	public volumeChart?: IBarChartOptions;

	// Helpers
	public title!: string;

	// Component Init
	public loaded: boolean = false;

	constructor(
		public dialogRef: MatDialogRef<MarketStateDialogComponent>,
		@Inject(MAT_DIALOG_DATA) private config: IMarketStateDialogConfig,
		private _app: AppService,
		private _chart: ChartService,
		public _ms: MarketStateService,
		private _utils: UtilsService,
		private _nav: NavService
	) { }



	async ngOnInit(): Promise<void> {
		try {
			// Set the module
			this.module = this.config.module;

			// Set the active split id if provided
			if (this.config.split) this.activeSplitID = this.config.split;
			
			// Initialize the component based on the module
			if (this.module == "window") { this.initWindow() }
			else if (this.module == "trend") { this.initTrend() }
			else if (this.module == "volume") { await this.initVolume() }
			else if (this.module == "coin") { await this.initCoin() }
			else if (this.module == "coinBTC") { await this.initCoinBTC() }
		} catch (e) {
			this._app.error(e);
			setTimeout(() => { this.close() }, 500);
		}
		this.loaded = true;
	}






	/**********
	 * Window *
	 **********/





	private initWindow(): void {
		// Set the title
		this.title = "Window";

		// Set the state average
		this.stateAverage = this.config.windowState!.s;

		// Set the splits
		this.states = this.config.windowState!.ss;

		// Build the series
		this.seriesName = "USDT";
		this.series = this.config.windowState!.w.map((c) => { return { x: c.ot, y: c.c }});

		// Finally, apply the split
		this.applySplit(this.activeSplitID);
	}








	/*********
	 * Trend *
	 *********/





	private initTrend(): void {
		// Set the title
		this.title = "Trend";

		// Set the state average
		this.stateAverage = this.config.trendState!.s;

		// Set the splits
		this.states = this.config.trendState!.ss;

		// Build the series
		this.seriesName = "Trend Sum";
		this.series = this.config.trendState!.w.map((c) => { return { x: c.ot, y: c.c }});

		// Finally, apply the split
		this.applySplit(this.activeSplitID);
	}




	/**
	 * Builds the annotations for the trend chart.
	 * @returns ApexAnnotations
	 */
	private buildTrendAnnotations(): ApexAnnotations {
		return { yaxis: [
                // Uptrend backgrounds
                this.buildTrendSumAnnotation(0, 1, "#E0F2F1"),
                this.buildTrendSumAnnotation(1, 2, "#80CBC4"),
                this.buildTrendSumAnnotation(2, 3, "#4DB6AC"),
                this.buildTrendSumAnnotation(3, 4, "#26A69A"),
                this.buildTrendSumAnnotation(4, 5, "#009688"),
                this.buildTrendSumAnnotation(5, 6, "#00897B"),
                this.buildTrendSumAnnotation(6, 7, "#00796B"),
                this.buildTrendSumAnnotation(7, 20, "#004D40"),

                // Downtrend Backgrounds
                this.buildTrendSumAnnotation(0, -1, "#FFEBEE"),
                this.buildTrendSumAnnotation(-1, -2, "#EF9A9A"),
                this.buildTrendSumAnnotation(-2, -3, "#E57373"),
                this.buildTrendSumAnnotation(-3, -4, "#EF5350"),
                this.buildTrendSumAnnotation(-4, -5, "#F44336"),
                this.buildTrendSumAnnotation(-5, -6, "#E53935"),
                this.buildTrendSumAnnotation(-6, -7, "#D32F2F"),
                this.buildTrendSumAnnotation(-7, -20, "#B71C1C")
		]}
	}
    private buildTrendSumAnnotation(y: number, y2: number, color: string): YAxisAnnotations {
        return {
            y: y,
            y2: y2,
            borderColor: color,
            fillColor: color,
            strokeDashArray: 0
        };
    }














	/********
	 * Coin *
	 ********/





	public async initCoin(): Promise<void> {
		// Set the title
		this.title = this.config.symbol!;

		// Retrieve the coin's state
		const state: ICoinState = await this._ms.getCoinFullState(this.config.symbol!, false);
		
		// Set the state average
		this.stateAverage = state.s;

		// Set the splits
		this.states = state.ss;

		// Build the series
		this.seriesName = "USDT";
		this.series = state.w;

		// Finally, apply the split
		this.applySplit(this.activeSplitID);
	}







	public async initCoinBTC(): Promise<void> {
		// Set the title
		this.title = this.config.symbol!;

		// Retrieve the coin's state
		const state: ICoinState = await this._ms.getCoinFullState(this.config.symbol!, true);
		
		// Set the state average
		this.stateAverage = state.s;

		// Set the splits
		this.states = state.ss;

		// Build the series
		this.seriesName = "BTC";
		this.series = state.w;

		// Finally, apply the split
		this.applySplit(this.activeSplitID);
	}












	/* Series Split */



	/**
	 * Applies a given split to the series and builds the chart.
	 * @param id 
	 */
	public applySplit(id: ISplitStateID): void {
		//if (this.lineChart && this.activeSplitID == id) return;
		this.lineChart = this._chart.getLineChartOptions(
			{ 
				series: [
					{
						name: this.seriesName, 
						data: this.series.slice(this.series.length - Math.ceil(this.series.length * this.getSplitByID(id))), 
						color: this.getChartColor(this.states[id].s)
					}
				],
				stroke: { curve: "straight", width: 3 },
				xaxis: {type: "datetime",tooltip: {enabled: true}, labels: {datetimeUTC: false}}
			},
			this.layout == "desktop" ? 400: 360, 
			undefined,
			undefined
		);
		this.activeSplitID = id;
		if (this.module == "trend") this.lineChart!.annotations = this.buildTrendAnnotations();
	}





	/**
	 * Retrieves the color to be used on the line chart.
	 * @param state 
	 * @returns string
	 */
	private getChartColor(state: IStateType): string { 
		switch (state) {
			case 2:
				return this._chart.upwardColor;
			case 1:
				return "#26A69A";
			case -1:
				return "#EF5350";
			case -2:
				return this._chart.downwardColor
			default:
				return this._chart.neutralColor
		}
	}



	/**
	 * Returns the split to be applied to the series based on the ID.
	 * @param id 
	 * @returns number
	 */
	private getSplitByID(id: ISplitStateID): number {
		switch (id) {
			case "s75":
				return 0.75;
			case "s50":
				return 0.5;
			case "s25":
				return 0.25;
			case "s15":
				return 0.15;
			case "s10":
				return 0.1;
			case "s5":
				return 0.05;
			case "s2":
				return 0.02;
			default:
				return 1;
		}
	}












	/**********
	 * Volume *
	 **********/


	public async initVolume(): Promise<void> {
		// Set the title
		this.title = "Volume";
		
		// Retrieve the volume state
		this.volumeState = await this._ms.getFullVolumeState();
		let maxValue: number;
		if (this.volumeState.v < this.volumeState.m) {
			maxValue = <number>this._utils.alterNumberByPercentage(this.volumeState.m, 30);
		} else {
			maxValue = <number>this._utils.alterNumberByPercentage(this.volumeState.v, 50);
		}

		// Set the state average
		this.stateAverage = this.volumeState.s > 0 ? 1: 0;

        // Build the chart
		this.volumeChart = this._chart.getBarChartOptions(
			{ 
				series: [ { 
					name: "USDT", 
					data: [<number>this._utils.outputNumber(this.volumeState.v, {dp: 0})], 
					color: this.getVolumeChartColor(this.volumeState.s)
				}],
				xaxis: {categories: ["USDT Vol."], labels: {show: false}},
				yaxis: {labels: {show: true}},
				plotOptions: { bar: { horizontal: false, distributed: true, borderRadius: 4, columnWidth: "15%"}},
			},
			["USDT Vol."],
			this.layout == "desktop" ? 400: 360,
			false,
			true,
			{min: 0, max: maxValue},
			{
				yaxis: [
					{
						y: <number>this._utils.outputNumber(this.volumeState.m, {dp: 0}),
						y2: <number>this._utils.outputNumber(this.volumeState.mh, {dp: 0}),
						borderColor: "#26A69A",
						fillColor: "#26A69A",
						strokeDashArray: 0,
						borderWidth: 0
					},
					{
						y: <number>this._utils.outputNumber(this.volumeState.mm, {dp: 0}),
						y2: <number>this._utils.outputNumber(this.volumeState.mh, {dp: 0}),
						borderColor: "#00796B",
						fillColor: "#00796B",
						strokeDashArray: 0,
						borderWidth: 0
					},
					{
						y: <number>this._utils.outputNumber(this.volumeState.mh, {dp: 0}),
						y2: <number>this._utils.outputNumber(this.volumeState.mh*100, {dp: 0}),
						borderColor: "#004D40",
						fillColor: "#004D40",
						strokeDashArray: 0,
						borderWidth: 0
					},
				]
			}
		);
		this.volumeChart.chart.zoom = {enabled: false};
	}





	/**
	 * Retrieves the color to be used on the line chart.
	 * @param state 
	 * @returns string
	 */
	private getVolumeChartColor(state: IVolumeStateIntensity): string { 
		switch (state) {
			case 3:
				return "#004D40";
			case 2:
				return this._chart.upwardColor;
			case 1:
				return "#26A69A";
			default:
				return this._chart.neutralColor
		}
	}






	/****************
	 * Misc Helpers *
	 ****************/






	/**
	 * Displays the Info Tooltip.
	 */
	public displayInfoTooltip(): void {
		// Init values
		let windowStart: number = 0;
		let windowEnd: number = 0;
		let itemsInWindow: number = 0;
		let currentValue: number = 0;

		// Handle the volume
		if (this.module == "volume") {
			currentValue = this.volumeState!.v;
		} 
		
		// Handle the rest
		else {
			windowStart = this.series[0].x;
			windowEnd = this.series[this.series.length - 1].x;
			itemsInWindow = this.series.length;
			currentValue = this.series[this.series.length - 1].y;
		}

		// Init the content
		let content: string[] = [
			`CURRENT VALUE`,
			this._utils.formatNumber(currentValue, 8)
		];

		// Add the date range if available
		if (windowStart && windowEnd) {
			content.push(`------`);
			content.push(`RANGE (${itemsInWindow} items)`);
			content.push(`${moment(windowStart).format("dddd, MMMM Do, h:mm:ss a")}`);
			content.push(`${moment(windowEnd).format("dddd, MMMM Do, h:mm:ss a")}`);
		}

		// If it is the volume, add the mean and mean high values
		if (this.volumeState) {
			content.push("-----");
			content.push("VOLUME REQUIREMENTS");
			content.push(`Mean: $${this._utils.formatNumber(this.volumeState.m)}`);
			content.push(`Mean Medium: $${this._utils.formatNumber(this.volumeState.mm)}`);
			content.push(`Mean High: $${this._utils.formatNumber(this.volumeState.mh)}`);
		};

		// Finally, display the tooltip
        this._nav.displayTooltip(this.title, content);
	}



	/**
	 * Displays the Market State Module Tooltip.
	 */
	public displayTooltip(): void {
        this._nav.displayTooltip("Market State", [
			`@TODO`,
        ]);
	}





	// Close Dialog
	public close(): void { this.dialogRef.close() }
}
