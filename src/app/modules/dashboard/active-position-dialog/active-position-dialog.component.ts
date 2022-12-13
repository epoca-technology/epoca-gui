import { Component, OnInit, Inject } from '@angular/core';
import {MatDialogRef, MAT_DIALOG_DATA} from "@angular/material/dialog";
import { 
	IActivePosition, 
	IPositionStrategy, 
	IStrategyLevelID, 
	PositionService, 
	UtilsService 
} from "../../../core";
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

	// Level
	public levelNumber: number;
	public marginAcum: number[] = [];

	// Distances
	public liquidationDistance: number;
	public targetDistance: number|undefined;
	public stopLossDistance: number|undefined;
	public increaseDistance: number|undefined;
	constructor(
		public dialogRef: MatDialogRef<ActivePositionDialogComponent>,
		@Inject(MAT_DIALOG_DATA) private data: IActivePositionDialogData,
		private _utils: UtilsService,
		private _position: PositionService
	) {
		// Init values
		this.strategy = this.data.strategy;
		this.position = this.data.position;

		// Level
		const { current, next } = this._position.getStrategyState(this.strategy, this.position.isolated_wallet);
		this.levelNumber = this._position.getLevelNumber(current.id);
		this.marginAcum = this._position.getMarginAcums(this.strategy);

		// Calculate the liquidation distance
		const liquidationDistance: number = <number>this._utils.calculatePercentageChange(
			this.position.mark_price, 
			this.position.liquidation_price
		);
		this.liquidationDistance = liquidationDistance >= 0 ? liquidationDistance: -(liquidationDistance);

		// Calculate the target distance
		const targetDistance: number = <number>this._utils.calculatePercentageChange(this.position.mark_price, this.position.target_price);
		if (this.position.side == "LONG") {
			this.targetDistance = this.position.mark_price >= this.position.target_price ? undefined: targetDistance;
		} else {
			this.targetDistance = this.position.mark_price <= this.position.target_price ? undefined: targetDistance;
		}

		// Calculate the stop loss distance
		const stopLossDistance: number = <number>this._utils.calculatePercentageChange(this.position.mark_price, this.position.stop_loss_price);
		if (this.position.side == "LONG") {
			this.stopLossDistance = this.position.mark_price <= this.position.stop_loss_price ? undefined: stopLossDistance;
		} else {
			this.stopLossDistance = this.position.mark_price >= this.position.stop_loss_price ? undefined: stopLossDistance;
		}


		// Calculate the increase distance
		const increaseDistance: number = <number>this._utils.calculatePercentageChange(this.position.mark_price, this.position.min_increase_price);
		if (this.position.side == "LONG") {
			this.increaseDistance = this.position.mark_price > this.position.min_increase_price ? increaseDistance: undefined;
		} else {
			this.increaseDistance = this.position.mark_price < this.position.min_increase_price ? increaseDistance: undefined;
		}
	}

	ngOnInit(): void {}






	
	/*
	* Closes the dialog.
	* @returns void
	* */
	public close(): void { this.dialogRef.close() }
}
