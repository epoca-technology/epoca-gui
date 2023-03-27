import { Component, OnInit } from '@angular/core';
import { MatDialogRef, MatDialog } from '@angular/material/dialog';
import { SignalService, ISignalPolicies, MarketStateService } from '../../../core';
import { AppService, ILayout, NavService } from '../../../services';
import { SignalRecordsDialogComponent } from './signal-records-dialog';
import { ISignalPoliciesDialogComponent } from './interfaces';

@Component({
  selector: 'app-signal-policies-dialog',
  templateUrl: './signal-policies-dialog.component.html',
  styleUrls: ['./signal-policies-dialog.component.scss']
})
export class SignalPoliciesDialogComponent implements OnInit, ISignalPoliciesDialogComponent {
	// Layout
	public layout: ILayout = this._app.layout.value;

	// Policies
	public policies!: ISignalPolicies;

	// Helpers
	public longTrendSumMenuItems = [
		{name: "Any Trend Sum", value: 0},
		{name: "Trend Sum >= 0.05", value: 0.05},
		{name: "Trend Sum >= 0.1", value: 0.1},
		{name: "Trend Sum >= 0.25", value: 0.25},
		{name: "Trend Sum >= 0.5", value: 0.5},
		{name: "Trend Sum >= 0.75", value: 0.75},
		{name: "Trend Sum >= 1", value: 1},
		{name: "Trend Sum >= 1.5", value: 1.5},
	]
	public shortTrendSumMenuItems = [
		{name: "Any Trend Sum", value: 0},
		{name: "Trend Sum <= -0.05", value: -0.05},
		{name: "Trend Sum <= -0.1", value: -0.1},
		{name: "Trend Sum <= -0.25", value: -0.25},
		{name: "Trend Sum <= -0.5", value: -0.5},
		{name: "Trend Sum <= -0.75", value: -0.75},
		{name: "Trend Sum <= -1", value: -1},
		{name: "Trend Sum <= -1.5", value: -1.5},
	]

	// Tabs
	public activeTab: number = 0;

	// Load state
	public loaded: boolean = false;

	// Submission
	public submitting: boolean = false;
	
	constructor(
		public dialogRef: MatDialogRef<SignalPoliciesDialogComponent>,
		public _app: AppService,
		private _signal: SignalService,
		public _nav: NavService,
		public _ms: MarketStateService,
        private dialog: MatDialog,
	) { }

	async ngOnInit(): Promise<void> {
		try {
			this.policies = await this._signal.getPolicies();
		} catch (e) { this._app.error(e) }
		this.loaded = true;
	}









	/**
	 * Displays the confirmation prompt and if approved, updates the 
	 * policies for the given side.
	 */
	public updatePolicies(): void {
		this._nav.displayConfirmationDialog({
			title: `Update Signal Policies`,
			content: `
				<p class="align-center">
					Are you sure that you wish to <strong>update</strong> the current Issuance & Cancellation Policies for
					both position sides?
				</p>
				<p class="light-text ts-m margin-top align-center">Keep in mind changes will take effect immediately.</p>
			`,
			otpConfirmation: true
		}).afterClosed().subscribe(
			async (otp: string|undefined) => {
				if (otp) {
					// Set Submission State
					this.submitting = true;
					try {
						// Set new version
						await this._signal.updatePolicies(this.policies, otp);

						// Notify
						this._app.success("The policies has been updated successfully.");
						setTimeout(() => { this.close()});
					} catch(e) { this._app.error(e) }

					// Set Submission State
					this.submitting = false;
				}
			}
		);
	}









	/* Misc Helpers */




    /**
     * Displays the signal records dialog.
     */
    public displaySignalRecordsDialog(): void {
		this.dialog.open(SignalRecordsDialogComponent, {
			hasBackdrop: this._app.layout.value != "mobile",
			panelClass: "medium-dialog",
			data: {}
		})
    }



	/**
	 * Displays the Signal Module Tooltip.
	 */
	public displayTooltip(): void {
        this._nav.displayTooltip("Signal Policies", [
            `@TODO`
        ]);
	}





	// Close Dialog
	public close(): void { this.dialogRef.close() }
}
