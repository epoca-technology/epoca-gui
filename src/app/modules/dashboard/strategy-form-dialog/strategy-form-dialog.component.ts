import { Component, OnInit, OnDestroy, Inject } from "@angular/core";
import { Subscription } from "rxjs";
import { BigNumber } from "bignumber.js";
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
export class StrategyFormDialogComponent implements OnInit, OnDestroy, IStrategyFormDialogComponent {
    // Form
	public form: FormGroup;
	private formSub?: Subscription;

	// Build
	public strategy: IPositionStrategy;
	public marginAcum: number[];

	// Budget
	public sideBudget: number = 0;
	public totalBudget: number = 0;

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
		this.strategy = currentStrategy;
        this.form = new FormGroup ({
            leverage: new FormControl(this.strategy.leverage, [ Validators.required, Validators.min(1), Validators.max(5) ]),
            level_increase_requirement: new FormControl(this.strategy.level_increase_requirement, [ Validators.required, Validators.min(0.01), Validators.max(30) ]),
            stop_loss: new FormControl(this.strategy.stop_loss, [ Validators.required, Validators.min(1), Validators.max(50) ]),
            level_1_size: new FormControl(this.strategy.level_1.size, [ Validators.required, Validators.min(150), Validators.max(500000) ]),
            level_1_target: new FormControl(this.strategy.level_1.target, [ Validators.required, Validators.min(0), Validators.max(10) ]),
            level_2_target: new FormControl(this.strategy.level_2.target, [ Validators.required, Validators.min(0), Validators.max(10) ]),
            level_3_target: new FormControl(this.strategy.level_3.target, [ Validators.required, Validators.min(0), Validators.max(10) ]),
            level_4_target: new FormControl(this.strategy.level_4.target, [ Validators.required, Validators.min(0), Validators.max(10) ]),
        });
		this.marginAcum = this._position.getMarginAcums(this.strategy);
		this.calculateBudget();
    }

	ngOnInit(): void {
		this.formSub = this.form.valueChanges.subscribe(() => this.formChanged() );
	}

	ngOnDestroy(): void {
		if (this.formSub) this.formSub.unsubscribe();
	}



    /* Form Getters */
	get leverage(): AbstractControl { return <AbstractControl>this.form.get("leverage") }
	get level_increase_requirement(): AbstractControl { return <AbstractControl>this.form.get("level_increase_requirement") }
	get stop_loss(): AbstractControl { return <AbstractControl>this.form.get("stop_loss") }
	get level_1_size(): AbstractControl { return <AbstractControl>this.form.get("level_1_size") }
	get level_1_target(): AbstractControl { return <AbstractControl>this.form.get("level_1_target") }
	get level_2_target(): AbstractControl { return <AbstractControl>this.form.get("level_2_target") }
	get level_3_target(): AbstractControl { return <AbstractControl>this.form.get("level_3_target") }
	get level_4_target(): AbstractControl { return <AbstractControl>this.form.get("level_4_target") }




	/* Calculators */





	/**
	 * Triggers whenever the form changes. It calculates the 
	 * values for each level.
	 */
	private formChanged(): void {
		if (this.form.valid) {
			this.strategy.leverage = <number>this._utils.outputNumber(this.leverage.value, {dp: 0});
			this.strategy.level_increase_requirement = <number>this._utils.outputNumber(this.level_increase_requirement.value);
			this.strategy.stop_loss = <number>this._utils.outputNumber(this.stop_loss.value);
			this.strategy.level_1.size = <number>this._utils.outputNumber(this.level_1_size.value);
			this.strategy.level_1.target = <number>this._utils.outputNumber(this.level_1_target.value);

			this.strategy.level_2.size = <number>this._utils.outputNumber(this._utils.outputNumber(new BigNumber(this.strategy.level_1.size).times(2)));
			this.strategy.level_2.target = <number>this._utils.outputNumber(this.level_2_target.value);

			this.strategy.level_3.size = <number>this._utils.outputNumber(this._utils.outputNumber(new BigNumber(this.strategy.level_2.size).times(2)));
			this.strategy.level_3.target = <number>this._utils.outputNumber(this.level_3_target.value);

			this.strategy.level_4.size = <number>this._utils.outputNumber(this._utils.outputNumber(new BigNumber(this.strategy.level_3.size).times(2)));
			this.strategy.level_4.target = <number>this._utils.outputNumber(this.level_4_target.value);

			this.marginAcum = this._position.getMarginAcums(this.strategy);
			this.calculateBudget();
		}
	}




	/**
	 * Calculates the side and total budgets if the form
	 * is valid.
	 */
	private calculateBudget(): void {
		if (this.form.valid) {
			this.sideBudget = <number>this._utils.getSum([
				this.strategy.level_1.size,
				this.strategy.level_2.size,
				this.strategy.level_3.size,
				this.strategy.level_4.size,
			]);
			this.totalBudget = <number>this._utils.outputNumber(new BigNumber(this.sideBudget).times(2));
		} else {
			this.sideBudget = 0;
			this.totalBudget = 0;
		}
	}







	/* API Actions */





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
