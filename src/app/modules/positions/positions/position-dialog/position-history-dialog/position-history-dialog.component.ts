import { Component, OnInit, Inject } from '@angular/core';
import {MatDialogRef, MAT_DIALOG_DATA} from "@angular/material/dialog";
import * as moment from "moment";
import { ApexAnnotations } from 'ng-apexcharts';
import { ICandlestick, IPosition, LocalDatabaseService, UtilsService } from '../../../../../core';
import { AppService, ChartService, ICandlestickChartOptions, NavService } from '../../../../../services';
import { IPositionHistoryDialogComponent } from './interfaces';

@Component({
  selector: 'app-position-history-dialog',
  templateUrl: './position-history-dialog.component.html',
  styleUrls: ['./position-history-dialog.component.scss']
})
export class PositionHistoryDialogComponent implements OnInit, IPositionHistoryDialogComponent {
	// Chart
	public chart!: ICandlestickChartOptions;

	// Helpers
	public gain: number = 0;

	// Load state
	public loaded: boolean = false;


	constructor(
		public dialogRef: MatDialogRef<PositionHistoryDialogComponent>,
		@Inject(MAT_DIALOG_DATA) public position: IPosition,
		private _app: AppService,
		public _nav: NavService,
		private _chart: ChartService,
		private _localDB: LocalDatabaseService,
		private _utils: UtilsService
	) { }

	
	
	async ngOnInit(): Promise<void> {
		// Retrieve the candlesticks and build the chart
		try {
			// Calculate the date range
			const startAt: number = moment(this.position.openTime).subtract(1, "hours").valueOf();
			const endAt: number = moment(this.position.closeTime).add(1, "hours").valueOf();
			
			// Retrieve the candlesticks
			const candlesticks: ICandlestick[] = await this._localDB.getCandlesticksForPeriod(
				startAt,
				endAt,
				this._app.serverTime.value!
			);

			// Calculate the gain
			if (this.position.side == "LONG") {
				this.gain = <number>this._utils.calculatePercentageChange(this.position.openPrice, this.position.closePrice);
			} else {
				this.gain = -(<number>this._utils.calculatePercentageChange(this.position.openPrice, this.position.closePrice));
			}

			// Build the annotations
			const annotations: ApexAnnotations = {
				yaxis: [
					{
						y: this.position.openPrice,
						y2: this.position.closePrice,
						strokeDashArray: 0,
						borderWidth: 0,
						fillColor: this.position.pnl >= 0 ? "#4DB6AC": "#E57373",
					},
					/*{
						y: this.position.openPrice,
						strokeDashArray: 5,
						borderWidth: 3,
						borderColor: this.position.pnl >= 0 ? "#00897B": "#E53935",
					},
					{
						y: this.position.closePrice,
						strokeDashArray: 0,
						borderWidth: 3,
						borderColor: this.position.pnl >= 0 ? this._chart.upwardColor: this._chart.downwardColor,
					},*/
				], 
				xaxis: [
					/*{
						x: this.position.openTime,
						strokeDashArray: 10,
						borderWidth: 0.5,
						borderColor: "#78909C",
					},
					{
						x: this.position.closeTime,
						strokeDashArray: 10,
						borderWidth: 0.5,
						borderColor: "#78909C"
					}*/
				],
				points: [
					{
						x: this.position.openTime,
						y: this.position.openPrice,
						marker: {
							size: 8,
							strokeColor: this.position.pnl >= 0 ? "#004D40": "#B71C1C",
							strokeWidth: 5,
							shape: "square", // circle|square
						}
					},
					{
						x: this.position.closeTime,
						y: this.position.closePrice,
						marker: {
							size: 8,
							strokeColor: this.position.pnl >= 0 ? "#004D40": "#B71C1C",
							strokeWidth: 5,
							shape: "square", // circle|square
						}
					}
				]
			};

			// Build the chart
			this.chart = this._chart.getCandlestickChartOptions(
				candlesticks, 
				annotations, 
				false, 
				false,
				undefined,
				this._app.layout.value == "desktop" ? 650: 450
			);
			this.chart.chart!.zoom = {enabled: false};


		} catch (e) { this._app.error(e) }

		// Set the component as loaded
		this.loaded = true;
	}







	/*
	* Closes the dialog.
	* @returns void
	* */
	public close(): void { this.dialogRef.close() }
}
