import { Component, OnInit, Inject } from '@angular/core';
import {MatDialogRef, MAT_DIALOG_DATA} from "@angular/material/dialog";
import { BigNumber } from "bignumber.js";
import * as moment from "moment";
import { 
	IPositionRecord, 
	IBinancePositionSide, 
	UtilsService,
	PositionService,
	ITakeProfitLevelID,
	IPositionReduction, 
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
	public takeProfit5Distance: number|undefined;

	// ROE
	public roe: number;

	constructor(
		public dialogRef: MatDialogRef<PositionInfoDialogComponent>,
		@Inject(MAT_DIALOG_DATA) public record: IPositionRecord,
		private _utils: UtilsService,
		private _nav: NavService,
		private _app: AppService,
		private _position: PositionService
	) {
		// Calculate the ROE
		this.roe = <number>this._utils.outputNumber(this.record.gain * this.record.leverage);

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
		this.takeProfit5Distance = this.calculateTakeProfitDistance(this.record.side, this.record.mark_price, this.record.take_profit_price_5);
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
	 * Displays the list of take profit reduction records.
	 * @param id 
	 * @param reductions 
	 */
	public displayTakeProfitReductions(id: ITakeProfitLevelID, reductions: IPositionReduction[]): void {
		if (reductions.length) {
			// Init the content
			let content: string[] = [];

			// Iterate over idle zones
			for (let i = 0; i < reductions.length; i++) {
				content.push("REDUCTION TIME");
				content.push(moment(reductions[i].t).format("dddd, MMMM Do, h:mm:ss a"));
				content.push("NEXT REDUCTION");
				content.push(moment(reductions[i].nr).format("dddd, MMMM Do, h:mm:ss a"));
				content.push(`CHUNK SIZE: ${reductions[i].rcz}`);
				content.push(`GAIN: ${reductions[i].g}%`);
				if (i < reductions.length - 1) content.push(`------`);
			}

			// Finally, display the info
			this._nav.displayTooltip(id.toUpperCase(), content);
		} else { 
			this._app.info(`There have been no reductions in: ${id}`);
		}
	}




	
	/*
	* Closes the dialog.
	* @returns void
	* */
	public close(): void { this.dialogRef.close() }
}
