import { Component, OnInit } from '@angular/core';
import {MatDialogRef} from "@angular/material/dialog";
import {AbstractControl, FormControl, FormGroup, Validators} from "@angular/forms";
import { IPredictionCancellationPolicies, IPredictionCancellationPolicyItemState, SignalService } from '../../../core';
import { AppService, NavService } from '../../../services';
import { ISignalPoliciesDialogComponent } from './interfaces';

@Component({
  selector: 'app-signal-policies-dialog',
  templateUrl: './signal-policies-dialog.component.html',
  styleUrls: ['./signal-policies-dialog.component.scss']
})
export class SignalPoliciesDialogComponent implements OnInit, ISignalPoliciesDialogComponent {
    // Forms
	public longForm!: FormGroup;
	public shortForm!: FormGroup;

	// States
	public readonly taStates: IPredictionCancellationPolicyItemState[] = [
        "IGNORE", "STRONG_BUY", "STRONG_SELL"
    ];
	public readonly msStates: IPredictionCancellationPolicyItemState[] = [
        "IGNORE", "INCREASING", "DECREASING"
    ];

	// Tabs
	public activeTab: number = 0;

	// Load state
	public loaded: boolean = false;

	constructor(
		private dialogRef: MatDialogRef<SignalPoliciesDialogComponent>,
		private _signal: SignalService,
		private _nav: NavService,
		private _app: AppService
	) { }

	async ngOnInit(): Promise<void> {
		try {
			// Retrieve the current policies
			const policies: IPredictionCancellationPolicies = await this._signal.getPolicies();

			// Unpack the policies into the forms
			this.longForm = new FormGroup ({
				ta_30m: new FormControl(policies.LONG.ta_30m, [ Validators.required ]),
				ta_2h: new FormControl(policies.LONG.ta_2h, [ Validators.required ]),
				ta_4h: new FormControl(policies.LONG.ta_4h, [ Validators.required ]),
				ta_1d: new FormControl(policies.LONG.ta_1d, [ Validators.required ]),
				window: new FormControl(policies.LONG.window, [ Validators.required ]),
				volume: new FormControl(policies.LONG.volume, [ Validators.required ]),
				network_fee: new FormControl(policies.LONG.network_fee, [ Validators.required ]),
				open_interest: new FormControl(policies.LONG.open_interest, [ Validators.required ]),
				long_short_ratio: new FormControl(policies.LONG.long_short_ratio, [ Validators.required ]),
			});
			this.shortForm = new FormGroup ({
				ta_30m: new FormControl(policies.SHORT.ta_30m, [ Validators.required ]),
				ta_2h: new FormControl(policies.SHORT.ta_2h, [ Validators.required ]),
				ta_4h: new FormControl(policies.SHORT.ta_4h, [ Validators.required ]),
				ta_1d: new FormControl(policies.SHORT.ta_1d, [ Validators.required ]),
				window: new FormControl(policies.SHORT.window, [ Validators.required ]),
				volume: new FormControl(policies.SHORT.volume, [ Validators.required ]),
				network_fee: new FormControl(policies.SHORT.network_fee, [ Validators.required ]),
				open_interest: new FormControl(policies.SHORT.open_interest, [ Validators.required ]),
				long_short_ratio: new FormControl(policies.SHORT.long_short_ratio, [ Validators.required ]),
			});
		} catch (e) { this._app.error(e) }

		// Set the component as loaded
		this.loaded = true;
	}





	/* Forms Getters */
	get long_ta_30m(): AbstractControl { return <AbstractControl>this.longForm.get("ta_30m") }
	get long_ta_2h(): AbstractControl { return <AbstractControl>this.longForm.get("ta_2h") }
	get long_ta_4h(): AbstractControl { return <AbstractControl>this.longForm.get("ta_4h") }
	get long_ta_1d(): AbstractControl { return <AbstractControl>this.longForm.get("ta_1d") }
	get long_window(): AbstractControl { return <AbstractControl>this.longForm.get("window") }
	get long_volume(): AbstractControl { return <AbstractControl>this.longForm.get("volume") }
	get long_network_fee(): AbstractControl { return <AbstractControl>this.longForm.get("network_fee") }
	get long_open_interest(): AbstractControl { return <AbstractControl>this.longForm.get("open_interest") }
	get long_long_short_ratio(): AbstractControl { return <AbstractControl>this.longForm.get("long_short_ratio") }


	get short_ta_30m(): AbstractControl { return <AbstractControl>this.shortForm.get("ta_30m") }
	get short_ta_2h(): AbstractControl { return <AbstractControl>this.shortForm.get("ta_2h") }
	get short_ta_4h(): AbstractControl { return <AbstractControl>this.shortForm.get("ta_4h") }
	get short_ta_1d(): AbstractControl { return <AbstractControl>this.shortForm.get("ta_1d") }
	get short_window(): AbstractControl { return <AbstractControl>this.shortForm.get("window") }
	get short_volume(): AbstractControl { return <AbstractControl>this.shortForm.get("volume") }
	get short_network_fee(): AbstractControl { return <AbstractControl>this.shortForm.get("network_fee") }
	get short_open_interest(): AbstractControl { return <AbstractControl>this.shortForm.get("open_interest") }
	get short_long_short_ratio(): AbstractControl { return <AbstractControl>this.shortForm.get("long_short_ratio") }










	/**
	 * Presents the confirmation prompt and updates the
	 * policies.
	 */
	public updatePolicies(): void {
        if (this.longForm.valid && this.shortForm.valid) {
			this._nav.displayConfirmationDialog({
				title: "Update Policies",
				content: `<p class="align-center">Are you sure that you wish to <strong>update</strong> the signal cancellation policies?</p>`,
				otpConfirmation: true
			}).afterClosed().subscribe(
				async (otp: string|undefined) => {
					if (otp) {
						// Set Submission State
						this.loaded = false;
						try {
							// Set new version
							await this._signal.updatePolicies(this.buildNewPolicies(), otp);
	
							// Notify
							this._app.success("The policies have been updated successfully.");
							setTimeout(() => { this.close() });
						} catch(e) { 
							this._app.error(e);
							this.loaded = true;
						}
					}
				}
			);
		}
	}




	/**
	 * Builds the policies based on the values in the
	 * forms.
	 * @returns IPredictionCancellationPolicies
	 */
	private buildNewPolicies(): IPredictionCancellationPolicies {
		return {
			LONG: {
				ta_30m: this.long_ta_30m.value,
				ta_2h: this.long_ta_2h.value,
				ta_4h: this.long_ta_4h.value,
				ta_1d: this.long_ta_1d.value,
				window: this.long_window.value,
				volume: this.long_volume.value,
				network_fee: this.long_network_fee.value,
				open_interest: this.long_open_interest.value,
				long_short_ratio: this.long_long_short_ratio.value,
			},
			SHORT: {
				ta_30m: this.short_ta_30m.value,
				ta_2h: this.short_ta_2h.value,
				ta_4h: this.short_ta_4h.value,
				ta_1d: this.short_ta_1d.value,
				window: this.short_window.value,
				volume: this.short_volume.value,
				network_fee: this.short_network_fee.value,
				open_interest: this.short_open_interest.value,
				long_short_ratio: this.short_long_short_ratio.value,
			}
		};
	}









	/*
	* Closes the dialog and
	* returns false.
	* @returns void
	* */
	public close(): void { this.dialogRef.close() }
}
