import { Component, OnInit } from '@angular/core';
import {MatDialogRef} from "@angular/material/dialog";
import {AbstractControl, FormControl, FormGroup, Validators} from "@angular/forms";
import { IReversalConfiguration, MarketStateService, UtilsService } from "../../../../core";
import { AppService, NavService } from "../../../../services";
import { IReversalConfigDialogComponent } from './interfaces';

@Component({
  selector: 'app-reversal-config-dialog',
  templateUrl: './reversal-config-dialog.component.html',
  styleUrls: ['./reversal-config-dialog.component.scss']
})
export class ReversalConfigDialogComponent implements OnInit, IReversalConfigDialogComponent {
    // Form
	public form!: FormGroup;

	// Build
	public config!: IReversalConfiguration;

	// Load State
	public loaded: boolean = false;

	// Submission
	public submitting: boolean = false;

    constructor(
        private dialogRef: MatDialogRef<ReversalConfigDialogComponent>,
		private _utils: UtilsService,
		private _ms: MarketStateService,
		private _nav: NavService,
		private _app: AppService
    ) { }

	async ngOnInit(): Promise<void> {
		try {
			this.config = await this._ms.getReversalConfiguration();
			this.form = new FormGroup ({
				min_event_score: new FormControl(this.config.min_event_score, [ Validators.required, Validators.min(10), Validators.max(100) ]),
				event_sort_func: new FormControl(this.config.event_sort_func, [ Validators.required ]),
				score_weights_volume: new FormControl(this.config.score_weights.volume, [ Validators.required, Validators.min(1), Validators.max(100) ]),
				score_weights_liquidity: new FormControl(this.config.score_weights.liquidity, [ Validators.required, Validators.min(1), Validators.max(100) ]),
				score_weights_coins: new FormControl(this.config.score_weights.coins, [ Validators.required, Validators.min(1), Validators.max(100) ]),
				score_weights_coins_btc: new FormControl(this.config.score_weights.coins_btc, [ Validators.required, Validators.min(1), Validators.max(100) ]),
			});
		} catch (e) {
			this._app.error(e);
			setTimeout(() => { this.cancel() }, 300);
		}
		this.loaded = true;
	}



    /* Form Getters */
	get min_event_score(): AbstractControl { return <AbstractControl>this.form.get("min_event_score") }
	get event_sort_func(): AbstractControl { return <AbstractControl>this.form.get("event_sort_func") }
	get score_weights_volume(): AbstractControl { return <AbstractControl>this.form.get("score_weights_volume") }
	get score_weights_liquidity(): AbstractControl { return <AbstractControl>this.form.get("score_weights_liquidity") }
	get score_weights_coins(): AbstractControl { return <AbstractControl>this.form.get("score_weights_coins") }
	get score_weights_coins_btc(): AbstractControl { return <AbstractControl>this.form.get("score_weights_coins_btc") }





	/* API Actions */




    /**
     * Prompts the confirmation dialog and if confirmed, it will update
     * the current Reversal Configuration.
     */
	public update(): void {
        if (this.form.valid) {
			this._nav.displayConfirmationDialog({
				title: "Update Configuration",
				content: `
					<p class="align-center">
						Are you sure that you wish to <strong>update</strong> the current Reversal's Configuration?
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
						this.config.min_event_score = this.min_event_score.value;
						this.config.event_sort_func = this.event_sort_func.value;
						this.config.score_weights = {
							volume: this.score_weights_volume.value,
							liquidity: this.score_weights_liquidity.value,
							coins: this.score_weights_coins.value,
							coins_btc: this.score_weights_coins_btc.value,
						};

						// Set Submission State
						this.submitting = true;
						try {
							// Update the config
							await this._ms.updateReversalConfiguration(this.config, otp);
	
							// Notify
							this._app.success("The Reversal Configuration has been updated successfully.");
	
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
		this._nav.displayTooltip("Reversal", [
            `This module aims to identify when a KeyZone Contact Event (Support or Resistance) has the potential to cause a price reversal.`,
			`Whenever a KeyZone Event (support or resistance) comes into existence, the Reversal Module is activated and starts tracking the behavior of the market.`,
			`RESISTANCE CONTACT: the Reversal Module analyzes Epoca's indicators to determine if there is enough selling power for the price to reverse (decrease).`,
			`SUPPORT CONTACT: the Reversal Module analyzes Epoca's indicators to determine if there is enough buying power for the price to reverse (increase).`,
            `Each indicator has a weight and when the required points are reached, a reversal event is issued.`,
		]);
	}




	/* Event Tooltip */
	public eventTooltip(): void {
		this._nav.displayTooltip("Reversal Event", [
			`Min. Event Score`,
			`The minimum score required for a resistance event to be issued`,
			`-----`,
			`Sort Function`,
			`The sorting mechanism that will be used to order the symbols that are compliant with the kind of reversal.`,
		]);
	}





	/* Score Weights Tooltip */
	public scoreWeightsTooltip(): void {
		this._nav.displayTooltip("Reversal Score Weights", [
			`The weights by module that will be used to calculate the score. Keep in mind, there are 100 points in the score system.`,
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
