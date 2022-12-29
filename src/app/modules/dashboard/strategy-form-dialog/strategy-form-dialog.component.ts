import { Component, OnInit, Inject } from "@angular/core";
import {MatDialogRef, MAT_DIALOG_DATA} from "@angular/material/dialog";
import {AbstractControl, FormControl, FormGroup, Validators} from "@angular/forms";
import { IPositionStrategy, PositionService, UtilsService } from "../../../core";
import { AppService, NavService } from "../../../services";
import { IStrategyFormDialogComponent } from "./interfaces";

@Component({
  selector: "app-strategy-form-dialog",
  templateUrl: "./strategy-form-dialog.component.html",
  styleUrls: ["./strategy-form-dialog.component.scss"]
})
export class StrategyFormDialogComponent implements OnInit, IStrategyFormDialogComponent {
    // Form
	public form: FormGroup;

	// Build
	public strategy: IPositionStrategy;

	// Idle State
	public longIdling: boolean = false;
	public shortIdling: boolean = false;

	// Submission
	public submitting: boolean = false;

    constructor(
        private dialogRef: MatDialogRef<StrategyFormDialogComponent>,
        @Inject(MAT_DIALOG_DATA) private currentStrategy: IPositionStrategy,
		private _utils: UtilsService,
		private _position: PositionService,
		private _nav: NavService,
		private _app: AppService
    ) { 
		this.strategy = this.currentStrategy;
        this.form = new FormGroup ({
            leverage: new FormControl(this.strategy.leverage, [ Validators.required, Validators.min(2), Validators.max(15) ]),
            position_size: new FormControl(this.strategy.position_size, [ Validators.required, Validators.min(150), Validators.max(100000) ]),
            long_status: new FormControl(this.strategy.long_status, [ Validators.required ]),
            short_status: new FormControl(this.strategy.short_status, [ Validators.required ]),
            take_profit: new FormControl(this.strategy.take_profit, [ Validators.required, Validators.min(0.5), Validators.max(10) ]),
            stop_loss: new FormControl(this.strategy.stop_loss, [ Validators.required, Validators.min(0.5), Validators.max(10) ]),
            long_idle_minutes: new FormControl(this.strategy.long_idle_minutes, [ Validators.required, Validators.min(1), Validators.max(1000) ]),
            short_idle_minutes: new FormControl(this.strategy.short_idle_minutes, [ Validators.required, Validators.min(1), Validators.max(1000) ])
        });
		this.longIdling = this._app.serverTime.value! < this.strategy.long_idle_until;
		this.shortIdling = this._app.serverTime.value! < this.strategy.short_idle_until;
    }

	ngOnInit(): void {
	}



    /* Form Getters */
	get leverage(): AbstractControl { return <AbstractControl>this.form.get("leverage") }
	get position_size(): AbstractControl { return <AbstractControl>this.form.get("position_size") }
	get long_status(): AbstractControl { return <AbstractControl>this.form.get("long_status") }
	get short_status(): AbstractControl { return <AbstractControl>this.form.get("short_status") }
	get take_profit(): AbstractControl { return <AbstractControl>this.form.get("take_profit") }
	get stop_loss(): AbstractControl { return <AbstractControl>this.form.get("stop_loss") }
	get long_idle_minutes(): AbstractControl { return <AbstractControl>this.form.get("long_idle_minutes") }
	get short_idle_minutes(): AbstractControl { return <AbstractControl>this.form.get("short_idle_minutes") }





    /**
     * Prompts the confirmation dialog and if confirmed, it will update
     * the current GUI Version.
     */
	 public update(): void {
        if (this.form.valid) {
			this._nav.displayConfirmationDialog({
				title: "Update Strategy",
				content: `<p class="align-center">Are you sure that you wish to <strong>update</strong> the current Position Strategy?</p>`,
				otpConfirmation: true
			}).afterClosed().subscribe(
				async (otp: string|undefined) => {
					if (otp) {
						// Build the new strategy
						this.strategy.leverage = this.leverage.value;
						this.strategy.position_size = this.position_size.value;
						this.strategy.long_status = this.long_status.value;
						this.strategy.short_status = this.short_status.value;
						this.strategy.take_profit = this.take_profit.value;
						this.strategy.stop_loss = this.stop_loss.value;
						this.strategy.long_idle_minutes = this.long_idle_minutes.value;
						this.strategy.short_idle_minutes = this.short_idle_minutes.value;

						// Set Submission State
						this.submitting = true;
						try {
							// Set new version
							await this._position.updateStrategy(this.strategy, otp);
							await this._app.refreshAppBulk();
	
							// Notify
							this._app.success("The strategy has been updated successfully.");
	
							// Disable edit mode
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







	/* Misc Helpers */



	/*
	* Closes the dialog and
	* returns false.
	* @returns void
	* */
	public cancel(): void { this.dialogRef.close() }
}
