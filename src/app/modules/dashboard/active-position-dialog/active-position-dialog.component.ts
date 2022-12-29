import { Component, OnInit, Inject } from '@angular/core';
import {MatDialogRef, MAT_DIALOG_DATA} from "@angular/material/dialog";
import { ChartService, ILineChartOptions } from '../../../services';
import { 
	IActivePosition, 
	ICandlestick, 
	IPositionStrategy, 
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
	private window: ICandlestick[];

	// Distances
	public liquidationDistance: number;
	public takeProfitDistance: number|undefined;
	public stopLossDistance: number|undefined;

	// Chart
	public chart!: ILineChartOptions;

	// Tab Navigation
	public activeIndex: number = 0;


	constructor(
		public dialogRef: MatDialogRef<ActivePositionDialogComponent>,
		@Inject(MAT_DIALOG_DATA) private data: IActivePositionDialogData,
		private _utils: UtilsService,
		private _position: PositionService,
		private _chart: ChartService
	) {
		// Init values
		this.strategy = this.data.strategy;
		this.position = this.data.position;
		this.window = this.data.window;

		// Calculate the liquidation distance
		const liquidationDistance: number = <number>this._utils.calculatePercentageChange(
			this.position.mark_price, 
			this.position.liquidation_price
		);
		this.liquidationDistance = liquidationDistance >= 0 ? liquidationDistance: -(liquidationDistance);

		// Calculate the target distance
		const takeProfitDistance: number = <number>this._utils.calculatePercentageChange(
			this.position.mark_price, 
			this.position.take_profit_price
		);
		if (this.position.side == "LONG") {
			this.takeProfitDistance = this.position.mark_price >= this.position.take_profit_price ? undefined: takeProfitDistance;
		} else {
			this.takeProfitDistance = this.position.mark_price <= this.position.take_profit_price ? undefined: takeProfitDistance;
		}

		// Calculate the stop loss distance
		const stopLossDistance: number = <number>this._utils.calculatePercentageChange(this.position.mark_price, this.position.stop_loss_price);
		if (this.position.side == "LONG") {
			this.stopLossDistance = this.position.mark_price <= this.position.stop_loss_price ? undefined: stopLossDistance;
		} else {
			this.stopLossDistance = this.position.mark_price >= this.position.stop_loss_price ? undefined: stopLossDistance;
		}

		// Build the chart
		this.chart = this.buildChart();
	}

	ngOnInit(): void {}







	/**
	 * Builds the position chart.
	 * @returns ILineChartOptions
	 */
	private buildChart(): ILineChartOptions {
		// Build the required lists
		let close: number[] = [];
		let high: number[] = [];
		let low: number[] = [];
		let entry: number[] = [];
		let tp: number[] = [];
		let sl: number[] = [];
		for (let candlestick of this.window) {
			close.push(candlestick.c);
			high.push(candlestick.h);
			low.push(candlestick.l);
			entry.push(this.position.entry_price);
			tp.push(this.position.take_profit_price);
			sl.push(this.position.stop_loss_price);
		}

		// Calculate the highest and lowest values within the window
		const windowMax: number = <number>this._utils.getMax(high);
		const windowMin: number = <number>this._utils.getMin(low);
		const max: number = <number>this._utils.getMax([
			windowMax, 
			//this.position.liquidation_price, 
			this.position.take_profit_price, 
			this.position.stop_loss_price, 
		]);
		const min: number = <number>this._utils.getMin([
			windowMin, 
			//this.position.liquidation_price, 
			this.position.take_profit_price, 
			this.position.stop_loss_price, 
		]);

		// Build the chart and return it
		return this._chart.getLineChartOptions(
			{ 
				series: [
					{name: "Price", data: close, color: "#0288D1"},
					{name: "Entry", data: entry, color: "#000000"},
					{name: "Take Profit", data: tp, color: this._chart.upwardColor},
					{name: "Stop Loss", data: sl, color: this._chart.downwardColor},
				],
				stroke: {curve: "straight", width: [4, 2, 3, 3]},
				/*annotations: {
					yaxis: [
						{
							y: this.position.entry_price,
							strokeDashArray: 1,
							borderColor: "#000000",
							fillColor: "#000000",
							label: {
								borderColor: "#000000",
								style: { color: "#fff", background: "#000000"},
								text: `OPEN`,
							}
						},

					]
				}*/
			},
			300, 
			true,
			{max: max, min: min}
		)
	}






	
	/*
	* Closes the dialog.
	* @returns void
	* */
	public close(): void { this.dialogRef.close() }
}
