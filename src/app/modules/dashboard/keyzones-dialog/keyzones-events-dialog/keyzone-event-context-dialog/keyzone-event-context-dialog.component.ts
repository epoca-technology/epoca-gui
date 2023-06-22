import { Component, OnInit, Inject } from '@angular/core';
import {MatDialogRef, MAT_DIALOG_DATA, MatDialog} from "@angular/material/dialog";
import { ApexAnnotations } from 'ng-apexcharts';
import * as moment from "moment";
import { 
	CandlestickService,
	ICandlestick,
	IKeyZoneStateEvent,
	MarketStateService,
	UtilsService, 
} from '../../../../../core';
import { 
	AppService, 
	ChartService, 
	ICandlestickChartOptions, 
	ILayout, 
	NavService 
} from '../../../../../services';
import { ReversalStateDialogComponent } from '../../../reversal-state-dialog';
import { IKeyZoneEventContextDialogComponent } from './interfaces';

@Component({
  selector: 'app-keyzone-event-context-dialog',
  templateUrl: './keyzone-event-context-dialog.component.html',
  styleUrls: ['./keyzone-event-context-dialog.component.scss']
})
export class KeyzoneEventContextDialogComponent implements OnInit, IKeyZoneEventContextDialogComponent {
	// Layout
	private layout: ILayout = this._app.layout.value;

	// Position Record
	public chart!: ICandlestickChartOptions;

	// Load state
	public loaded: boolean = false;

	constructor(
		public dialogRef: MatDialogRef<KeyzoneEventContextDialogComponent>,
		@Inject(MAT_DIALOG_DATA) public evt: IKeyZoneStateEvent,
		public _app: AppService,
		public _nav: NavService,
		public _ms: MarketStateService,
		private _candlestick: CandlestickService,
		private _chart: ChartService,
		private _utils: UtilsService,
		private dialog: MatDialog
	) { }



	async ngOnInit(): Promise<void> {
		try {
			// Retrieve the candlesticks
			const candlesticks: ICandlestick[] = await this._candlestick.getForPeriod(
				moment(this.evt.t).subtract(6, "hours").valueOf(),
				moment(this.evt.t).add(6, "hours").valueOf(),
			);

			// Build the chart
			this.chart = this._chart.getCandlestickChartOptions(
				candlesticks, 
				this.buildEventAnnotations(), 
				false, 
				true,
				undefined,
				this.layout == "desktop" ? 600: 400
			);
			this.chart.chart!.toolbar = {show: true,tools: {selection: true,zoom: true,zoomin: true,zoomout: true,download: false}};
			this.chart.chart!.zoom = {enabled: true, type: "xy"};
		} catch (e) {
			this._app.error(e);
			setTimeout(() => { this.close() }, 500);
		}
		this.loaded = true;
	}






	/**
	 * Builds the annotations for the mark price chart.
	 * @returns ApexAnnotations
	 */
	private buildEventAnnotations(): ApexAnnotations {
		// Init the annotations
		let annotations: ApexAnnotations = { yaxis: [], xaxis: [], points: [] };

		// Initialize the color
		const color: string = this.evt.k == "s" ? "#870505": "#083d34";

		// Add the entry and the exit points
		const pointsColor: string = "#000000";
		annotations.points!.push({
			x: this.evt.t,
			y: this.evt.k == 's' ? this.evt.kz.e: this.evt.kz.s,
			marker: {
				size: 3,
				strokeColor: pointsColor,
				fillColor: pointsColor,
				strokeWidth: 3,
				shape: "square", // circle|square
			}
		});


		// Add the KeyZone
		annotations.yaxis!.push({
			y: this.evt.kz.s,
			y2: this.evt.kz.e,
			strokeDashArray: 0,
			borderColor: color,
			fillColor: color
		});

		// Finally, return the annotations
		return annotations;
	}












	/**
	 * Displays the reversal state dialog.
	 */
	public displayReversalEventDialog(): void {
		this.dialog.open(ReversalStateDialogComponent, {
			hasBackdrop: this._app.layout.value != "mobile",
			panelClass: "large-dialog",
			data: this.evt.t
		})
	}







	/**
     * Displays the keyzone event info dialog.
     */
    public displayEventInfoDialog(): void {
		const zoneSize: number = <number>this._utils.calculatePercentageChange(this.evt.kz.s, this.evt.kz.e);
		let title: string = this.evt.k == "s" ? "Support": "Resistance";
		this._nav.displayTooltip(`${title}: ${this.evt.kz.scr}/10`, [
			`ID: ${this.evt.kz.id}`,
			`${moment(this.evt.kz.id).format("dddd, MMMM Do, h:mm:ss a")}`,
			`-----`,
			`RANGE ${zoneSize}%`,
			`$${this._utils.formatNumber(this.evt.kz.s)} - $${this._utils.formatNumber(this.evt.kz.e)}`,
			`-----`,
			`EVENT ISSUANCE`,
			`${moment(this.evt.t).format("dddd, MMMM Do, h:mm:ss a")}`,
			`-----`,
			`EXPIRATION`,
			`${moment(this.evt.e).format("dddd, MMMM Do, h:mm:ss a")}`,
			`Price ${this.evt.k == 's' ? '>': '<'} $${this._utils.formatNumber(this.evt.pl)}`,
			`-----`,
			`VOL. INTENSITY: ${this.evt.kz.vi}/4`,
			`-----`,
			`LIQ. SHARE: ${this.evt.kz.ls}%`,
		]);
    }







	/**
	 * Displays the Module Tooltip.
	 */
	public displayTooltip(): void {
        this._nav.displayTooltip(this.evt.k == "s" ? "Support Contact": "Resistance Contact", [
            `@TODO`
        ]);
	}




	// Close Dialog
	public close(): void { this.dialogRef.close() }

}
