import { Component, OnInit } from '@angular/core';
import {MatDialogRef} from "@angular/material/dialog";
import {AbstractControl, FormControl, FormGroup, Validators} from "@angular/forms";
import { IKeyZonesConfiguration, MarketStateService, UtilsService } from "../../../../core";
import { AppService, NavService } from "../../../../services";
import { IKeyZonesConfigFormDialogComponent } from './interfaces';

@Component({
  selector: 'app-keyzones-config-form-dialog',
  templateUrl: './keyzones-config-form-dialog.component.html',
  styleUrls: ['./keyzones-config-form-dialog.component.scss']
})
export class KeyzonesConfigFormDialogComponent implements OnInit, IKeyZonesConfigFormDialogComponent {
    // Form
	public form!: FormGroup;

	// Build
	public config!: IKeyZonesConfiguration;

	// Load State
	public loaded: boolean = false;

	// Submission
	public submitting: boolean = false;

    constructor(
        private dialogRef: MatDialogRef<KeyzonesConfigFormDialogComponent>,
		private _utils: UtilsService,
		private _ms: MarketStateService,
		private _nav: NavService,
		private _app: AppService
    ) { }

	async ngOnInit(): Promise<void> {
		try {
			this.config = await this._ms.getKeyZonesConfiguration();
			this.form = new FormGroup ({
				buildFrequencyHours: new FormControl(this.config.buildFrequencyHours, [ Validators.required, Validators.min(1), Validators.max(24) ]),
				buildLookbackSize: new FormControl(this.config.buildLookbackSize, [ Validators.required, Validators.min(150), Validators.max(150000) ]),
				zoneSize: new FormControl(this.config.zoneSize, [ Validators.required, Validators.min(0.01), Validators.max(10) ]),
				zoneMergeDistanceLimit: new FormControl(this.config.zoneMergeDistanceLimit, [ Validators.required, Validators.min(0.01), Validators.max(10) ]),
				stateLimit: new FormControl(this.config.stateLimit, [ Validators.required, Validators.min(2), Validators.max(20) ]),
				volumeIntensityWeight: new FormControl(this.config.scoreWeights.volume_intensity, [ Validators.required, Validators.min(1), Validators.max(10) ]),
				liquidityShareWeight: new FormControl(this.config.scoreWeights.liquidity_share, [ Validators.required, Validators.min(1), Validators.max(10) ]),
				priceSnapshotsLimit: new FormControl(this.config.priceSnapshotsLimit, [ Validators.required, Validators.min(3), Validators.max(50) ]),
				supportEventDurationMinutes: new FormControl(this.config.supportEventDurationMinutes, [ Validators.required, Validators.min(1), Validators.max(1440) ]),
				resistanceEventDurationMinutes: new FormControl(this.config.resistanceEventDurationMinutes, [ Validators.required, Validators.min(1), Validators.max(1440) ]),
				eventPriceDistanceLimit: new FormControl(this.config.eventPriceDistanceLimit, [ Validators.required, Validators.min(0.1), Validators.max(10) ]),
				keyzoneIdleOnEventMinutes: new FormControl(this.config.keyzoneIdleOnEventMinutes, [ Validators.required, Validators.min(1), Validators.max(1440) ]),
				eventScoreRequirement: new FormControl(this.config.eventScoreRequirement, [ Validators.required, Validators.min(1), Validators.max(10) ]),
			});
		} catch (e) {
			this._app.error(e);
			setTimeout(() => { this.cancel() }, 300);
		}
		this.loaded = true;
	}



