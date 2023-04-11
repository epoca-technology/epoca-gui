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
				position_size: new FormControl(this.strategy.position_size, [ Validators.required, Validators.min(1), Validators.max(10000) ]),
				positions_limit: new FormControl(this.strategy.positions_limit, [ Validators.required, Validators.min(1), Validators.max(3) ]),
				take_profit_1_pcr: new FormControl(this.strategy.take_profit_1.price_change_requirement, [ Validators.required, Validators.min(0.05), Validators.max(10) ]),
				take_profit_1_ao: new FormControl(this.strategy.take_profit_1.activation_offset, [ Validators.required, Validators.min(0.01), Validators.max(5) ]),
				take_profit_1_gdd: new FormControl(this.strategy.take_profit_1.max_gain_drawdown, [ Validators.required, Validators.min(-100), Validators.max(-0.01) ]),
				take_profit_2_pcr: new FormControl(this.strategy.take_profit_2.price_change_requirement, [ Validators.required, Validators.min(0.05), Validators.max(10) ]),
				take_profit_2_ao: new FormControl(this.strategy.take_profit_2.activation_offset, [ Validators.required, Validators.min(0.01), Validators.max(5) ]),
				take_profit_2_gdd: new FormControl(this.strategy.take_profit_2.max_gain_drawdown, [ Validators.required, Validators.min(-100), Validators.max(-0.01) ]),
				take_profit_3_pcr: new FormControl(this.strategy.take_profit_3.price_change_requirement, [ Validators.required, Validators.min(0.05), Validators.max(10) ]),
				take_profit_3_ao: new FormControl(this.strategy.take_profit_3.activation_offset, [ Validators.required, Validators.min(0.01), Validators.max(5) ]),
				take_profit_3_gdd: new FormControl(this.strategy.take_profit_3.max_gain_drawdown, [ Validators.required, Validators.min(-100), Validators.max(-0.01) ]),
				stop_loss: new FormControl(this.strategy.stop_loss, [ Validators.required, Validators.min(0.1), Validators.max(20) ]),
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
	get take_profit_1_ao(): AbstractControl { return <AbstractControl>this.form.get("take_profit_1_ao") }
	get take_profit_1_gdd(): AbstractControl { return <AbstractControl>this.form.get("take_profit_1_gdd") }
	get take_profit_2_pcr(): AbstractControl { return <AbstractControl>this.form.get("take_profit_2_pcr") }
	get take_profit_2_ao(): AbstractControl { return <AbstractControl>this.form.get("take_profit_2_ao") }
	get take_profit_2_gdd(): AbstractControl { return <AbstractControl>this.form.get("take_profit_2_gdd") }
	get take_profit_3_pcr(): AbstractControl { return <AbstractControl>this.form.get("take_profit_3_pcr") }
	get take_profit_3_ao(): AbstractControl { return <AbstractControl>this.form.get("take_profit_3_ao") }
	get take_profit_3_gdd(): AbstractControl { return <AbstractControl>this.form.get("take_profit_3_gdd") }
	get stop_loss(): AbstractControl { return <AbstractControl>this.form.get("stop_loss") }





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
						this.strategy.positions_limit = this.positions_limit.value;
						this.strategy.take_profit_1 = {
							price_change_requirement: this.take_profit_1_pcr.value,
							activation_offset: this.take_profit_1_ao.value,
							max_gain_drawdown: this.take_profit_1_gdd.value,
						};
						this.strategy.take_profit_2 = {
							price_change_requirement: this.take_profit_2_pcr.value,
							activation_offset: this.take_profit_2_ao.value,
							max_gain_drawdown: this.take_profit_2_gdd.value,
						};
						this.strategy.take_profit_3 = {
							price_change_requirement: this.take_profit_3_pcr.value,
							activation_offset: this.take_profit_3_ao.value,
							max_gain_drawdown: this.take_profit_3_gdd.value,
						};
						this.strategy.stop_loss = this.stop_loss.value;

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











	
	/* Misc Helpers */








	/*
	* Closes the dialog and
	* returns false.
	* @returns void
	* */
	public cancel(): void { this.dialogRef.close() }
}
