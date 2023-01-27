import { Component, OnInit, Inject } from '@angular/core';
import {MatDialogRef, MAT_DIALOG_DATA} from "@angular/material/dialog";
import { IBinancePositionSide, ISignalSidePolicies, MarketStateService, SignalService } from '../../../core';
import { AppService, NavService } from '../../../services';
import { ISignalPoliciesDialogComponent } from './interfaces';
import { IPolicyChangePayload } from './signal-policy-item';

@Component({
  selector: 'app-signal-policies-dialog',
  templateUrl: './signal-policies-dialog.component.html',
  styleUrls: ['./signal-policies-dialog.component.scss']
})
export class SignalPoliciesDialogComponent implements OnInit, ISignalPoliciesDialogComponent {
	// Policies
	public policies!: ISignalSidePolicies|any;

	// Tabs
	public activeIndex: number = 0;

	// Issuance Policies
	public issuance: any;

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
		this.loaded = true;
	}










	/* Policies Update */




	/**
	 * Triggers whenever a policy item changes and sets the new value/s 
	 * accordingly.
	 * @param change 
	 */
	public valueChanged(change: IPolicyChangePayload): void {
		// Set the new value
		this.policies[change.category][change.policyID][change.id] = change.payload.newValue;

		// If it is the prediction state, set the intensity as well
		if (change.id == "trend_state") {
			this.policies[change.category][change.policyID].trend_intensity = change.payload.newValue2;
		}
	}









	/**
	 * Displays the confirmation prompt and if approved, updates the 
	 * policies for the given side.
	 */
	public updatePolicies(): void {
		this._nav.displayConfirmationDialog({
			title: `Update ${this.side} Policies`,
			content: `<p class="align-center">Are you sure that you wish to <strong>update</strong> the current ${this.side} Issuance & Cancellation Policies?</p>`,
			otpConfirmation: true
		}).afterClosed().subscribe(
			async (otp: string|undefined) => {
				if (otp) {
					// Set Submission State
					this.loaded = false;
					try {
						// Set new version
						await this._signal.updatePolicies(this.side, this.policies, otp);

						// Notify
						this._app.success("The policies has been updated successfully.");
					} catch(e) { this._app.error(e) }

					// Set Submission State
					this.loaded = true;
				}
			}
		);
	}










	/* Misc Helpers */



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
