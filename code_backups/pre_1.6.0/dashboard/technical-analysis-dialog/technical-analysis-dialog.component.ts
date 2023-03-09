import { Component, OnInit, Inject } from '@angular/core';
import {MatDialogRef, MAT_DIALOG_DATA} from "@angular/material/dialog";
import { ITAIntervalID, ITAIntervalState, ITAIntervalStateResult, MarketStateService, UtilsService } from '../../../core';
import { AppService, ILayout, NavService } from '../../../services';
import { ITechnicalAnalysisDialogComponent, IActionPercentages, IIndicatorGridItem, IIndicatorGridClass } from './interfaces';

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

	// Charts
	public summaryPercentages!: IActionPercentages;
	public oscillators!: IActionPercentages;
	public movingAverages!: IActionPercentages;

	// Grid
	public items: IIndicatorGridItem[] = [];
	public gridColumns: number = this._app.layout.value == "desktop" ? 6: 4;
	private readonly gridItemClass: {[action: string]: IIndicatorGridClass} = {
		"SELL": "sell-grid-item",
		"NEUTRAL": "neutral-grid-item",
		"BUY": "buy-grid-item",
	}

	// Tabs
	public activeIndex: number = 0;

	// Load state
	public loaded: boolean = false;

	constructor(
		public dialogRef: MatDialogRef<TechnicalAnalysisDialogComponent>,
		@Inject(MAT_DIALOG_DATA) public intervalID: ITAIntervalID,
		public _nav: NavService,
		public _app: AppService,
		public _ms: MarketStateService,
		private _utils: UtilsService
	) { }

	async ngOnInit(): Promise<void> {
		try {
			// Populate the core properties
			this.intervalState = await this._ms.getTAIntervalState(this.intervalID);

			// Build the percentage charts
			this.summaryPercentages = this.calculateActionPercentages(this.intervalState.s);

			// Build the grid items
			this.items = this.buildGridItems();
		} catch (e) { this._app.error(e) }
		this.loaded = true;
	}







	/**
	 * Builds the percentages represented by each action.
	 * @param res 
	 * @returns IActionPercentages
	 */
	private calculateActionPercentages(res: ITAIntervalStateResult): IActionPercentages {
		const total: number = res.s + res.n + res.b;
		return {
			s: <number>this._utils.calculatePercentageOutOfTotal(res.s, total),
			n: <number>this._utils.calculatePercentageOutOfTotal(res.n, total),
			b: <number>this._utils.calculatePercentageOutOfTotal(res.b, total),
		}
	}






	/**
	 * Builds all the indicator grid items.
	 * @returns IIndicatorGridItem[]
	 */
	private buildGridItems(): IIndicatorGridItem[] {
		return [
			// Oscillators
			{ name: "RSI (14)", class: this.gridItemClass[this.intervalState.p.rsi_14.a] },
			{ name: "CCI (20)", class: this.gridItemClass[this.intervalState.p.cci_20.a] },
			{ name: "ADX (14)", class: this.gridItemClass[this.intervalState.p.adx_14.a] },
			{ name: "AO", class: this.gridItemClass[this.intervalState.p.ao.a] },
			{ name: "MOM (10)", class: this.gridItemClass[this.intervalState.p.mom_10.a] },
			{ name: "MACD (12, 26, 9)", class: this.gridItemClass[this.intervalState.p.macd_12_26_9.a] },
			{ name: "STOCH (14, 1, 3)", class: this.gridItemClass[this.intervalState.p.stoch_14_1_3.a] },
			{ name: "STOCHRSI (14)", class: this.gridItemClass[this.intervalState.p.stochrsi_14.a] },
			{ name: "WILLR (14)", class: this.gridItemClass[this.intervalState.p.willr_14.a] },
			{ name: "ULTOSC (7, 14, 28)", class: this.gridItemClass[this.intervalState.p.ultosc_7_14_28.a] },

			// Moving Averages
			{ name: "EMA (10)", class: this.gridItemClass[this.intervalState.p.ema_10.a] },
			{ name: "EMA (20)", class: this.gridItemClass[this.intervalState.p.ema_20.a] },
			{ name: "EMA (30)", class: this.gridItemClass[this.intervalState.p.ema_30.a] },
			{ name: "EMA (50)", class: this.gridItemClass[this.intervalState.p.ema_50.a] },
			{ name: "EMA (100)", class: this.gridItemClass[this.intervalState.p.ema_100.a] },
			{ name: "EMA (200)", class: this.gridItemClass[this.intervalState.p.ema_200.a] },
			{ name: "SMA (10)", class: this.gridItemClass[this.intervalState.p.sma_10.a] },
			{ name: "SMA (20)", class: this.gridItemClass[this.intervalState.p.sma_20.a] },
			{ name: "SMA (30)", class: this.gridItemClass[this.intervalState.p.sma_30.a] },
			{ name: "SMA (50)", class: this.gridItemClass[this.intervalState.p.sma_50.a] },
			{ name: "SMA (100)", class: this.gridItemClass[this.intervalState.p.sma_100.a] },
			{ name: "SMA (200)", class: this.gridItemClass[this.intervalState.p.sma_200.a] },
			{ name: "HMA (9)", class: this.gridItemClass[this.intervalState.p.hma_9.a] },
		]
	}




	/**
	 * Displays the technical analysis tooltip.
	 */
	public displayTooltip(): void {
		this._nav.displayTooltip("Technical Analysis", [
            `Epoca calculates a series of oscillators and moving averages for the most popular intervals every 
			~10 seconds. The results of these calculations are put through an interpreter based on TradingView. 
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
