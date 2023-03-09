import { Component, OnInit } from '@angular/core';
import {MatDialogRef} from "@angular/material/dialog";
import {AbstractControl, FormControl, FormGroup, Validators} from "@angular/forms";
import { IPredictionStateIntensityConfig, PredictionService } from '../../../core';
import { AppService, NavService } from '../../../services';
import { IPredictionStateIntensityFormDialogComponent } from './interfaces';

@Component({
  selector: 'app-prediction-state-intensity-form-dialog',
  templateUrl: './prediction-state-intensity-form-dialog.component.html',
  styleUrls: ['./prediction-state-intensity-form-dialog.component.scss']
})
export class PredictionStateIntensityFormDialogComponent implements OnInit, IPredictionStateIntensityFormDialogComponent {
    // Form
	public form!: FormGroup;
	
	// Load state
	public configLoaded: boolean = false;
	public loaded: boolean = false;

	// Submission
	public submitting: boolean = false;


	constructor(
		public dialogRef: MatDialogRef<PredictionStateIntensityFormDialogComponent>,
		public _nav: NavService,
		public _app: AppService,
		private _prediction: PredictionService
	) { }



	async ngOnInit(): Promise<void> {
		let config: IPredictionStateIntensityConfig = <IPredictionStateIntensityConfig>{};
		try {
			config = await this._prediction.getStateIntensityConfig();
			this.configLoaded = true;
		} catch (e) { this._app.error(e) }
		this.form = new FormGroup ({
			requirement: new FormControl(config.requirement, [ Validators.required, Validators.min(0.01), Validators.max(5) ]),
			strongRequirement: new FormControl(config.strongRequirement, [ Validators.required, Validators.min(0.01), Validators.max(5) ])
		});
		this.loaded = true;
	}



    /* Form Getters */
	get requirement(): AbstractControl { return <AbstractControl>this.form.get("requirement") }
	get strongRequirement(): AbstractControl { return <AbstractControl>this.form.get("strongRequirement") }








	/* API Actions */




    /**
     * Prompts the confirmation dialog and if confirmed, it will update
     * the current HP Weights.
     */
	public update(): void {
        if (this.form.valid) {
			// Display the confirmation dialog
			this._nav.displayConfirmationDialog({
				title: "Update State Intensity",
				content: `<p class="align-center">Are you sure that you wish to <strong>update</strong> the current Prediction State Intensity configuration?</p>`,
				otpConfirmation: true
			}).afterClosed().subscribe(
				async (otp: string|undefined) => {
					if (otp) {
						// Set Submission State
						this.submitting = true;
						try {
							// Update the config
							await this._prediction.updateStateIntensityConfig({
								requirement: this.requirement.value,
								strongRequirement: this.strongRequirement.value
							}, otp);
	
							// Notify
							this._app.success("The Prediction State Intensity Configuration have been updated successfully.");
	
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



	public stateIntensityTooltip(): void {
		this._nav.displayTooltip("Prediction State Intensity", [
			`When the model generates a prediction, the original record is stored and later used to generate the OHLC data, which is 
			used in order to determine if the trend sum is increasing or decreasing.`,
			`To calculate the prediction state & intensity, the system makes use of ~3 hours worth of historical predictions. Regardless 
			of the direction of the trend sum, what determines the intensity of the trend state is the difference between the initial trend 
			sum from the sequence and the last.`,
			`If the requirement is set to 0.25 and the difference between the initial and the current sums is 0.283544 the intensity results in 1 
			or -1 based on the direction.  In contrast, if the strong requirement is set to 0.5 and the difference is 0.756445, the intensity is 2 
			or -2. `,
		]);
	}








	/* Misc Helpers */


	// Close Dialog
	public close(): void { this.dialogRef.close() }
}
