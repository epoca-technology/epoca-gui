import { Component, OnInit, Inject } from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from "@angular/material/dialog";
import { 
	IExchangeLongShortRatioID, 
	IExchangeLongShortRatioState, 
	IExchangeOpenInterestID, 
	IExchangeOpenInterestState, 
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
		private _utils: UtilsService
	) { }



	async ngOnInit(): Promise<void> {
		try {
			// Set the module
			this.module = this.config.module;

			// Set the active split id if provided
			if (this.config.split) this.activeSplitID = this.config.split;
			
			// Initialize the component based on the module
			if (this.module == "window") { this.initWindow() }
			else if (this.module == "volume") { await this.initVolume() }
			else if (this.module == "open_interest") { await this.initOpenInterest() }
			else if (this.module == "long_short_ratio") { await this.initLongShortRatio() }
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






	/*****************
	 * Open Interest *
	 *****************/


	private async initOpenInterest(): Promise<void> {
		// Set the title
		this.title = `${this._ms.openInterestExchangeNames[this.config.exchangeID]} Open Interest`;

		// Retrieve the state
		const state: IExchangeOpenInterestState = await this._ms.getOpenInterestStateForExchange(<IExchangeOpenInterestID>this.config.exchangeID);

		// Set the state average
		this.stateAverage = state.s;

		// Set the splits
		this.states = state.ss;

		// Build the series
		this.seriesName = "USDT";
		this.series = state.w.map(item => { return { x: item.x, y: Math.round(item.y)}});

		// Finally, apply the split
		this.applySplit(this.activeSplitID);
	}






	/********************
	 * Long/Short Ratio *
	 ********************/


	private async initLongShortRatio(): Promise<void> {
		// Set the title
		this.title = `${this._ms.longShortRatioExchangeNames[this.config.exchangeID]} Long/Short Ratio`;

		// Retrieve the state
		const state: IExchangeLongShortRatioState = await this._ms.getLongShortRatioStateForExchange(<IExchangeLongShortRatioID>this.config.exchangeID);

		// Set the state average
		this.stateAverage = state.s;

		// Set the splits
		this.states = state.ss;

		// Build the series
		this.seriesName = "Ratio";
		this.series = state.w.map(d => { return { x: d.x, y: <number>this._utils.outputNumber(d.y, {dp: 6})}});
		
		// Finally, apply the split
		this.applySplit(this.activeSplitID);
	}








	/****************
	 * Series Split *
	 ****************/



	/**
	 * Applies a given split to the series and builds the chart.
	 * @param id 
	 */
	public applySplit(id: ISplitStateID): void {
		if (this.lineChart && this.activeSplitID == id) return;
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
			this.layout == "desktop" ? 400: 250, 
			undefined,
			undefined
		);
		this.activeSplitID = id;
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
			this.layout == "desktop" ? 400: 350,
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


	// Close Dialog
	public close(): void { this.dialogRef.close() }
}