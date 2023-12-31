import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import {MatDialogRef, MAT_DIALOG_DATA, MatDialog} from "@angular/material/dialog";
import * as moment from "moment";
import { Subscription } from 'rxjs';
import { 
	ICoinsCompressedState,
	IReversalCoinsStates,
	IReversalState, 
	ISplitStateSeriesItem, 
	LocalDatabaseService, 
	MarketStateService, 
	UtilsService 
} from '../../../core';
import { 
	AppService, 
	ChartService, 
	ILayout, 
	ILineChartOptions, 
	NavService,
} from '../../../services';
import { CoinsStateSummaryDialogComponent, ICoinsStateSummaryConfig } from '../coins-state-summary-dialog';
import { KeyzoneEventContextDialogComponent } from '../keyzones-dialog';
import { IReversalStateDialogComponent, IReversalStateUnpackedScore } from './interfaces';

@Component({
  selector: 'app-reversal-state-dialog',
  templateUrl: './reversal-state-dialog.component.html',
  styleUrls: ['./reversal-state-dialog.component.scss']
})
export class ReversalStateDialogComponent implements OnInit, OnDestroy, IReversalStateDialogComponent {
	// Layout
	public layout: ILayout = this._app.layout.value;
    private layoutSub?: Subscription;

	// State
	public state!: IReversalState;
	private coinsStates: IReversalCoinsStates|undefined;
	public points: number = 0;
	private color!: string;
	public chart!: ILineChartOptions;
	public coinsChart!: ILineChartOptions;
	public coinsBTCChart!: ILineChartOptions;
	public liquidityChart!: ILineChartOptions;
	public volumeChart!: ILineChartOptions;

	// Load State
	public loaded: boolean = false;



	constructor(
		public dialogRef: MatDialogRef<ReversalStateDialogComponent>,
		@Inject(MAT_DIALOG_DATA) public id: number,
		public _nav: NavService,
		public _app: AppService,
		public _ms: MarketStateService,
		private _chart: ChartService,
		private _localDB: LocalDatabaseService,
		private _utils: UtilsService,
		private dialog: MatDialog
	) { }

	async ngOnInit(): Promise<void> {
        this.layoutSub = this._app.layout.subscribe((nl: ILayout) => this.layout = nl);
		await this.syncReversalState();
		this.loaded = true;
		setTimeout(() => {this.updateCharts();});
	}


    ngOnDestroy(): void {
        if (this.layoutSub) this.layoutSub.unsubscribe();
    }



	/* Initializer */
	



	

	/**
	 * Retrieves the reversal state from the server
	 * and assembles the charts.
	 * @returns Promise<void>
	 */
	public async syncReversalState(): Promise<void> {
		try {
			// Retrieve the state
			this.state = await this._localDB.getReversalState(this.id);
			this.points = this.state.scr.g[this.state.scr.g.length - 1];

			// Set the color
			if (this.state.k == 1) {
				this.color = this.state.e ? "#004D40": "#4DB6AC";
			} else {
				this.color = this.state.e ? "#B71C1C": "#E57373";
			}

			// Update the charts
			this.updateCharts();
		} catch (e) { this._app.error(e) }
	}







	/**
	 * Unpacks the history data from the state and builds all
	 * the charts.
	 */
	private updateCharts(): void {
		// Unpack the score history
		const { general, volume, liquidity, coins, coins_btc } = this.unpackScore();

		// If the charts have already been built, update the data
		if (this.chart) {
			this.chart.series = [ {data: general}];
			this.coinsChart.series = [ {data: coins}];
			this.coinsBTCChart.series = [ {data: coins_btc}];
			this.liquidityChart.series = [ {data: liquidity}];
			this.volumeChart.series = [ {data: volume}];
		}

		// Otherwise, build them from scratch
		else {
			// Build the general chart
			this.chart = this._chart.getLineChartOptions(
				{ 
					series: [
						{ name: "General", data: general, color: this.color },
					], 
					stroke: {width: 2, curve: "straight"},
					xaxis: {type: "datetime",tooltip: {enabled: false}, labels: {datetimeUTC: false}},
					yaxis: {labels: {show: true}, tooltip: {enabled: true}},
					title: { text: "General"},
				}, 
				this.layout == "desktop" ? 450: 350
			);

			// Build the coins chart
			this.coinsChart = this._chart.getLineChartOptions(
				{ 
					series: [
						{ name: "Coins", data: coins, color: this.color }
					], 
					stroke: {width: 2, curve: "straight"},
					xaxis: {type: "datetime",tooltip: {enabled: false}, labels: {datetimeUTC: false}},
					yaxis: {labels: {show: true}, tooltip: {enabled: true}},
					title: { text: "Coins"}
				}, 
				this.layout == "desktop" ? 450: 350, 
			);

			// Build the coins btc chart
			this.coinsBTCChart = this._chart.getLineChartOptions(
				{ 
					series: [
						{ name: "CoinsBTC", data: coins_btc, color: this.color }
					], 
					stroke: {width: 2, curve: "straight"},
					xaxis: {type: "datetime",tooltip: {enabled: false}, labels: {datetimeUTC: false}},
					yaxis: {labels: {show: true}, tooltip: {enabled: true}},
					title: { text: "CoinsBTC"}
				}, 
				this.layout == "desktop" ? 450: 350, 
			);

			// Build the liquidity chart
			this.liquidityChart = this._chart.getLineChartOptions(
				{ 
					series: [
						{ name: "Liquidity", data: liquidity, color: this.color },
					], 
					stroke: {width: 2, curve: "straight"},
					xaxis: {type: "datetime",tooltip: {enabled: false}, labels: {datetimeUTC: false}},
					yaxis: {labels: {show: true}, tooltip: {enabled: true}},
					title: { text: "Liquidity"}
				}, 
				this.layout == "desktop" ? 450: 350, 
			);

			// Build the volume chart
			this.volumeChart = this._chart.getLineChartOptions(
				{ 
					series: [
						{ name: "Volume", data: liquidity, color: this.color },
					], 
					stroke: {width: 2, curve: "straight"},
					xaxis: {type: "datetime",tooltip: {enabled: false}, labels: {datetimeUTC: false}},
					yaxis: {labels: {show: true}, tooltip: {enabled: true}},
					title: { text: "Volume"}
				}, 
				this.layout == "desktop" ? 450: 350, 
			);
		}
	}










