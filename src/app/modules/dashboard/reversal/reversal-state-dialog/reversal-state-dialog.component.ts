import { Component, OnInit, Inject } from '@angular/core';
import {MatDialogRef, MAT_DIALOG_DATA, MatDialog} from "@angular/material/dialog";
import * as moment from "moment";
import { 
	ICoinsCompressedState,
	IKeyZoneStateEvent,
	IReversalCoinsStates,
	IReversalState, 
	ISplitStateSeriesItem, 
	LocalDatabaseService, 
	MarketStateService, 
	UtilsService 
} from '../../../../core';
import { 
	AppService, 
	ChartService, 
	IBarChartOptions, 
	ILayout, 
	ILineChartOptions, 
	NavService,
} from '../../../../services';
import { CoinsStateSummaryDialogComponent, ICoinsStateSummaryConfig } from '../../coins';
import { IReversalStateDialogComponent, IReversalStateUnpackedScore } from './interfaces';

@Component({
  selector: 'app-reversal-state-dialog',
  templateUrl: './reversal-state-dialog.component.html',
  styleUrls: ['./reversal-state-dialog.component.scss']
})
export class ReversalStateDialogComponent implements OnInit, IReversalStateDialogComponent {
	// Layout
	public layout: ILayout = this._app.layout.value;

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
		await this.syncReversalState();
		this.loaded = true;
		setTimeout(() => {this.updateCharts();});
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
			this.color = this.state.k == 1 ? this._chart.upwardColor: this._chart.downwardColor;

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
    public displayKeyZoneEventInfoDialog(): void {
		const evt: IKeyZoneStateEvent = this.state.kze!;
		const zoneSize: number = <number>this._utils.calculatePercentageChange(evt.kz.s, evt.kz.e);
		let title: string = evt.k == "s" ? "Support": "Resistance";
		this._nav.displayTooltip(`${title}: ${evt.kz.scr}/10`, [
			`ID: ${evt.kz.id}`,
			`${moment(evt.kz.id).format("dddd, MMMM Do, h:mm:ss a")}`,
			`-----`,
			`RANGE ${zoneSize}%`,
			`$${this._utils.formatNumber(evt.kz.s)} - $${this._utils.formatNumber(evt.kz.e)}`,
			`-----`,
			`EVENT ISSUANCE`,
			`${moment(evt.t).format("dddd, MMMM Do, h:mm:ss a")}`,
			`-----`,
			`EXPIRATION`,
			`${moment(evt.e).format("dddd, MMMM Do, h:mm:ss a")}`,
			`Price ${evt.k == 's' ? '>': '<'} $${this._utils.formatNumber(evt.pl)}`,
			`-----`,
			`VOL. INTENSITY: ${evt.kz.vi}/4`,
			`-----`,
			`LIQ. SHARE: ${evt.kz.ls}%`,
		]);
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
			`@TODO`,
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
