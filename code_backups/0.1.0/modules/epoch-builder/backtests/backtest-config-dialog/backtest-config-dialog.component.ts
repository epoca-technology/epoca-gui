import { Component, OnInit } from '@angular/core';
import {MatDialogRef} from "@angular/material/dialog";
import { AppService } from '../../../../services';
import { IBacktestOrder } from '../../../../core';
import { IBacktestConfigDialogComponent, IConfigResponse, IOrder } from './interfaces';

@Component({
  selector: 'app-backtest-config-dialog',
  templateUrl: './backtest-config-dialog.component.html',
  styleUrls: ['./backtest-config-dialog.component.scss']
})
export class BacktestConfigDialogComponent implements OnInit, IBacktestConfigDialogComponent {

	public orders: IOrder[] = [
		{
			id: "points", 
			name: "Points", 
			description: "Backtests will be ordered by the points collected.",
			icon: "query_stats"
		},
		{
			id: "point_medians", 
			name: "Point Medians", 
			description: "Backtests will be ordered by the median of the points collected.",
			icon: "vertical_align_center"
		},
		{
			id: "acc", 
			name: "Accuracy", 
			description: "Backtests will be ordered by the general accuracy received.",
			icon: "ads_click"
		}
	]
	public order: IBacktestOrder|undefined;
	public quantities: number[] = [ 5, 10, 15, 20, 40, 60, 80, 100, 150, 200, 500, 1000 ]

    constructor(
		public dialogRef: MatDialogRef<BacktestConfigDialogComponent>,
		public _app: AppService
	) { }

    ngOnInit(): void {
    }





	/**
	 * Toggles an order ID.
	 * @param orderID 
	 * @returns void
	 */
	public toggleOrder(orderID: IBacktestOrder): void {
		this.order = orderID == this.order ? undefined: orderID
	}




	/*
	* Closes the dialog.
	* @returns void
	* */
	public close(limit?: number): void { 
		if (typeof limit == "number") {
			this.dialogRef.close(<IConfigResponse>{ order: this.order, limit: limit})
		} else {
			this.dialogRef.close(undefined) 
		}
	}
}
