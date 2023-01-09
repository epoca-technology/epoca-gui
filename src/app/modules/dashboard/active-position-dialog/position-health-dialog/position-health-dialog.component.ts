import { Component, OnInit, Inject } from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from "@angular/material/dialog";
import { AppService, ChartService, ICandlestickChartOptions } from '../../../../services';
import { 
	IBinancePositionSide, 
	IPositionHealthCandlesticks, 
	IPositionSideHealth, 
	PositionService 
} from '../../../../core';
import { PositionHealthDetailsDialogComponent } from './position-health-details-dialog';
import { IPositionHealthDialogComponent, IPositionHealthDialogData } from './interfaces';

@Component({
  selector: 'app-position-health-dialog',
  templateUrl: './position-health-dialog.component.html',
  styleUrls: ['./position-health-dialog.component.scss']
})
export class PositionHealthDialogComponent implements OnInit, IPositionHealthDialogComponent {
	// Inherited Values
	public side!: IBinancePositionSide;
	public health!: IPositionSideHealth;

	// Charts
	public hpChart!: ICandlestickChartOptions;
	public ddChart!: ICandlestickChartOptions;

	// Load state
	public loaded: boolean = false;

	constructor(
		private dialogRef: MatDialogRef<PositionHealthDialogComponent>,
		@Inject(MAT_DIALOG_DATA) private data: IPositionHealthDialogData,
		private _app: AppService,
		private _position: PositionService,
		private dialog: MatDialog,
		private _chart: ChartService
	) { }

	async ngOnInit(): Promise<void> {
		// Set the inherited values
		this.side = this.data.side;
		this.health = this.data.health;

		// Retrieve the candlesticks and build the charts
		try {
			const candlesticks: IPositionHealthCandlesticks = 
				await this._position.getPositionHealthCandlesticks(this.side);
			this.hpChart = this._chart.getCandlestickChartOptions(
				candlesticks.hp, 
				undefined, 
				false, 
				true,
				undefined,
				330,
				"Health Points"
			);
			this.hpChart.chart!.zoom = {enabled: true, type: "xy"}
			this.ddChart = this._chart.getCandlestickChartOptions(
				candlesticks.dd, 
				undefined, 
				false, 
				true,
				undefined,
				330,
				"Drawdown%"
			);
			this.ddChart.chart!.zoom = {enabled: true, type: "xy"}
		} catch (e) { this._app.error(e) }

		// Set the component as loaded
		this.loaded = true;
	}







	/**
	 * Displays the position health dialog.
	 */
    public displayHealthDetailsDialog(): void {
		this.dialog.open(PositionHealthDetailsDialogComponent, {
			hasBackdrop: true,
			panelClass: "light-dialog",
			data: this.health
		})
	}





	/*
	* Closes the dialog.
	* @returns void
	* */
	public close(): void { this.dialogRef.close() }
}
