import { Component, OnInit, Inject } from '@angular/core';
import {MatDialogRef, MAT_DIALOG_DATA} from "@angular/material/dialog";
import { BigNumber } from "bignumber.js";
import { 
	IPositionRecord, 
	IBinancePositionSide, 
	UtilsService, 
} from "../../../../../core";
import { AppService, NavService } from '../../../../../services';
import { IPositionInfoDialogComponent } from './interfaces';

@Component({
  selector: 'app-position-info-dialog',
  templateUrl: './position-info-dialog.component.html',
  styleUrls: ['./position-info-dialog.component.scss']
})
export class PositionInfoDialogComponent implements OnInit, IPositionInfoDialogComponent {
	// Distances
	public liquidationDistance: number;
	public takeProfit1Distance: number|undefined;
	public takeProfit2Distance: number|undefined;
	public takeProfit3Distance: number|undefined;
	public takeProfit4Distance: number|undefined;
	public stopLossDistance: number|undefined;

	// Fees
	public fee: number;
	public openFee: number;
	public closeFee: number;

	constructor(
		public dialogRef: MatDialogRef<PositionInfoDialogComponent>,
		@Inject(MAT_DIALOG_DATA) public record: IPositionRecord,
		private _utils: UtilsService,
		private _nav: NavService,
		private _app: AppService
	) {
		// Calculate the liquidation distance
		const liquidationDistance: number = <number>this._utils.calculatePercentageChange(
			this.record.mark_price, 
			this.record.liquidation_price
		);
		this.liquidationDistance = liquidationDistance >= 0 ? liquidationDistance: -(liquidationDistance);

		// Calculate the take profit distances
		this.takeProfit1Distance = this.calculateTakeProfitDistance(this.record.side, this.record.mark_price, this.record.take_profit_price_1);
		this.takeProfit2Distance = this.calculateTakeProfitDistance(this.record.side, this.record.mark_price, this.record.take_profit_price_2);
		this.takeProfit3Distance = this.calculateTakeProfitDistance(this.record.side, this.record.mark_price, this.record.take_profit_price_3);
		this.takeProfit4Distance = this.calculateTakeProfitDistance(this.record.side, this.record.mark_price, this.record.take_profit_price_4);

		// Calculate the stop loss distance
		const stopLossDistance: number = <number>this._utils.calculatePercentageChange(this.record.mark_price, this.record.stop_loss_price);
		if (this.record.side == "LONG") {
			this.stopLossDistance = this.record.mark_price <= this.record.stop_loss_price ? undefined: stopLossDistance;
		} else {
			this.stopLossDistance = this.record.mark_price >= this.record.stop_loss_price ? undefined: stopLossDistance;
		}

		// Calculate the fees
		const posAmount: number = Math.abs(this.record.position_amount);
		const entryPrice: BigNumber = new BigNumber(this.record.entry_price);
		const markPrice: BigNumber = new BigNumber(this.record.mark_price);
		const entryAmountNotional: BigNumber = entryPrice.times(posAmount);
		const closeAmountNotional: BigNumber = markPrice.times(posAmount);
		this.openFee = <number>this._utils.outputNumber(entryAmountNotional.times(0.0004), {dp: 4, ru: true});
		this.closeFee = <number>this._utils.outputNumber(closeAmountNotional.times(0.0004), {dp: 4, ru: true});
		this.fee = <number>this._utils.outputNumber(this.openFee + this.closeFee, {dp: 4, ru: true});
	}

	ngOnInit(): void {}






	/**
	 * Calculates the take profit distance for a position.
	 * If the level is active, it returns undefined.
	 * @param side 
	 * @param mark_price 
	 * @param take_profit_price 
	 * @returns number|undefined
	 */
	private calculateTakeProfitDistance(side: IBinancePositionSide, mark_price: number, take_profit_price: number): number|undefined {
		// Calculate the distance
		const dist: number = <number>this._utils.calculatePercentageChange(mark_price, take_profit_price);

		// Evaluate it based on the side
		if (side == "LONG") {
			return mark_price >= take_profit_price ? undefined: dist;
		} else {
			return mark_price <= take_profit_price ? undefined: dist;
		}
	}








	/**
	 * Displays the stop loss order (if any)
	 */
	public displayStopLossOrder(): void {
		if (!this.record.stop_loss_order) {
			this._app.info("The position does not have a stop loss order.");
			return;
		}

		// Display it
		this._nav.displayTradeExecutionPayloadDialog(this.record.stop_loss_order);
	}





	
	/*
	* Closes the dialog.
	* @returns void
	* */
	public close(): void { this.dialogRef.close() }
}
