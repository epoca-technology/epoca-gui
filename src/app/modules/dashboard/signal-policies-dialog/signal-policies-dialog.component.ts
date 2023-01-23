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
            `When a new prediction is generated, it is put through the signal policies. If the model generated a non-neutral prediction or 
            an issuance policy is triggered, it is put through the cancellation policies.`,
        ]);
	}





	// Close Dialog
	public close(): void { this.dialogRef.close() }
}
