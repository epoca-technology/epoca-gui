import { Component, OnInit } from '@angular/core';
import {MatDialogRef} from "@angular/material/dialog";
import {AbstractControl, FormControl, FormGroup, Validators} from "@angular/forms";
import { ITrendStateConfiguration, MarketStateService, UtilsService } from "../../../core";
import { AppService, NavService } from "../../../services";
import { ITrendConfigurationDialogComponent } from './interfaces';

@Component({
  selector: 'app-trend-configuration-dialog',
  templateUrl: './trend-configuration-dialog.component.html',
  styleUrls: ['./trend-configuration-dialog.component.scss']
})
export class TrendConfigurationDialogComponent implements OnInit, ITrendConfigurationDialogComponent {

    // Form
	public form!: FormGroup;

	// Build
	public config!: ITrendStateConfiguration;

	// Load State
	public loaded: boolean = false;

	// Submission
	public submitting: boolean = false;

    constructor(
        private dialogRef: MatDialogRef<TrendConfigurationDialogComponent>,
		private _utils: UtilsService,
		private _ms: MarketStateService,
		private _nav: NavService,
		private _app: AppService
    ) { }

	async ngOnInit(): Promise<void> {
		try {
			this.config = await this._ms.getTrendConfiguration();
			this.form = new FormGroup ({
				requirement: new FormControl(this.config.requirement, [ Validators.required, Validators.min(0.01), Validators.max(100) ]),
				strongRequirement: new FormControl(this.config.strongRequirement, [ Validators.required, Validators.min(0.01), Validators.max(100) ]),
			});
		} catch (e) {
			this._app.error(e);
			setTimeout(() => { this.cancel() }, 300);
		}
		this.loaded = true;
	}



    /* Form Getters */
	get requirement(): AbstractControl { return <AbstractControl>this.form.get("requirement") }
	get strongRequirement(): AbstractControl { return <AbstractControl>this.form.get("strongRequirement") }





	/* API Actions */




    /**
     * Prompts the confirmation dialog and if confirmed, it will update
     * the current Trend  Configuration.
     */
	public update(): void {
        if (this.form.valid) {
			this._nav.displayConfirmationDialog({
				title: "Update Configuration",
				content: `
					<p class="align-center">
						Are you sure that you wish to <strong>update</strong> the current Trend's Configuration?
					</p>
					<p class="light-text ts-m margin-top align-center">
						Keep in mind that the changes changes will take effect immediately.
					</p>
				`,
				otpConfirmation: true
			}).afterClosed().subscribe(
				async (otp: string|undefined) => {
					if (otp) {
						// Build the new config
						this.config.requirement = this.requirement.value;
						this.config.strongRequirement = this.strongRequirement.value;

						// Set Submission State
						this.submitting = true;
						try {
							// Update the config
							await this._ms.updateTrendConfiguration(this.config, otp);
	
							// Notify
							this._app.success("The Trend Configuration has been updated successfully.");
	
							// Close the dialog
							this.submitting = false;
							setTimeout(() => { this.cancel() });
						} catch(e) { this._app.error(e) }
	
						// Set Submission State
						this.submitting = false;
					}
				}
			);
		}
    }















	/* Tooltips */



	/* General Tooltip */
	public displayTooltip(): void {
		this._nav.displayTooltip("Trend Configuration", [
			`@TODO`,
		]);
	}










	
	/* Misc Helpers */






	/*
	* Closes the dialog and
	* returns false.
	* @returns void
	* */
	public cancel(): void { this.dialogRef.close() }

}
