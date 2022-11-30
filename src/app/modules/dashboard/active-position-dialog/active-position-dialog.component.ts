import { Component, OnInit, Inject } from '@angular/core';
import {MatDialogRef, MAT_DIALOG_DATA} from "@angular/material/dialog";
import { IActivePosition, UtilsService } from "../../../core";
import { IActivePositionDialogComponent } from './interfaces';

@Component({
  selector: 'app-active-position-dialog',
  templateUrl: './active-position-dialog.component.html',
  styleUrls: ['./active-position-dialog.component.scss']
})
export class ActivePositionDialogComponent implements OnInit, IActivePositionDialogComponent {
	public liquidationDistance: number;
	public targetDistance: number|undefined;
	public increaseDistance: number|undefined;
	constructor(
		public dialogRef: MatDialogRef<ActivePositionDialogComponent>,
		@Inject(MAT_DIALOG_DATA) public position: IActivePosition,
		private _utils: UtilsService
	) {
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

		// Calculate the increase distance
		if (this.position.min_increase_price) {
			const increaseDistance: number = <number>this._utils.calculatePercentageChange(this.position.mark_price, this.position.min_increase_price);
			if (this.position.side == "LONG") {
				this.increaseDistance = this.position.mark_price > this.position.min_increase_price ? increaseDistance: undefined;
			} else {
				this.increaseDistance = this.position.mark_price < this.position.min_increase_price ? increaseDistance: undefined;
			}
		}
	}

	ngOnInit(): void {}

	
	/*
	* Closes the dialog.
	* @returns void
	* */
	public close(): void { this.dialogRef.close() }
}
