import { Component, OnInit } from '@angular/core';
import {MatDialogRef} from "@angular/material/dialog";
import {AbstractControl, FormControl, FormGroup, Validators} from "@angular/forms";
import { IWindowStateConfiguration, MarketStateService, UtilsService } from "../../../../core";
import { AppService, NavService } from "../../../../services";
import { IWindowConfigurationDialogComponent } from './interfaces';

@Component({
  selector: 'app-window-configuration-dialog',
  templateUrl: './window-configuration-dialog.component.html',
  styleUrls: ['./window-configuration-dialog.component.scss']
})
export class WindowConfigurationDialogComponent implements OnInit, IWindowConfigurationDialogComponent {
    // Form
	public form!: FormGroup;

	// Build
	public config!: IWindowStateConfiguration;

	// Load State
	public loaded: boolean = false;

	// Submission
	public submitting: boolean = false;

    constructor(
        private dialogRef: MatDialogRef<WindowConfigurationDialogComponent>,
		private _utils: UtilsService,
		private _ms: MarketStateService,
		private _nav: NavService,
		private _app: AppService
    ) { }

	async ngOnInit(): Promise<void> {
		try {
			this.config = await this._ms.getWindowConfiguration();
			this.form = new FormGroup ({
				candlestickIntervalMinutes: new FormControl({ value: 15, disabled: true }, [Validators.required]),
				lookbackWidth: new FormControl({ value: 128, disabled: true }, [Validators.required]),
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
     * the current Window Configuration.
     */
	public update(): void {
        if (this.form.valid) {
			this._nav.displayConfirmationDialog({
				title: "Update Configuration",
				content: `
					<p class="align-center">
						Are you sure that you wish to <strong>update</strong> the current Window's Configuration?
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
							await this._ms.updateWindowConfiguration(this.config, otp);
	
							// Notify
							this._app.success("The Window Configuration has been updated successfully.");
	
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
		this._nav.displayTooltip("Window", [
            `The window module operates in a moving window of 128 15-minute-interval candlesticks (~32 hours) that is synced every ~3 seconds through Binance Spot's API.`,
            `To calculate the state of the window, a total of 8 splits are applied to the sequence of candlesticks and the state for each is derived based on the configuration.`,
            `-----`,
            `The splits applied to the window are:`,
            `* 100%: 128 items (last ~32 hours)`,
            `* 75%: 96 items (last ~24 hours)`,
            `* 50%: 64 items (last ~16 hours)`,
            `* 25%: 32 items (last ~8 hours)`,
            `* 15%: 20 items (last ~5 hours)`,
            `* 10%: 13 items (last ~3.25 hours)`,
            `* 5%: 7 items (last ~1.75 hours)`,
            `* 2%: 3 items (last ~45 minutes)`,
            `-----`,
            `The supported states are:`,
            `* 2: Increasing Strongly`,
            `* 1: Increasing`,
            `* 0: Sideways`,
            `* -1: Decreasing`,
            `* -2: Decreasing Strongly`,
        ]);
	}


	/* Build Tooltip */
	public displayBuildTooltip(): void {
		this._nav.displayTooltip("Window Build", [
			`Candlestick Interval Minutes`,
			`The number of minutes within each candlestick item. For instance, the last 5 candlesticks in the window represent the last 75 minutes worth of prices. This value is hard-coded in Epoca's core and therefore cannot be modified through this form.`,
			`-----`,
			`Lookback Width`,
			`The number of candlesticks that comprise the window. For example, if the lookback width is equals to 128 it means the window contains ~32 hours worth of data. This value is hard-coded in Epoca's core and therefore cannot be modified through this form.`,
		]);
	}


	/* State Tooltip */
	public displayStateTooltip(): void {
		this._nav.displayTooltip("Window State", [
			`Requirement %`,
			`The % change required for the window/coin splits to have a state (1 or -1)`,
			`-----`,
			`Strong Requirement %`,
			`The % change required for the window/coin splits to have a strong state (2 or -2)`,
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
