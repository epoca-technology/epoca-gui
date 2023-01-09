import { Component, OnInit, Inject } from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from "@angular/material/dialog";
import { AppService, ChartService, ILineChartOptions } from '../../../services';
import { 
	IActivePosition, 
	ICandlestick, 
	IPositionSideHealth, 
	IPositionStrategy, 
	PositionService, 
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
		private _chart: ChartService,
        private dialog: MatDialog,
		private _app: AppService
	) {
		// Init values
		this.strategy = this.data.strategy;
		this.position = this.data.position;
		this.health = this.data.health;
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
		let sl: number[] = [];
		let tp: number[] = [];
		for (let candlestick of this.window) {
			close.push(candlestick.c);
			high.push(candlestick.h);
			low.push(candlestick.l);
			entry.push(this.position.entry_price);
			sl.push(this.position.stop_loss_price);
			tp.push(this.position.take_profit_price);
		}

		// Calculate the highest and lowest values within the window
		const windowMax: number = <number>this._utils.getMax(high);
		const windowMin: number = <number>this._utils.getMin(low);
		const max: number = <number>this._utils.getMax([
			windowMax, 
			this.position.take_profit_price, 
			this.position.stop_loss_price, 
		]);
		const min: number = <number>this._utils.getMin([
			windowMin, 
			this.position.take_profit_price, 
			this.position.stop_loss_price, 
		]);

		// Build the chart and return it
		return this._chart.getLineChartOptions(
			{ 
				series: [
					{name: "Price", data: close, color: "#0288D1"},
					{name: "Entry", data: entry, color: "#000000"},
					{name: "SL", data: sl, color: this._chart.downwardColor},
					{name: "TP", data: tp, color: this._chart.upwardColor},
				],
				stroke: {curve: "straight", width: [4, 2, 3, 3]},
				xaxis: { labels: { show: false }, axisTicks: {show: false}, tooltip: {enabled: false}}
			},
			373, 
			true,
			{max: max, min: min}
		)
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