    /* Form Getters */
	get buildFrequencyHours(): AbstractControl { return <AbstractControl>this.form.get("buildFrequencyHours") }
	get buildLookbackSize(): AbstractControl { return <AbstractControl>this.form.get("buildLookbackSize") }
	get zoneSize(): AbstractControl { return <AbstractControl>this.form.get("zoneSize") }
	get zoneMergeDistanceLimit(): AbstractControl { return <AbstractControl>this.form.get("zoneMergeDistanceLimit") }
	get stateLimit(): AbstractControl { return <AbstractControl>this.form.get("stateLimit") }
	get volumeIntensityWeight(): AbstractControl { return <AbstractControl>this.form.get("volumeIntensityWeight") }
	get liquidityShareWeight(): AbstractControl { return <AbstractControl>this.form.get("liquidityShareWeight") }
	get priceSnapshotsLimit(): AbstractControl { return <AbstractControl>this.form.get("priceSnapshotsLimit") }
	get supportEventDurationMinutes(): AbstractControl { return <AbstractControl>this.form.get("supportEventDurationMinutes") }
	get resistanceEventDurationMinutes(): AbstractControl { return <AbstractControl>this.form.get("resistanceEventDurationMinutes") }
	get eventPriceDistanceLimit(): AbstractControl { return <AbstractControl>this.form.get("eventPriceDistanceLimit") }
	get keyzoneIdleOnEventMinutes(): AbstractControl { return <AbstractControl>this.form.get("keyzoneIdleOnEventMinutes") }
	get eventScoreRequirement(): AbstractControl { return <AbstractControl>this.form.get("eventScoreRequirement") }





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
						Are you sure that you wish to <strong>update</strong> the current KeyZone's Configuration?
					</p>
					<p class="light-text ts-m margin-top align-center">
						Keep in mind that the KeyZones will be re-built and changes will take effect immediately.
					</p>
				`,
				otpConfirmation: true
			}).afterClosed().subscribe(
				async (otp: string|undefined) => {
					if (otp) {
						// Build the new config
						this.config.buildFrequencyHours = this.buildFrequencyHours.value;
						this.config.buildLookbackSize = this.buildLookbackSize.value;
						this.config.zoneSize = this.zoneSize.value;
						this.config.zoneMergeDistanceLimit = this.zoneMergeDistanceLimit.value;
						this.config.stateLimit = this.stateLimit.value;
						this.config.scoreWeights = {
							volume_intensity: this.volumeIntensityWeight.value,
							liquidity_share: this.liquidityShareWeight.value,
						}
						this.config.priceSnapshotsLimit = this.priceSnapshotsLimit.value;
						this.config.supportEventDurationMinutes = this.supportEventDurationMinutes.value;
						this.config.resistanceEventDurationMinutes = this.resistanceEventDurationMinutes.value;
						this.config.eventPriceDistanceLimit = this.eventPriceDistanceLimit.value;
						this.config.keyzoneIdleOnEventMinutes = this.keyzoneIdleOnEventMinutes.value;
						this.config.eventScoreRequirement = this.eventScoreRequirement.value;

						// Set Submission State
						this.submitting = true;
						try {
							// Update the config
							await this._ms.updateKeyZonesConfiguration(this.config, otp);
	
							// Notify
							this._app.success("The KeyZones Configuration has been updated successfully.");
	
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
		this._nav.displayTooltip("KeyZones Configuration", [
			`@TODO`,
		]);
	}




	/* Build Tooltip */
	public buildTooltip(): void {
		this._nav.displayTooltip("KeyZones Build", [
			`Build Frequency Hours`,
			`Once the KeyZones Module is initialized, a build is made and an interval that will re-build the KeyZones every buildFrequencyHours is started.`,
			`-----`,
			`Build Lookback Size`,
			`The number of 15-minute-interval candlesticks that will be used to build the KeyZones.`,
			`-----`,
			`Zone Size%`,
			`The zone's size percentage. The start and end prices are based on this value.`,
			`-----`,
			`Zone Merge Distance%`,
			`Once all zones have been set and ordered by price, it will merge the ones that are close to one another.`,
		]);
	}





	/* Score Weights Tooltip */
	public scoreWeightsTooltip(): void {
		this._nav.displayTooltip("KeyZones Score Weights", [
			`Volume Intensity`,
			`The worth of the KeyZone's Volume Intensity`,
			`-----`,
			`Liquidity Share`,
			`The worth of the KeyZone's Liquidity Share`,
		]);
	}


	/* State Tooltip */
	public stateTooltip(): void {
		this._nav.displayTooltip("KeyZones State", [
			`State Limit`,
            `Limits the number of zones returned from the current price. For example, if 2 is provided, it retrieves 4 zones in total (2 above and 2 below)`
		]);
	}


	/* Event Tooltip */
	public eventTooltip(): void {
		this._nav.displayTooltip("KeyZones Event", [
			`Price Snapshots Limit`,
			`The limit of the 1-minute-candlestick snapshots that are taken whenever there is an update (every ~3 seconds).`,
			`-----`,
			`Event Score Requirement`,
			`The minimum score needed by a KeyZone in order to be capable of issuing an event.`,
			`-----`,
			`Sup.|Res. Event Duration Minutes`,
			`The number of minutes a KeyZone event will remain active after being issued based on its kind. A KeyZone Event can also be terminated by the price based on eventPriceDistanceLimit.`,
			`-----`,
			`Event Price Distance Limit%`,
			`When an event is issued, a price limit is set based on the kind of KeyZone Contant. For example: If a support keyzone event is issued, the price limit will be the end of the zone (upperband) + eventPriceDistanceLimit%. If the price starts increasing and goes past this price, the KeyZone Event will be cleared.`,
			`On the contrary, when a resistance event is issued, the price limit will be the start of the zone (lowerband) - eventPriceDistanceLimit%. If the price starts decreasing and goes past this price, the event will be cleared.`,
			`-----`,
			`KeyZone Idle Minutes (On event)`,
			`The number of minutes a KeyZone will remain idle after issuing an event.`,
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
