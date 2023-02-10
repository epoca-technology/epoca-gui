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
            long_status: new FormControl(this.strategy.long_status, [ Validators.required ]),
            short_status: new FormControl(this.strategy.short_status, [ Validators.required ]),
            hedge_mode: new FormControl(this.strategy.hedge_mode, [ Validators.required ]),
            leverage: new FormControl(this.strategy.leverage, [ Validators.required, Validators.min(2), Validators.max(15) ]),
            position_size: new FormControl(this.strategy.position_size, [ Validators.required, Validators.min(150), Validators.max(100000) ]),
            take_profit_1_pcr: new FormControl(this.strategy.take_profit_1.price_change_requirement, [ Validators.required, Validators.min(0.4), Validators.max(10) ]),
            take_profit_1_dd: new FormControl(this.strategy.take_profit_1.max_hp_drawdown, [ Validators.required, Validators.min(-70), Validators.max(0) ]),
            take_profit_1_gdd: new FormControl(this.strategy.take_profit_1.max_gain_drawdown, [ Validators.required, Validators.min(-100), Validators.max(-0.01) ]),
            take_profit_2_pcr: new FormControl(this.strategy.take_profit_2.price_change_requirement, [ Validators.required, Validators.min(0.4), Validators.max(10) ]),
            take_profit_2_dd: new FormControl(this.strategy.take_profit_2.max_hp_drawdown, [ Validators.required, Validators.min(-70), Validators.max(0) ]),
            take_profit_2_gdd: new FormControl(this.strategy.take_profit_2.max_gain_drawdown, [ Validators.required, Validators.min(-100), Validators.max(-0.01) ]),
            take_profit_3_pcr: new FormControl(this.strategy.take_profit_3.price_change_requirement, [ Validators.required, Validators.min(0.4), Validators.max(10) ]),
            take_profit_3_dd: new FormControl(this.strategy.take_profit_3.max_hp_drawdown, [ Validators.required, Validators.min(-70), Validators.max(0) ]),
            take_profit_3_gdd: new FormControl(this.strategy.take_profit_3.max_gain_drawdown, [ Validators.required, Validators.min(-100), Validators.max(-0.01) ]),
            take_profit_4_pcr: new FormControl(this.strategy.take_profit_4.price_change_requirement, [ Validators.required, Validators.min(0.4), Validators.max(10) ]),
            take_profit_4_dd: new FormControl(this.strategy.take_profit_4.max_hp_drawdown, [ Validators.required, Validators.min(-70), Validators.max(0) ]),
            take_profit_4_gdd: new FormControl(this.strategy.take_profit_4.max_gain_drawdown, [ Validators.required, Validators.min(-100), Validators.max(-0.01) ]),
            take_profit_5_pcr: new FormControl(this.strategy.take_profit_5.price_change_requirement, [ Validators.required, Validators.min(0.4), Validators.max(10) ]),
            take_profit_5_dd: new FormControl(this.strategy.take_profit_5.max_hp_drawdown, [ Validators.required, Validators.min(-70), Validators.max(0) ]),
            take_profit_5_gdd: new FormControl(this.strategy.take_profit_5.max_gain_drawdown, [ Validators.required, Validators.min(-100), Validators.max(-0.01) ]),
            max_hp_drawdown_in_profit: new FormControl(this.strategy.max_hp_drawdown_in_profit, [ Validators.required, Validators.min(-99), Validators.max(-10) ]),
            stop_loss: new FormControl(this.strategy.stop_loss, [ Validators.required, Validators.min(0.5), Validators.max(10) ]),
            max_hp_drawdown_in_loss: new FormControl(this.strategy.max_hp_drawdown_in_loss, [ Validators.required, Validators.min(-99), Validators.max(-10) ]),
            long_idle_minutes: new FormControl(this.strategy.long_idle_minutes, [ Validators.required, Validators.min(1), Validators.max(1000) ]),
            short_idle_minutes: new FormControl(this.strategy.short_idle_minutes, [ Validators.required, Validators.min(1), Validators.max(1000) ])
        });
		this.longIdling = this._app.serverTime.value! < this.strategy.long_idle_until;
		this.shortIdling = this._app.serverTime.value! < this.strategy.short_idle_until;
    }

	ngOnInit(): void {
	}



    /* Form Getters */
	get long_status(): AbstractControl { return <AbstractControl>this.form.get("long_status") }
	get short_status(): AbstractControl { return <AbstractControl>this.form.get("short_status") }
	get hedge_mode(): AbstractControl { return <AbstractControl>this.form.get("hedge_mode") }
	get leverage(): AbstractControl { return <AbstractControl>this.form.get("leverage") }
	get position_size(): AbstractControl { return <AbstractControl>this.form.get("position_size") }
	get take_profit_1_pcr(): AbstractControl { return <AbstractControl>this.form.get("take_profit_1_pcr") }
	get take_profit_1_dd(): AbstractControl { return <AbstractControl>this.form.get("take_profit_1_dd") }
	get take_profit_1_gdd(): AbstractControl { return <AbstractControl>this.form.get("take_profit_1_gdd") }
	get take_profit_2_pcr(): AbstractControl { return <AbstractControl>this.form.get("take_profit_2_pcr") }
	get take_profit_2_dd(): AbstractControl { return <AbstractControl>this.form.get("take_profit_2_dd") }
	get take_profit_2_gdd(): AbstractControl { return <AbstractControl>this.form.get("take_profit_2_gdd") }
	get take_profit_3_pcr(): AbstractControl { return <AbstractControl>this.form.get("take_profit_3_pcr") }
	get take_profit_3_dd(): AbstractControl { return <AbstractControl>this.form.get("take_profit_3_dd") }
	get take_profit_3_gdd(): AbstractControl { return <AbstractControl>this.form.get("take_profit_3_gdd") }
	get take_profit_4_pcr(): AbstractControl { return <AbstractControl>this.form.get("take_profit_4_pcr") }
	get take_profit_4_dd(): AbstractControl { return <AbstractControl>this.form.get("take_profit_4_dd") }
	get take_profit_4_gdd(): AbstractControl { return <AbstractControl>this.form.get("take_profit_4_gdd") }
	get take_profit_5_pcr(): AbstractControl { return <AbstractControl>this.form.get("take_profit_5_pcr") }
	get take_profit_5_dd(): AbstractControl { return <AbstractControl>this.form.get("take_profit_5_dd") }
	get take_profit_5_gdd(): AbstractControl { return <AbstractControl>this.form.get("take_profit_5_gdd") }
	get max_hp_drawdown_in_profit(): AbstractControl { return <AbstractControl>this.form.get("max_hp_drawdown_in_profit") }
	get stop_loss(): AbstractControl { return <AbstractControl>this.form.get("stop_loss") }
	get max_hp_drawdown_in_loss(): AbstractControl { return <AbstractControl>this.form.get("max_hp_drawdown_in_loss") }
	get long_idle_minutes(): AbstractControl { return <AbstractControl>this.form.get("long_idle_minutes") }
	get short_idle_minutes(): AbstractControl { return <AbstractControl>this.form.get("short_idle_minutes") }





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
						this.strategy.hedge_mode = this.hedge_mode.value;
						this.strategy.leverage = this.leverage.value;
						this.strategy.position_size = this.position_size.value;
						this.strategy.take_profit_1 = {
							price_change_requirement: this.take_profit_1_pcr.value,
							max_hp_drawdown: this.take_profit_1_dd.value,
							max_gain_drawdown: this.take_profit_1_gdd.value,
						};
						this.strategy.take_profit_2 = {
							price_change_requirement: this.take_profit_2_pcr.value,
							max_hp_drawdown: this.take_profit_2_dd.value,
							max_gain_drawdown: this.take_profit_2_gdd.value,
						};
						this.strategy.take_profit_3 = {
							price_change_requirement: this.take_profit_3_pcr.value,
							max_hp_drawdown: this.take_profit_3_dd.value,
							max_gain_drawdown: this.take_profit_3_gdd.value,
						};
						this.strategy.take_profit_4 = {
							price_change_requirement: this.take_profit_4_pcr.value,
							max_hp_drawdown: this.take_profit_4_dd.value,
							max_gain_drawdown: this.take_profit_4_gdd.value,
						};
						this.strategy.take_profit_5 = {
							price_change_requirement: this.take_profit_5_pcr.value,
							max_hp_drawdown: this.take_profit_5_dd.value,
							max_gain_drawdown: this.take_profit_5_gdd.value,
						};
						this.strategy.max_hp_drawdown_in_profit = this.max_hp_drawdown_in_profit.value;
						this.strategy.stop_loss = this.stop_loss.value;
						this.strategy.max_hp_drawdown_in_loss = this.max_hp_drawdown_in_loss.value;
						this.strategy.long_idle_minutes = this.long_idle_minutes.value;
						this.strategy.short_idle_minutes = this.short_idle_minutes.value;

						// Set Submission State
						this.submitting = true;
						try {
							// Update the strategy
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








	/* Tooltips */


	/* Trading Strategy */
	public tradingStrategyTooltip(): void {
		this._nav.displayTooltip("Trading Strategy", [
			`The strategy is fully connected to the Signal and Position HP modules. Its core responsibilities are:`,
			`- When it receives a non-neutral signal, it determines if a position for the given side can be opened and does so`,
			`- Calculates the size of a position (capital to be allocated)`,
			`- Closes positions at profit or loss based on the HP & Gain systems`,
		]);
	}


	/* Status */
	public statusTooltip(): void {
		this._nav.displayTooltip("Status", [
			"A position can be opened if the following conditions are met:",
			"1) A non-neutral signal is generated",
			"2) The side's status is enabled",
			"3) The side is not idling",
		]);
	}

	/* Trading Mode */
	public tradingModeTooltip(): void {
		this._nav.displayTooltip("Trading Mode", [
			"One-Way Mode",
			"The model can manage one position side at a time. The suggested budget distribution is Long|Short: 66.66% & Reserve: 33.33%",
			"Hedge Mode",
			"The model can manage both position sides simultaneously. The suggested budget distribution is Long: 33.33%, Short: 33.33% & Reserve: 33.33%."
		]);
	}

	/* Position Size */
	public positionSizeTooltip(): void {
		this._nav.displayTooltip("Position Size", [
			`The real size of a position (notional) is calculated by multiplying the margin by the leverage. 
			When a position is opened, the margin is placed into collateral and the notional amount is borrowed 
			until the position is closed.`,
		]);
	}


	/* Health Points System */
	public healthPointsTooltip(): void {
		this._nav.displayTooltip("Health Points System", [
			`The HP system comes into play whenever a position is opened. The initial market conditions are stored and are updated near-real-time. 
			The HP metric consists of a number that can range from 0 (unhealthiest) to 100 (healthiest).`,
			`The goals of this system are:`,
			`1) Ability to determine the best time to claim profits`,
			`2) Ability to determine the best time to take losses`,
			`3) Ability to secure profits when the market moves against the position strongly in a short period of time`,
			`To achieve these goals, the HP system exposes the following components to the Trading Strategy:`,
			`1) Max HP Drawdown%: the percentage change between the highest HP the position has recorded against the current HP. This number ranges 
			between 0 to -100.`,
			`2) Max Gain Drawdown%: the percentage change between the highest gain the position has recorded against the current gain. This number 
			ranges between 0 to -100, and it only functions when at least 1 take profit level is active.`,
			`________`,
			`Why keep track of the position HP and the gain?`,
			`Even though the health points are very useful, they are not updated fast enough to react appropriately to a sharp price reversal. The HP 
			system relies on some components that can only be updated every 10-15 seconds, rendering it useless against market conditions where the 
			price can change significantly in just a few seconds.`,
			`On the other hand, the gain is calculated and evaluated every ~4 seconds, making it the perfect tool for securing profits when the price 
			moves strongly against the position. Beware that this tool should be used carefully as the price can sometimes move slightly against a position, but ultimately move in favor.`,
			`In conclusion, the health points system can be used for increasing profits and reducing losses. Whereas, the gain can be used to secure 
			profits once a high take profit level has been activated.`,
			`________`,
			`How is the HP calculated?`,
			`When a position is opened, the initial trend sum, open interest and long/short ratio values are stored. Later, these initial values as well as the rest of the components' states are used to 
			evaluate the position's HP based on its side (long or short). The components used by the Position Health module are:`,
			`1) Current trend sum vs initial trend sum (40%)`,
			`2) Trend state and trend intensity (10%)`,
			`3) Technical analysis in the following intervals: 30m, 1h, 2h, 4h, 1d (21%)`,
			`4) Current open interest vs initial open interest (5%)`,
			`5) Open Interest State (8%)`,
			`6) Current long/short ratio vs initial long/short ratio (5%)`,
			`7) Long/Short Ratio State (8%)`,
			`8) Volume State & Direction (3%)`,
			`The weight% shown above are the default values set when Epoca runs the first time. To modify these weights, go to Adjustments > Health Point Weights.`
		]);
	}


	/* Profit Optimization Strategy */
	public profitOptimizationTooltip(): void {
		this._nav.displayTooltip("Profit Optimization Strategy", [
			`The goals of this strategy are:`,
			`1) Increase profits as much as possible when conditions are in favor`,
			`2) Secure profits when conditions are starting to decay`,
			`3) Secure profits when the market experiences significant fluctuations`,
			`4) Trade without a Take Profit Ceiling`,
			`________`,
			`TAKE PROFIT LEVELS`,
			`The model makes use of 5 take profit levels in order to always adjust to
			the market's volatility. A level is comprised by:`,
			`1) Take Profit%: the percentage the market needs to change in favor for the take profit level to 
			be activated. For instance, if level 1's Take Profit% is 1 and the entry price is $20.000, 
			level's 1 take profit price will be $20.200.`,
			`2) Max HP Drawdown%: the position is closed when the current level's limit has been exceeded.`,
			`3) Max Gain Drawdown%: the position is closed when the current level's limit has been exceeded.`,
			`A take profit level is active when the market price is better than its take profit price but not 
			better than the next level's. For example:`,
			`Short at $20.000`,
			`Level 1: Take Profit%=1 -> $19.800`,
			`Level 2: Take Profit%=2 -> $19.600`,
			`Level 3: Take Profit%=3 -> $19.400`,
			`Some possible events:`,
			`- Market falls to $19.801, no take profit level is active. `,
			`- Market falls to $19.800, level 1 is active. `,
			`- Market falls to $19.544, level 2 is active. `,
			`- Market falls to $19.245, level 3 is active. `,
			`In short, the take profit levels were designed for the model to determine which 
			Max HP Drawdown% and Max Gain Drawdown% to use depending on how much profit the position has 
			accumulated so far. The higher the profit, the less tolerant to decaying conditions.`,
			`________`,
			`MAX HP DRAWDOWN% IN PROFIT`,
			`This functionality comes into play when the position is at break-even point or slightly profitable. 
			If conditions were to decay significantly, exceeding this limit, the position is closed immediately.`,
			``,
		]);
	}


	/* Loss Optimization Strategy */
	public lossOptimizationTooltip(): void {
		this._nav.displayTooltip("Loss Optimization Strategy", [
			`The goal of this strategy is to establish a maximum loss per position. As well as, reducing the loss when possible.`,
			`Stop Loss%`,
			`Active positions have a stop loss price property which is calculated based 
			on the side, entry price and stop loss%. For instance, if the stop loss% is 3 and a long position is 
			opened when BTC is worth $20.000, the stop loss price is set at $19.400. If the market moves against the
			position and hits the stop loss price, the position is closed immediately.`,
			`Max HP Drawdown% in Loss`,
			`The size of a loss can be decreased if a losing position's health points decay drastically.`,
			`Whenever the model re-calculates the position's HP, it will evaluate if it is at a loss and if the current 
			HP Drawdown% exceeds this limit, the position is closed at a loss (smaller than Stop Loss%).`
		]);
	}

	/* Idling */
	public idlingTooltip(): void {
		this._nav.displayTooltip("Idling", [
			`When a position is closed, the side goes into idling state and new positions won't be opened until 
			the state fades away. Note that this does not affect the opposite side.`,
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
