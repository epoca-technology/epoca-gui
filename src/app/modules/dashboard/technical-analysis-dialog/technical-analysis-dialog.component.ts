import { Component, OnInit, Inject } from '@angular/core';
import {MatDialogRef, MAT_DIALOG_DATA} from "@angular/material/dialog";
import { ITAIntervalID, ITAIntervalState, ITAIntervalStateResult, MarketStateService, UtilsService } from '../../../core';
import { AppService, ILayout, NavService } from '../../../services';
import { ITechnicalAnalysisDialogComponent, IActionPercentages } from './interfaces';

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
	public summary!: IActionPercentages;
	public oscillators!: IActionPercentages;
	public movingAverages!: IActionPercentages;

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

			// Build the charts
			this.summary = this.calculateActionPercentages(this.intervalState.s);
			this.oscillators = this.calculateActionPercentages(this.intervalState.o);
			this.movingAverages = this.calculateActionPercentages(this.intervalState.m);
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
