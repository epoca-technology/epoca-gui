import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import {MatDialogRef, MatDialog, MAT_DIALOG_DATA} from "@angular/material/dialog";
import { Subscription } from 'rxjs';
import { 
	ICoinCompressedState,
	ICoinsCompressedState,
	ISplitStates, 
	IStateType, 
	MarketStateService, 
	UtilsService 
} from '../../../core';
import { AppService, ChartService, ILayout, ILineChartOptions, NavService } from '../../../services';
import { ICoinsStateSummaryConfig, ICoinsStateSummaryDialogComponent } from './interfaces';
import { IMarketStateDialogConfig, MarketStateDialogComponent } from '../market-state-dialog';

@Component({
  selector: 'app-coins-state-summary-dialog',
  templateUrl: './coins-state-summary-dialog.component.html',
  styleUrls: ['./coins-state-summary-dialog.component.scss']
})
export class CoinsStateSummaryDialogComponent implements OnInit, OnDestroy, ICoinsStateSummaryDialogComponent {
	// Layout
	public layout: ILayout = this._app.layout.value;
    private layoutSub?: Subscription;

	// Compressed Coins State
	public state!: ICoinsCompressedState;
	private symbols: string[] = [];
    public visibleSymbols: string[] = [];
    public hasMoreSymbols: boolean = true;
	public charts?: {[symbol: string]: ILineChartOptions};
	public syncEnabled: boolean = true;
	public btcPrice: boolean = false;

	// Component Init
	public loaded: boolean = false;

	constructor(
		public dialogRef: MatDialogRef<CoinsStateSummaryDialogComponent>,
		@Inject(MAT_DIALOG_DATA) private config: ICoinsStateSummaryConfig,
		private _app: AppService,
		private _chart: ChartService,
		public _ms: MarketStateService,
		private _utils: UtilsService,
		private _nav: NavService,
		private dialog: MatDialog
	) { }



	async ngOnInit(): Promise<void> {
        // Initialize layout
        this.layoutSub = this._app.layout.subscribe((nl: ILayout) => this.layout = nl);

        // Download the data
		try {
			this.syncEnabled = this.config.compressedStates == undefined;
			this.btcPrice = this.config.btcPrice == true;
			await this.initializeData(this.config.compressedStates);
		} catch (e) {
			this._app.error(e);
			setTimeout(() => { this.close() }, 500);
		}
		this.loaded = true;
	}



    ngOnDestroy(): void {
        if (this.layoutSub) this.layoutSub.unsubscribe();
    }





	/**
	 * Retrieves the compressed state and builds the charts.
	 * @returns Promise<void> 
	 */
	public async initializeData(states?: ICoinsCompressedState): Promise<void> {
		try {
			// Retrieve the state if the werent provided
			if (states) {
				this.state = states;
			} else {
				this.state = this.btcPrice ? await this._ms.getCoinsBTCCompressedState(): await this._ms.getCoinsCompressedState();
			}

			// Build the charts
			this.symbols = Object.keys(this.state.csbs);
			this.symbols.sort();
			this.charts = {};
			for (let symbol of this.symbols) {
				this.charts[symbol] = this.buildChartForSymbol(symbol, this.state.csbs[symbol]);
			}

            // Set the visible symbols if they haven't been
            if (!this.loaded) {
                const initialLotSize: number = this.layout == "desktop" ? 12: 4;
                this.visibleSymbols = this.symbols.slice(0, initialLotSize);
                this.hasMoreSymbols = this.symbols.length > this.visibleSymbols.length;
            }
		} catch (e) {
			console.log(e);
			this._app.error(e);
			setTimeout(() => { this.close() }, 500);
		}
	}










	/* Series Split */



