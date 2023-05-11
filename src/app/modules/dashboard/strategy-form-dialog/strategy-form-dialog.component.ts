import { Component, OnInit } from "@angular/core";
import {MatDialogRef} from "@angular/material/dialog";
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
	public form!: FormGroup;

	// Build
	public strategy!: IPositionStrategy;

	// Load State
	public loaded: boolean = false;

	// Submission
	public submitting: boolean = false;

    constructor(
        private dialogRef: MatDialogRef<StrategyFormDialogComponent>,
		private _utils: UtilsService,
		private _position: PositionService,
		private _nav: NavService,
		private _app: AppService
    ) { }

	async ngOnInit(): Promise<void> {
		try {
			this.strategy = await this._position.getStrategy();
			this.form = new FormGroup ({
				long_status: new FormControl(this.strategy.long_status, [ Validators.required ]),
				short_status: new FormControl(this.strategy.short_status, [ Validators.required ]),
				bitcoin_only: new FormControl(this.strategy.bitcoin_only, [ Validators.required ]),
				leverage: new FormControl(this.strategy.leverage, [ Validators.required, Validators.min(2), Validators.max(125) ]),
				position_size: new FormControl(this.strategy.position_size, [ Validators.required, Validators.min(0.25), Validators.max(10000) ]),
				take_profit_1_pcr: new FormControl(this.strategy.take_profit_1.price_change_requirement, [ Validators.required, Validators.min(0.05), Validators.max(10) ]),
				take_profit_1_rs: new FormControl(this.strategy.take_profit_1.reduction_size, [ Validators.required, Validators.min(0.01), Validators.max(1) ]),
				take_profit_1_rim: new FormControl(this.strategy.take_profit_1.reduction_interval_minutes, [ Validators.required, Validators.min(0.1), Validators.max(1000) ]),
				
				take_profit_2_pcr: new FormControl(this.strategy.take_profit_2.price_change_requirement, [ Validators.required, Validators.min(0.05), Validators.max(10) ]),
				take_profit_2_rs: new FormControl(this.strategy.take_profit_2.reduction_size, [ Validators.required, Validators.min(0.01), Validators.max(1) ]),
				take_profit_2_rim: new FormControl(this.strategy.take_profit_2.reduction_interval_minutes, [ Validators.required, Validators.min(0.1), Validators.max(1000) ]),
				
				take_profit_3_pcr: new FormControl(this.strategy.take_profit_3.price_change_requirement, [ Validators.required, Validators.min(0.05), Validators.max(10) ]),
				take_profit_3_rs: new FormControl(this.strategy.take_profit_3.reduction_size, [ Validators.required, Validators.min(0.01), Validators.max(1) ]),
				take_profit_3_rim: new FormControl(this.strategy.take_profit_3.reduction_interval_minutes, [ Validators.required, Validators.min(0.1), Validators.max(1000) ]),
				
				take_profit_4_pcr: new FormControl(this.strategy.take_profit_4.price_change_requirement, [ Validators.required, Validators.min(0.05), Validators.max(10) ]),
				take_profit_4_rs: new FormControl(this.strategy.take_profit_4.reduction_size, [ Validators.required, Validators.min(0.01), Validators.max(1) ]),
				take_profit_4_rim: new FormControl(this.strategy.take_profit_4.reduction_interval_minutes, [ Validators.required, Validators.min(0.1), Validators.max(1000) ]),
				
				take_profit_5_pcr: new FormControl(this.strategy.take_profit_5.price_change_requirement, [ Validators.required, Validators.min(0.05), Validators.max(10) ]),
				take_profit_5_rs: new FormControl(this.strategy.take_profit_5.reduction_size, [ Validators.required, Validators.min(0.01), Validators.max(1) ]),
				take_profit_5_rim: new FormControl(this.strategy.take_profit_5.reduction_interval_minutes, [ Validators.required, Validators.min(0.1), Validators.max(1000) ]),
				
				stop_loss: new FormControl(this.strategy.stop_loss, [ Validators.required, Validators.min(0.1), Validators.max(20) ]),
				reopen_if_better_duration_minutes: new FormControl(this.strategy.reopen_if_better_duration_minutes, [ Validators.required, Validators.min(0), Validators.max(720) ]),
				reopen_if_better_price_adjustment: new FormControl(this.strategy.reopen_if_better_price_adjustment, [ Validators.required, Validators.min(0.01), Validators.max(10) ]),
				low_volatility_coins: new FormControl(this.strategy.low_volatility_coins.join(","), [ Validators.required ]),
			});
		} catch (e) {
			this._app.error(e);
			setTimeout(() => { this.cancel() }, 300);
		}
		this.loaded = true;
	}



    /* Form Getters */
	get long_status(): AbstractControl { return <AbstractControl>this.form.get("long_status") }
	get short_status(): AbstractControl { return <AbstractControl>this.form.get("short_status") }
	get bitcoin_only(): AbstractControl { return <AbstractControl>this.form.get("bitcoin_only") }
	get leverage(): AbstractControl { return <AbstractControl>this.form.get("leverage") }
	get position_size(): AbstractControl { return <AbstractControl>this.form.get("position_size") }
	get positions_limit(): AbstractControl { return <AbstractControl>this.form.get("positions_limit") }
	get take_profit_1_pcr(): AbstractControl { return <AbstractControl>this.form.get("take_profit_1_pcr") }
	get take_profit_1_rs(): AbstractControl { return <AbstractControl>this.form.get("take_profit_1_rs") }
	get take_profit_1_rim(): AbstractControl { return <AbstractControl>this.form.get("take_profit_1_rim") }
	get take_profit_2_pcr(): AbstractControl { return <AbstractControl>this.form.get("take_profit_2_pcr") }
	get take_profit_2_rs(): AbstractControl { return <AbstractControl>this.form.get("take_profit_2_rs") }
	get take_profit_2_rim(): AbstractControl { return <AbstractControl>this.form.get("take_profit_2_rim") }
	get take_profit_3_pcr(): AbstractControl { return <AbstractControl>this.form.get("take_profit_3_pcr") }
	get take_profit_3_rs(): AbstractControl { return <AbstractControl>this.form.get("take_profit_3_rs") }
	get take_profit_3_rim(): AbstractControl { return <AbstractControl>this.form.get("take_profit_3_rim") }
	get take_profit_4_pcr(): AbstractControl { return <AbstractControl>this.form.get("take_profit_4_pcr") }
	get take_profit_4_rs(): AbstractControl { return <AbstractControl>this.form.get("take_profit_4_rs") }
	get take_profit_4_rim(): AbstractControl { return <AbstractControl>this.form.get("take_profit_4_rim") }
	get take_profit_5_pcr(): AbstractControl { return <AbstractControl>this.form.get("take_profit_5_pcr") }
	get take_profit_5_rs(): AbstractControl { return <AbstractControl>this.form.get("take_profit_5_rs") }
	get take_profit_5_rim(): AbstractControl { return <AbstractControl>this.form.get("take_profit_5_rim") }
	get stop_loss(): AbstractControl { return <AbstractControl>this.form.get("stop_loss") }
	get reopen_if_better_duration_minutes(): AbstractControl { return <AbstractControl>this.form.get("reopen_if_better_duration_minutes") }
	get reopen_if_better_price_adjustment(): AbstractControl { return <AbstractControl>this.form.get("reopen_if_better_price_adjustment") }
	get low_volatility_coins(): AbstractControl { return <AbstractControl>this.form.get("low_volatility_coins") }





    /**
     * Prompts the confirmation dialog and if confirmed, it will update
     * the current Strategy.
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
						this.strategy.long_status = this.long_status.value;
						this.strategy.short_status = this.short_status.value;
						this.strategy.bitcoin_only = this.bitcoin_only.value;
						this.strategy.leverage = this.leverage.value;
						this.strategy.position_size = this.position_size.value;
						this.strategy.take_profit_1 = {
							price_change_requirement: this.take_profit_1_pcr.value,
							reduction_size: this.take_profit_1_rs.value,
							reduction_interval_minutes: this.take_profit_1_rim.value,
						};
						this.strategy.take_profit_2 = {
							price_change_requirement: this.take_profit_2_pcr.value,
							reduction_size: this.take_profit_2_rs.value,
							reduction_interval_minutes: this.take_profit_2_rim.value,
						};
						this.strategy.take_profit_3 = {
							price_change_requirement: this.take_profit_3_pcr.value,
							reduction_size: this.take_profit_3_rs.value,
							reduction_interval_minutes: this.take_profit_3_rim.value,
						};
						this.strategy.take_profit_4 = {
							price_change_requirement: this.take_profit_4_pcr.value,
							reduction_size: this.take_profit_4_rs.value,
							reduction_interval_minutes: this.take_profit_4_rim.value,
						};
						this.strategy.take_profit_5 = {
							price_change_requirement: this.take_profit_5_pcr.value,
							reduction_size: this.take_profit_5_rs.value,
							reduction_interval_minutes: this.take_profit_5_rim.value,
						};
						this.strategy.stop_loss = this.stop_loss.value;
						this.strategy.reopen_if_better_duration_minutes = this.reopen_if_better_duration_minutes.value;
						this.strategy.reopen_if_better_price_adjustment = this.reopen_if_better_price_adjustment.value;
						this.strategy.low_volatility_coins = this.low_volatility_coins.value.split(",");

						// Set Submission State
						this.submitting = true;
						try {
							// Update the strategy
							await this._position.updateStrategy(this.strategy, otp);
	
							// Notify
							this._app.success("The strategy has been updated successfully.");
	
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


	/* Trading Strategy */
	public tradingStrategyTooltip(): void {
		this._nav.displayTooltip("Trading Strategy", [
			`@TODO`,
		]);
	}


	/* Status */
	public statusTooltip(): void {
		this._nav.displayTooltip("Status", [
			`@TODO`,
		]);
	}


	/* General */
	public generalTooltip(): void {
		this._nav.displayTooltip("General", [
			`@TODO`,
		]);
	}



	/* Profit Optimization Strategy */
	public profitOptimizationTooltip(): void {
		this._nav.displayTooltip("Profit Optimization Strategy", [
			`@TODO`,
		]);
	}


	/* Loss Optimization Strategy */
	public lossOptimizationTooltip(): void {
		this._nav.displayTooltip("Loss Optimization Strategy", [
			`@TODO`,
		]);
	}



	/* Side Reopening */
	public sideReopeningTooltip(): void {
		this._nav.displayTooltip("Side Reopening", [
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
