import { Component, OnInit } from '@angular/core';
import {MatDialogRef} from "@angular/material/dialog";
import {AbstractControl, FormControl, FormGroup, Validators} from "@angular/forms";
import { IPositionHealthWeights, PositionService } from '../../../core';
import { AppService, NavService } from '../../../services';
import { IPositionHealthWeightsFormDialogComponent } from './interfaces';

@Component({
  selector: 'app-position-health-weights-form-dialog',
  templateUrl: './position-health-weights-form-dialog.component.html',
  styleUrls: ['./position-health-weights-form-dialog.component.scss']
})
export class PositionHealthWeightsFormDialogComponent implements OnInit, IPositionHealthWeightsFormDialogComponent {
    // Form
	public form!: FormGroup;
	
	// Load state
	public weightsLoaded: boolean = false;
	public loaded: boolean = false;

	// Submission
	public submitting: boolean = false;

	constructor(
		public dialogRef: MatDialogRef<PositionHealthWeightsFormDialogComponent>,
		public _nav: NavService,
		public _app: AppService,
		private _position: PositionService
	) { }



	async ngOnInit(): Promise<void> {
		let weights: IPositionHealthWeights = <IPositionHealthWeights>{};
		try {
			weights = await this._position.getPositionHealthWeights();
			this.weightsLoaded = true;
		} catch (e) { this._app.error(e) }
		this.form = new FormGroup ({
			trend_sum: new FormControl(weights.trend_sum, [ Validators.required, Validators.min(0.1), Validators.max(100) ]),
			trend_state: new FormControl(weights.trend_state, [ Validators.required, Validators.min(0.1), Validators.max(100) ]),
			ta_30m: new FormControl(weights.ta_30m, [ Validators.required, Validators.min(0.1), Validators.max(100) ]),
			ta_1h: new FormControl(weights.ta_1h, [ Validators.required, Validators.min(0.1), Validators.max(100) ]),
			ta_2h: new FormControl(weights.ta_2h, [ Validators.required, Validators.min(0.1), Validators.max(100) ]),
			ta_4h: new FormControl(weights.ta_4h, [ Validators.required, Validators.min(0.1), Validators.max(100) ]),
			ta_1d: new FormControl(weights.ta_1d, [ Validators.required, Validators.min(0.1), Validators.max(100) ]),
			open_interest: new FormControl(weights.open_interest, [ Validators.required, Validators.min(0.1), Validators.max(100) ]),
			open_interest_state: new FormControl(weights.open_interest_state, [ Validators.required, Validators.min(0.1), Validators.max(100) ]),
			long_short_ratio: new FormControl(weights.long_short_ratio, [ Validators.required, Validators.min(0.1), Validators.max(100) ]),
			long_short_ratio_state: new FormControl(weights.long_short_ratio_state, [ Validators.required, Validators.min(0.1), Validators.max(100) ]),
			volume_direction: new FormControl(weights.volume_direction, [ Validators.required, Validators.min(0.1), Validators.max(100) ])
		});
		this.loaded = true;
	}



    /* Form Getters */
	get trend_sum(): AbstractControl { return <AbstractControl>this.form.get("trend_sum") }
	get trend_state(): AbstractControl { return <AbstractControl>this.form.get("trend_state") }
	get ta_30m(): AbstractControl { return <AbstractControl>this.form.get("ta_30m") }
	get ta_1h(): AbstractControl { return <AbstractControl>this.form.get("ta_1h") }
	get ta_2h(): AbstractControl { return <AbstractControl>this.form.get("ta_2h") }
	get ta_4h(): AbstractControl { return <AbstractControl>this.form.get("ta_4h") }
	get ta_1d(): AbstractControl { return <AbstractControl>this.form.get("ta_1d") }
	get open_interest(): AbstractControl { return <AbstractControl>this.form.get("open_interest") }
	get open_interest_state(): AbstractControl { return <AbstractControl>this.form.get("open_interest_state") }
	get long_short_ratio(): AbstractControl { return <AbstractControl>this.form.get("long_short_ratio") }
	get long_short_ratio_state(): AbstractControl { return <AbstractControl>this.form.get("long_short_ratio_state") }
	get volume_direction(): AbstractControl { return <AbstractControl>this.form.get("volume_direction") }








	/* API Actions */




    /**
     * Prompts the confirmation dialog and if confirmed, it will update
     * the current HP Weights.
     */
	public update(): void {
        if (this.form.valid) {
			// Display the confirmation dialog
			this._nav.displayConfirmationDialog({
				title: "Update Weights",
				content: `<p class="align-center">Are you sure that you wish to <strong>update</strong> the current Position Health Point Weights?</p>`,
				otpConfirmation: true
			}).afterClosed().subscribe(
				async (otp: string|undefined) => {
					if (otp) {
						// Set Submission State
						this.submitting = true;
						try {
							// Build the weights
							const weights: IPositionHealthWeights = this.buildWeights();

							// Update the weights
							await this._position.updatePositionHealthWeights(weights, otp);
	
							// Notify
							this._app.success("The HP Weights have been updated successfully.");
	
							// Disable edit mode
							this.submitting = false;
							setTimeout(() => { this.close() });
						} catch(e) { this._app.error(e) }
	
						// Set Submission State
						this.submitting = false;
					}
				}
			);
		}
    }






	/* Tooltips */



	public positionHealthSystemTooltip(): void {
		this._nav.displayTooltip("Position Health System", [
			"",
		]);
	}


	public trendTooltip(): void {
		this._nav.displayTooltip("Trend", [
			"",
		]);
	}


	public technicalsTooltip(): void {
		this._nav.displayTooltip("Technicals", [
			"",
		]);
	}


	public openInterestTooltip(): void {
		this._nav.displayTooltip("Open Interest", [
			"",
		]);
	}



	public longShortRatioTooltip(): void {
		this._nav.displayTooltip("Long/Short Ratio", [
			"",
		]);
	}



	public volumeTooltip(): void {
		this._nav.displayTooltip("Volume", [
			"",
		]);
	}




	/* Misc Helpers */





	/**
	 * Builds the position hp weights straight from the form and also
	 * ensures the sums add to 100.
	 * @returns IPositionHealthWeights
	 */
	private buildWeights(): IPositionHealthWeights {
		// Build the weights from the form
		const weights: IPositionHealthWeights = {
			trend_sum: this.trend_sum.value,
			trend_state: this.trend_state.value,
			ta_30m: this.ta_30m.value,
			ta_1h: this.ta_1h.value,
			ta_2h: this.ta_2h.value,
			ta_4h: this.ta_4h.value,
			ta_1d: this.ta_1d.value,
			open_interest: this.open_interest.value,
			open_interest_state: this.open_interest_state.value,
			long_short_ratio: this.long_short_ratio.value,
			long_short_ratio_state: this.long_short_ratio_state.value,
			volume_direction: this.volume_direction.value
		}

		// Ensure the sum of the weights adds to 100
		const sumValues: number = Object.values(weights).reduce((a, b) => a + b, 0);
		if (sumValues != 100) {
			throw new Error(`The sum of all the weights must add to 100. Received: ${sumValues}`);
		}

		// Finally, return the fully form weights
		return weights;
	}



	// Close Dialog
	public close(): void { this.dialogRef.close() }
}
