import { Component, OnInit, Inject } from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from "@angular/material/dialog";
import { AppService, ChartService, ICandlestickChartOptions } from '../../../services';
import { 
	IBinancePositionSide, 
	IPositionHealthCandlestick,
	IPositionHealthCandlestickRecord, 
	IPositionSideHealth, 
	PositionService 
} from '../../../core';
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
	public mgddChart!: ICandlestickChartOptions;

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
			const { hp, dd, mgdd } = await this.getCandlesticks();
			this.hpChart = this._chart.getCandlestickChartOptions(
				hp, 
				undefined, 
				false, 
				true,
				undefined,
				330,
				"Health Points"
			);
			this.hpChart.chart!.zoom = {enabled: false};
			this.ddChart = this._chart.getCandlestickChartOptions(
				dd, 
				undefined, 
				false, 
				true,
				undefined,
				330,
				"Health Points Drawdown%"
			);
			this.ddChart.chart!.zoom = {enabled: false};
			this.mgddChart = this._chart.getCandlestickChartOptions(
				mgdd, 
				undefined, 
				false, 
				true,
				undefined,
				330,
				"Gain Drawdown%"
			);
			this.mgddChart.chart!.zoom = {enabled: false};
		} catch (e) { this._app.error(e) }

		// Set the component as loaded
		this.loaded = true;
	}






	/**
	 * Retrieves the position health candlestick records and unpacks them.
	 * @returns Promise<{hp: IPositionHealthCandlestick[], dd: IPositionHealthCandlestick[], mgdd: IPositionHealthCandlestick[]}>
	 */
	private async getCandlesticks(): Promise<{hp: IPositionHealthCandlestick[], dd: IPositionHealthCandlestick[], mgdd: IPositionHealthCandlestick[]}> {
		// Init the unpacked lists
		let hp: IPositionHealthCandlestick[] = [];
		let dd: IPositionHealthCandlestick[] = [];
		let mgdd: IPositionHealthCandlestick[] = [];

		// Download the candlestick records and unpack them
		const candlesticks: IPositionHealthCandlestickRecord[] = await this._position.getPositionHealthCandlesticks(this.side);
		for (let candlestick of candlesticks) {
			hp.push({ 
				ot: candlestick.ot,
				o: candlestick.d.o[0],
				h: candlestick.d.h[0],
				l: candlestick.d.l[0],
				c: candlestick.d.c[0],
			});
			dd.push({ 
				ot: candlestick.ot,
				o: candlestick.d.o[1],
				h: candlestick.d.h[1],
				l: candlestick.d.l[1],
				c: candlestick.d.c[1],
			});
			mgdd.push({ 
				ot: candlestick.ot,
				o: candlestick.d.o[2],
				h: candlestick.d.h[2],
				l: candlestick.d.l[2],
				c: candlestick.d.c[2],
			});
		}


		// Finally, return the unpacked candlesticks
		return { hp: hp, dd: dd, mgdd: mgdd }
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
