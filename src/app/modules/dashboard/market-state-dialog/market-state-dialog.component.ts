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
	public stateEvent?: IStateType;
	public stateEventTime: number|null = null; // <- Only used by the coin module
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
		this.series = this.config.trendWindow!.map((c) => { return { x: c.ot, y: c.c }});

		// Finally, apply the split
		this.applySplit(this.activeSplitID);
	}




	/**
	 * Builds the annotations for the trend chart.
	 * @returns ApexAnnotations
	 */
	private buildTrendAnnotations(): ApexAnnotations {
		const minValue: number = -this._app.epoch.value!.model.regressions.length;
        const maxValue: number = this._app.epoch.value!.model.regressions.length;
		const min_increase_sum: number = this._app.epoch.value!.model.min_increase_sum;
		const min_decrease_sum: number = this._app.epoch.value!.model.min_decrease_sum;
		return { yaxis: [
			this.buildTrendSumAnnotation(min_increase_sum, maxValue, this._chart.upwardColor),
			this.buildTrendSumAnnotation(0.000001, min_increase_sum, "#B2DFDB"),
			this.buildTrendSumAnnotation(min_decrease_sum, minValue, this._chart.downwardColor),
			this.buildTrendSumAnnotation(-0.000001, min_decrease_sum, "#FFCDD2"),
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
		const state: ICoinState = await this._ms.getCoinFullState(this.config.symbol!);
		
		// Set the state average
		this.stateAverage = state.s;

		// Set the splits
		this.states = state.ss;

		// Set the state event
		this.stateEvent = state.se;
		this.stateEventTime = state.set;

		// Build the series
		this.seriesName = "USDT";
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


	private async initVolume(): Promise<void> {
		// Set the title
		this.title = "Volume";
		
		// Retrieve the volume state
		this.volumeState = await this._ms.getFullVolumeState();

		// Set the state average
		this.stateAverage = this.volumeState.s;

        // Build the chart
		let volumes: number[] = [];
		let seriesData: ISplitStateSeriesItem[] = [];
		for (let vol of this.volumeState.w) {
			volumes.push(vol.y);
			seriesData.push({ 
				x: vol.x,
				y: <number>this._utils.outputNumber(vol.y, {dp: 0})
			});
		}
		const min: number = <number>this._utils.getMin(volumes);
		const max: number = <number>this._utils.getMax(volumes);
		this.volumeChart = this._chart.getBarChartOptions(
			{ 
				series: [ { 
					name: "USDT", 
					data: seriesData, 
					color: this.getChartColor(this.volumeState.s)
				}],
				xaxis: {type: "datetime",tooltip: {enabled: true}, labels: {datetimeUTC: false}},
				yaxis: { tooltip: { enabled: true}, axisBorder: { show: true}, axisTicks: {show: true}}
			},
			undefined,
			this.layout == "desktop" ? 400: 360,
			undefined,
			true,
			{min: min, max: max},
			{
				yaxis: [
					{
						y: this.volumeState.m,
						borderColor: this._chart.upwardColor,
						fillColor: this._chart.upwardColor,
						strokeDashArray: 2,
						borderWidth: 1
					},
					{
						y: this.volumeState.mh,
						borderColor: this._chart.upwardColor,
						fillColor: this._chart.upwardColor,
						strokeDashArray: 0,
						borderWidth: 1
					},
				]
			}
		);
		this.volumeChart.chart.zoom = {enabled: false};
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
			windowStart = this.volumeState!.w[0].x;
			windowEnd = this.volumeState!.w[this.volumeState!.w.length - 1].x;
			itemsInWindow = this.volumeState!.w.length;
			currentValue = this.volumeState!.w[this.volumeState!.w.length - 1].y;
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
			this._utils.formatNumber(currentValue),
			`------`,
			`RANGE (${itemsInWindow} items)`,
			`${moment(windowStart).format("dddd, MMMM Do, h:mm:ss a")}`,
			`${moment(windowEnd).format("dddd, MMMM Do, h:mm:ss a")}`,
		];

		// If it is the volume, add the mean and mean high values
		if (this.volumeState) {
			content.push("-----");
			content.push("VOLUME REQUIREMENTS");
			content.push(`Mean: $${this._utils.formatNumber(this.volumeState.m)}`);
			content.push(`Mean High: $${this._utils.formatNumber(this.volumeState.mh)}`);
		};

		// If it is a coin, add the state event
		if (this.module == "coin") {
			content.push("-----");
			content.push("COIN STATE EVENT");
			let kind: string = "None";
			if 		(this.stateEvent == 2) { kind = "Strong Resistance Reversal"}
			else if (this.stateEvent == 1) { kind = "Resistance Reversal"}
			else if (this.stateEvent == -1) { kind = "Support Reversal"}
			else if (this.stateEvent == -2) { kind = "Strong Support Reversal"}
			content.push(`Kind: ${kind}`);
			content.push(`Issued: ${this.stateEventTime ? moment(this.stateEventTime).format("dddd, MMMM Do, h:mm:ss a"): 'None'}`);
		};

		// Finally, display the tooltip
        this._nav.displayTooltip(this.title, content);
	}



	/**
	 * Displays the Keyzones Module Tooltip.
	 */
	public displayTooltip(): void {
        this._nav.displayTooltip("Market State", [
			`@TODO`,
        ]);
	}





	// Close Dialog
	public close(): void { this.dialogRef.close() }
}
