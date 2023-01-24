import { Component, OnInit, Inject } from '@angular/core';
import {MatDialogRef, MAT_DIALOG_DATA} from "@angular/material/dialog";
import { IBinancePositionSide, ISignalSidePolicies, ITAIntervalID, ITAIntervalState, ITAIntervalStateResult, MarketStateService, SignalService } from '../../../core';
import { AppService, ChartService, IBarChartOptions, ILayout, NavService } from '../../../services';
import { ISignalPoliciesDialogComponent } from './interfaces';

@Component({
  selector: 'app-signal-policies-dialog',
  templateUrl: './signal-policies-dialog.component.html',
  styleUrls: ['./signal-policies-dialog.component.scss']
})
export class SignalPoliciesDialogComponent implements OnInit, ISignalPoliciesDialogComponent {
	// Policies
	public policies!: ISignalSidePolicies;

	// Helpers
	public min_increase_sum?: number;
	public min_decrease_sum?: number;

	// Tabs
	public activeIndex: number = 0;

	// Load state
	public loaded: boolean = false;


	constructor(
		public dialogRef: MatDialogRef<SignalPoliciesDialogComponent>,
		@Inject(MAT_DIALOG_DATA) public side: IBinancePositionSide,
		public _nav: NavService,
		public _app: AppService,
		private _signal: SignalService,
		public _ms: MarketStateService
	) { }

	async ngOnInit(): Promise<void> {
		try {
			this.policies = await this._signal.getPolicies(this.side);
		} catch (e) { this._app.error(e) }
		if (this._app.epoch.value) {
			this.min_increase_sum = this._app.epoch.value.model.min_increase_sum;
			this.min_decrease_sum = this._app.epoch.value.model.min_decrease_sum;
		}
		this.loaded = true;
	}







	/**
	 * Displays the Signal Module Tooltip.
	 */
	public displayTooltip(): void {
        this._nav.displayTooltip("Signal Policies", [
            `Every time the model predicts, the results and the current market state are put through 
			the issuance policies. If a non-neutral signal is generated, it is then put through the 
			cancellation policies and if no violations are found, the position for the signal side is 
			opened (if allowed by the Trading Strategy).`,
			`The signal policies' module makes use of the following components:`,
			`1) Prediction Model:`,
			`    - Trend Sum`,
			`    - Trend State`,
			`    - Trend State Intensity`,
			`2) Market State:`,
			`    - Window State`,
			`    - Technical Analysis State`,
			`    - Open Interest State`,
			`    - Long/Short Ratio State`,
        ]);
	}





	// Close Dialog
	public close(): void { this.dialogRef.close() }
}