	/**
	 * Applies a given split to the series and builds the chart.
	 * @param symbol 
	 * @param state
	 */
	private buildChartForSymbol(symbol: string, state: ICoinCompressedState): ILineChartOptions {
		// Init the chart
		const chartColor: string = this.getChartColor(state.s);
		let title: string = this._ms.getBaseAssetName(symbol);
		let lineChart: ILineChartOptions = this._chart.getLineChartOptions(
			{ 
				series: [
					{
						name: symbol, 
						data: this.buildLineSeries(state.ss), 
						color: chartColor
					}
				],
				stroke: { curve: "straight", width: 2 },
				xaxis: {tooltip: {enabled: false}, labels: { show: false}, axisTicks: {show: false}, axisBorder: {show: false}},
				yaxis: {tooltip: {enabled: false}, labels: { show: false}, axisTicks: {show: false}},
				dataLabels: {enabled: false}
			},
			this.layout == "desktop" ? 150: 150, 
			undefined,
			undefined
		);
		lineChart.title = { text: title, align: "center", style: { color: chartColor}};

		// Finally, return it
		return lineChart;
	}









	/**
	 * Given the split states object, it builds the sequence
	 * that should resemble the real chart.
	 * @param ss 
	 */
	private buildLineSeries(ss: ISplitStates): number[] {
		// Init the current value (scaled)
		const current: number = 1;

		// Return the list
		return [
			this.calculateSplitValue(current, ss.s100.c),
			this.calculateSplitValue(current, ss.s75.c),
			this.calculateSplitValue(current, ss.s50.c),
			this.calculateSplitValue(current, ss.s25.c),
			this.calculateSplitValue(current, ss.s15.c),
			this.calculateSplitValue(current, ss.s10.c),
			this.calculateSplitValue(current, ss.s5.c),
			this.calculateSplitValue(current, ss.s5.c),
			current
		]
	}
	private calculateSplitValue(current: number, change: number): number {
		return <number>this._utils.alterNumberByPercentage(current, -(change), {ru: true, dp: 8});
	}







	/**
	 * Retrieves the color to be used on the line chart.
	 * @param state 
	 * @returns string
	 */
	private getChartColor(state: IStateType): string { 
		switch (state) {
			case 2:
				return this._ms.colors.increase_2;
			case 1:
				return this._ms.colors.increase_1;
			case -1:
				return this._ms.colors.decrease_1;
			case -2:
				return this._ms.colors.decrease_2;
			default:
				return this._ms.colors.sideways;
		}
	}



















	/****************
	 * Misc Helpers *
	 ****************/





    /**
     * Shows the rest of the symbols.
     */
    public showAllSymbols(): void {
        this.visibleSymbols = this.symbols.slice();
        this.hasMoreSymbols = this.symbols.length > this.visibleSymbols.length;
    }






    /**
	 * Displays the coin dialog.
     * @param symbol
	 */
    public displayCoinDialog(symbol: string): void {
		this.dialog.open(MarketStateDialogComponent, {
			hasBackdrop: this._app.layout.value != "mobile",
			panelClass: "medium-dialog",
			data: <IMarketStateDialogConfig>{
                module: this.btcPrice ? "coinBTC": "coin",
                symbol: symbol
            }
		})
	}







	/**
	 * Displays the Coins State Tooltip.
	 */
	public displayTooltip(): void {
        this._nav.displayTooltip("Coins", [
			`This module aims to have a deep understanding of the short-term price direction for the top cryptocurrencies. `,
			`Epoca establishes a WebSocket Connection to the "Mark Price" for all the installed cryptocurrencies and calculates their state on a real time basis for both rates, BTC and USDT. `,
			`The state is calculated the same way as it is for the Window Module. For more information, go to Dashboard/Window/Information.`,
            `Note that the charts in this section were actually built based on the state splits and not on the actual prices. This is true for both, USDT & BTC Prices.`,
            `The configuration for this module can be fully tuned in Adjustments/Coins.`
        ]);
	}





	// Close Dialog
	public close(): void { this.dialogRef.close() }
}