	/**
	 * When the state is loaded, the score history is unpacked and
	 * prepared to be charted.
	 * @returns IReversalStateUnpackedScore
	 */
	private unpackScore(): IReversalStateUnpackedScore {
		// Init the lists
		let general: ISplitStateSeriesItem[] = [];
		let volume: ISplitStateSeriesItem[] = [];
		let liquidity: ISplitStateSeriesItem[] = [];
		let coins: ISplitStateSeriesItem[] = [];
		let coinsBTC: ISplitStateSeriesItem[] = [];

		// Iterate over each history item
		let lastTS: number = this.state.id;
		for (let i = 0; i < this.state.scr.g.length; i++) {
			// Calculate the item's time based on the current index
			if (i > 0) lastTS = moment(lastTS).add(2.5, "seconds").valueOf();

			// Add the scores
			general.push({ x: lastTS, y:  this.state.scr.g[i] });
			volume.push({ x: lastTS, y:  this.state.scr.v[i] });
			liquidity.push({ x: lastTS, y:  this.state.scr.l[i] });
			coins.push({ x: lastTS, y:  this.state.scr.c[i] });
			coinsBTC.push({ x: lastTS, y:  this.state.scr.cb[i] });
		}

		// Pack and return the values
		return { 
			general: general,
			volume: volume,
			liquidity: liquidity,
			coins: coins,
			coins_btc: coinsBTC
		 }
	}















	/**
     * Displays the keyzone event info dialog.
     */
    public displayKeyZoneEventContextDialog(): void {
		this.dialog.open(KeyzoneEventContextDialogComponent, {
			hasBackdrop: this._app.layout.value != "mobile",
			panelClass: "large-dialog",
			data: this.state.kze
		})
    }







    /**
     * Displays the coins state dialog.
	 * @param kind
     */
    public async displayCoinsStateSummaryDialog(kind: "initial"|"event"|"final"): Promise<void> {
		// If the coins states havent been retrieved, do so
		if (!this.coinsStates) this.coinsStates = await this._localDB.getReversalCoinsStates(this.state.id, this.state.end);

		// Pick the kind
		let state: ICoinsCompressedState;
		if 		(kind == "initial") { state = this.coinsStates.initial }
		else if (kind == "event") 	{ state = this.coinsStates.event! }
		else  						{ state = this.coinsStates.final! }
		
		// Finally, display the dialog
		this.dialog.open(CoinsStateSummaryDialogComponent, {
			hasBackdrop: this._app.layout.value != "mobile",
			panelClass: "large-dialog",
			data: <ICoinsStateSummaryConfig>{
				compressedStates: state
			}
		})
    }






	/**
     * Displays the reversal event info dialog.
     */
    public displayReversalEventInfoDialog(): void {
		if (this.state.e) {
			this._nav.displayTooltip(this.state.k == 1 ? "Sup. Reversal Evt.": "Res. Reversal Evt.", [
				`EVENT TIME`,
				`${moment(this.state.e.t).format("dddd, MMMM Do, h:mm:ss a")}`,
				`-----`,
				`COINS (${this.state.e.s.length})`
			].concat(this.state.e.s));
		}
    }







	




	/* Misc Helpers */





	/**
	 * Displays the Reversal Module Tooltip.
	 */
	public displayTooltip(): void {
        this._nav.displayTooltip("Reversal", [
            `This module aims to identify when a KeyZone Contact Event (Support or Resistance) has the potential to cause a price reversal.`,
			`Whenever a KeyZone Event (support or resistance) comes into existence, the Reversal Module is activated and starts tracking the behavior of the market.`,
			`RESISTANCE CONTACT: the Reversal Module analyzes Epoca's indicators to determine if there is enough selling power for the price to reverse (decrease).`,
			`SUPPORT CONTACT: the Reversal Module analyzes Epoca's indicators to determine if there is enough buying power for the price to reverse (increase).`,
            `Each indicator has a weight and when the required points are reached, a reversal event is issued.`,
            `The configuration for this module can be fully tuned in Adjustments/Reversal.`
        ]);
	}





	/**
	 * Displays the Reversal Info Tooltip.
	 */
	public displayInfoTooltip(): void {
		this._nav.displayTooltip(this.state.k == 1 ? "Support Reversal": "Resistance Reversal", [
			`ID: ${this.state.id}`,
			`${moment(this.state.id).format("dddd, MMMM Do, h:mm:ss a")}`,
			`${this.state.end ? moment(this.state.end).format("dddd, MMMM Do, h:mm:ss a"): "Running..."}`,
			`-----`,
			`SCORE`,
			`Open: ${this.state.scr.g[0]}`,
			`High: ${this._utils.getMax(this.state.scr.g)}`,
			`Low: ${this._utils.getMin(this.state.scr.g)}`,
			`Close: ${this.state.scr.g[this.state.scr.g.length - 1]}`,
		]);
	}



	// Close Dialog
	public close(): void { this.dialogRef.close() }
}
