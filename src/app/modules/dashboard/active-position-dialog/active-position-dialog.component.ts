import { Component, OnInit, Inject } from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from "@angular/material/dialog";
import { AppService } from '../../../services';
import { 
	IActivePosition, 
	IBinancePositionSide, 
	IPositionSideHealth, 
	IPositionStrategy, 
	UtilsService 
} from "../../../core";
import { IPositionHealthDialogData, PositionHealthDialogComponent } from './position-health-dialog';
import { IActivePositionDialogComponent, IActivePositionDialogData } from './interfaces';

@Component({
  selector: 'app-active-position-dialog',
  templateUrl: './active-position-dialog.component.html',
  styleUrls: ['./active-position-dialog.component.scss']
})
export class ActivePositionDialogComponent implements OnInit, IActivePositionDialogComponent {
	// Inherited data
	public strategy: IPositionStrategy;
	public position: IActivePosition;
	public health: IPositionSideHealth;

	// Distances
	public liquidationDistance: number;
	public takeProfit1Distance: number|undefined;
	public takeProfit2Distance: number|undefined;
	public takeProfit3Distance: number|undefined;
	public takeProfit4Distance: number|undefined;
	public takeProfit5Distance: number|undefined;
	public stopLossDistance: number|undefined;


	constructor(
		public dialogRef: MatDialogRef<ActivePositionDialogComponent>,
		@Inject(MAT_DIALOG_DATA) private data: IActivePositionDialogData,
		private _utils: UtilsService,
        private dialog: MatDialog,
		private _app: AppService
	) {
		// Init values
		this.strategy = this.data.strategy;
		this.position = this.data.position;
		this.health = this.data.health;

		// Calculate the liquidation distance
		const liquidationDistance: number = <number>this._utils.calculatePercentageChange(
			this.position.mark_price, 
			this.position.liquidation_price
		);
		this.liquidationDistance = liquidationDistance >= 0 ? liquidationDistance: -(liquidationDistance);

		// Calculate the take profit distances
		this.takeProfit1Distance = this.calculateTakeProfitDistance(this.position.side, this.position.mark_price, this.position.take_profit_price_1);
		this.takeProfit2Distance = this.calculateTakeProfitDistance(this.position.side, this.position.mark_price, this.position.take_profit_price_2);
		this.takeProfit3Distance = this.calculateTakeProfitDistance(this.position.side, this.position.mark_price, this.position.take_profit_price_3);
		this.takeProfit4Distance = this.calculateTakeProfitDistance(this.position.side, this.position.mark_price, this.position.take_profit_price_4);
		this.takeProfit5Distance = this.calculateTakeProfitDistance(this.position.side, this.position.mark_price, this.position.take_profit_price_5);

		// Calculate the stop loss distance
		const stopLossDistance: number = <number>this._utils.calculatePercentageChange(this.position.mark_price, this.position.stop_loss_price);
		if (this.position.side == "LONG") {
			this.stopLossDistance = this.position.mark_price <= this.position.stop_loss_price ? undefined: stopLossDistance;
		} else {
			this.stopLossDistance = this.position.mark_price >= this.position.stop_loss_price ? undefined: stopLossDistance;
		}
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
	 * Displays the position health dialog.
	 */
    public displayHealthDialog(): void {
		this.dialog.open(PositionHealthDialogComponent, {
			hasBackdrop: this._app.layout.value != "mobile",
			panelClass: "large-dialog",
			data: <IPositionHealthDialogData>{
				side: this.position.side,
				health: this.health
			}
		})
	}






	
	/*
	* Closes the dialog.
	* @returns void
	* */
	public close(): void { this.dialogRef.close() }
}
