import { Component, OnInit } from '@angular/core';
import {MatDialogRef} from "@angular/material/dialog";
import {AbstractControl, FormControl, FormGroup, Validators} from "@angular/forms";
import { ICoinsConfiguration, MarketStateService, UtilsService } from "../../../../../core";
import { AppService, NavService } from "../../../../../services";
import { ICoinsConfigurationDialogComponent } from './interfaces';

@Component({
  selector: 'app-coins-configuration-dialog',
  templateUrl: './coins-configuration-dialog.component.html',
  styleUrls: ['./coins-configuration-dialog.component.scss']
})
export class CoinsConfigurationDialogComponent implements OnInit, ICoinsConfigurationDialogComponent {
    // Form
	public form!: FormGroup;

	// Build
	public config!: ICoinsConfiguration;

	// Load State
	public loaded: boolean = false;

	// Submission
	public submitting: boolean = false;

    constructor(
        private dialogRef: MatDialogRef<CoinsConfigurationDialogComponent>,
		private _utils: UtilsService,
		private _ms: MarketStateService,
		private _nav: NavService,
		private _app: AppService
    ) { }

	async ngOnInit(): Promise<void> {
		try {
			this.config = await this._ms.getCoinsConfiguration();
			this.form = new FormGroup ({
				supportedCoinsIntervalHours: new FormControl(this.config.supportedCoinsIntervalHours, [ Validators.required, Validators.min(1), Validators.max(48) ]),
				priceWindowSize: new FormControl(this.config.priceWindowSize, [ Validators.required, Validators.min(32), Validators.max(1024) ]),
				priceIntervalSeconds: new FormControl(this.config.priceIntervalSeconds, [ Validators.required, Validators.min(1), Validators.max(128) ]),
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
	get supportedCoinsIntervalHours(): AbstractControl { return <AbstractControl>this.form.get("supportedCoinsIntervalHours") }
	get priceWindowSize(): AbstractControl { return <AbstractControl>this.form.get("priceWindowSize") }
	get priceIntervalSeconds(): AbstractControl { return <AbstractControl>this.form.get("priceIntervalSeconds") }
	get requirement(): AbstractControl { return <AbstractControl>this.form.get("requirement") }
	get strongRequirement(): AbstractControl { return <AbstractControl>this.form.get("strongRequirement") }





	/* API Actions */




    /**
     * Prompts the confirmation dialog and if confirmed, it will update
     * the current Coins configuration.
     */
	public update(): void {
        if (this.form.valid) {
			this._nav.displayConfirmationDialog({
				title: "Update Configuration",
				content: `
					<p class="align-center">
						Are you sure that you wish to <strong>update</strong> the current Coin's Configuration?
					</p>
					<p class="light-text ts-m margin-top align-center">
						Keep in mind that the changes will take effect immediately.
					</p>
				`,
				otpConfirmation: true
			}).afterClosed().subscribe(
				async (otp: string|undefined) => {
					if (otp) {
						// Build the new config
						this.config.supportedCoinsIntervalHours = this.supportedCoinsIntervalHours.value;
						this.config.priceWindowSize = this.priceWindowSize.value;
						this.config.priceIntervalSeconds = this.priceIntervalSeconds.value;
						this.config.requirement = this.requirement.value;
						this.config.strongRequirement = this.strongRequirement.value;

						// Set Submission State
						this.submitting = true;
						try {
							// Update the config
							await this._ms.updateCoinsConfiguration(this.config, otp);
	
							// Notify
							this._app.success("The Coins Configuration has been updated successfully.");
	
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
		this._nav.displayTooltip("Coins", [
			`This module aims to have a deep understanding of the short-term price direction for the top cryptocurrencies. `,
			`Epoca establishes a WebSocket Connection to the "Mark Price" for all the installed cryptocurrencies and calculates their state on a real time basis for both rates, BTC and USDT. `,
			`The state is calculated the same way as it is for the Window Module. For more information, go to Dashboard/Window/Information.`,
		]);
	}




	/* Build Tooltip */
	public buildTooltip(): void {
		this._nav.displayTooltip("Coins Build", [
			`Price Interval Seconds`,
			`The number of seconds that will comprise each interval. The main window's interval is 15 minutes.`,
			`-----`,
			`Price Window Size`,
			`The number of items that comprise the coins' windows. The main window's size is 128 items.`,
			`-----`,
			`Supported Coins Interval Hours`,
			`The duration of the interval that refreshes and evaluates the supported coins.`,
		]);
	}





	/* State Tooltip */
	public stateTooltip(): void {
		this._nav.displayTooltip("Coins State", [
			`Requirement%`,
			`The % change required for the window splits to have a state (1 or -1)`,
			`-----`,
			`Strong Requirement%`,
			`The % change required for the window splits to have a strong state (2 or -2)`
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
