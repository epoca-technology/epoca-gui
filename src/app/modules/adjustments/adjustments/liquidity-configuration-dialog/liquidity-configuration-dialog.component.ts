import { Component, OnInit } from '@angular/core';
import {MatDialogRef} from "@angular/material/dialog";
import {AbstractControl, FormControl, FormGroup, Validators} from "@angular/forms";
import { ILiquidityConfiguration, MarketStateService, UtilsService } from "../../../../core";
import { AppService, NavService } from "../../../../services";
import { ILiquidityConfigurationDialogComponent } from './interfaces';

@Component({
  selector: 'app-liquidity-configuration-dialog',
  templateUrl: './liquidity-configuration-dialog.component.html',
  styleUrls: ['./liquidity-configuration-dialog.component.scss']
})
export class LiquidityConfigurationDialogComponent implements OnInit, ILiquidityConfigurationDialogComponent {

    // Form
	public form!: FormGroup;

	// Build
	public config!: ILiquidityConfiguration;

	// Load State
	public loaded: boolean = false;

	// Submission
	public submitting: boolean = false;

    constructor(
        private dialogRef: MatDialogRef<LiquidityConfigurationDialogComponent>,
		private _utils: UtilsService,
		private _ms: MarketStateService,
		private _nav: NavService,
		private _app: AppService
    ) { }

	async ngOnInit(): Promise<void> {
		try {
			this.config = await this._ms.getLiquidityConfiguration();
			this.form = new FormGroup ({
				appbulk_stream_min_intensity: new FormControl(this.config.appbulk_stream_min_intensity, [ Validators.required, Validators.min(1), Validators.max(4) ]),
				max_peak_distance_from_price: new FormControl(this.config.max_peak_distance_from_price, [ Validators.required, Validators.min(0.01), Validators.max(5) ]),
				intensity_weights_1: new FormControl(this.config.intensity_weights[1], [ Validators.required, Validators.min(1), Validators.max(100) ]),
				intensity_weights_2: new FormControl(this.config.intensity_weights[2], [ Validators.required, Validators.min(1), Validators.max(100) ]),
				intensity_weights_3: new FormControl(this.config.intensity_weights[3], [ Validators.required, Validators.min(1), Validators.max(100) ]),
				intensity_weights_4: new FormControl(this.config.intensity_weights[4], [ Validators.required, Validators.min(1), Validators.max(100) ]),
			});
		} catch (e) {
			this._app.error(e);
			setTimeout(() => { this.cancel() }, 300);
		}
		this.loaded = true;
	}



    /* Form Getters */
	get appbulk_stream_min_intensity(): AbstractControl { return <AbstractControl>this.form.get("appbulk_stream_min_intensity") }
	get max_peak_distance_from_price(): AbstractControl { return <AbstractControl>this.form.get("max_peak_distance_from_price") }
	get intensity_weights_1(): AbstractControl { return <AbstractControl>this.form.get("intensity_weights_1") }
	get intensity_weights_2(): AbstractControl { return <AbstractControl>this.form.get("intensity_weights_2") }
	get intensity_weights_3(): AbstractControl { return <AbstractControl>this.form.get("intensity_weights_3") }
	get intensity_weights_4(): AbstractControl { return <AbstractControl>this.form.get("intensity_weights_4") }





	/* API Actions */




    /**
     * Prompts the confirmation dialog and if confirmed, it will update
     * the current KeyZones Configuration.
     */
	public update(): void {
        if (this.form.valid) {
			this._nav.displayConfirmationDialog({
				title: "Update Configuration",
				content: `
					<p class="align-center">
						Are you sure that you wish to <strong>update</strong> the current Liquidity's Configuration?
					</p>
					<p class="light-text ts-m margin-top align-center">
						Keep in mind that changes will take effect immediately.
					</p>
				`,
				otpConfirmation: true
			}).afterClosed().subscribe(
				async (otp: string|undefined) => {
					if (otp) {
						// Build the new config
						this.config.appbulk_stream_min_intensity = this.appbulk_stream_min_intensity.value;
						this.config.max_peak_distance_from_price = this.max_peak_distance_from_price.value;
						this.config.intensity_weights = {
							1: this.intensity_weights_1.value,
							2: this.intensity_weights_2.value,
							3: this.intensity_weights_3.value,
							4: this.intensity_weights_4.value,
						};

						// Set Submission State
						this.submitting = true;
						try {
							// Update the config
							await this._ms.updateLiquidityConfiguration(this.config, otp);
	
							// Notify
							this._app.success("The Liquidity Configuration has been updated successfully.");
	
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
	public generalTooltip(): void {
		this._nav.displayTooltip("Liquidity Configuration", [
			`@TODO`,
		]);
	}




	/* State Tooltip */
	public stateTooltip(): void {
		this._nav.displayTooltip("Liquidity State", [
			`Max Peak Distance From Price%`,
			`The max distance% a peak can be from the price. Peaks beyond this value are ignored.`,
			`-----`,
			`App Bulk Stream Min. Intensity`,
			`The minimum intensity that will be included in the AppBulk Stream`,
		]);
	}





	/* Intensity Weights Tooltip */
	public intensityWeightsTooltip(): void {
		this._nav.displayTooltip("Liq. Intensity Weights", [
			`Intensity 1`,
			`The weight of a low liquidity intensity peak.`,
			`-----`,
			`Intensity 2`,
			`The weight of a medium liquidity intensity peak.`,
			`-----`,
			`Intensity 3`,
			`The weight of a high liquidity intensity peak.`,
			`-----`,
			`Intensity 4`,
			`The weight of a very high liquidity intensity peak.`,
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
