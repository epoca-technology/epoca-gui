import { Component, OnInit, Inject } from '@angular/core';
import {MatDialogRef, MAT_DIALOG_DATA, MatDialog} from "@angular/material/dialog";
import { ApexAnnotations } from 'ng-apexcharts';
import * as moment from "moment";
import { 
	CandlestickService,
	ICandlestick,
	IPositionRecord, 
	MarketStateService, 
} from '../../../../../core';
import { 
	AppService, 
	ChartService, 
	ICandlestickChartOptions, 
	ILayout, 
	NavService 
} from '../../../../../services';
import { PositionInfoDialogComponent } from '../position-info-dialog';
import { IPositionContextDialogComponent } from './interfaces';

@Component({
  selector: 'app-position-context-dialog',
  templateUrl: './position-context-dialog.component.html',
  styleUrls: ['./position-context-dialog.component.scss']
})
export class PositionContextDialogComponent implements OnInit, IPositionContextDialogComponent {
	// Layout
	private layout: ILayout = this._app.layout.value;

	// Position Record
	public chart!: ICandlestickChartOptions;

	// Load state
	public loaded: boolean = false;

	constructor(
		public dialogRef: MatDialogRef<PositionContextDialogComponent>,
		@Inject(MAT_DIALOG_DATA) public record: IPositionRecord,
		public _app: AppService,
		public _nav: NavService,
		public _ms: MarketStateService,
		private _candlestick: CandlestickService,
		private _chart: ChartService,
        private dialog: MatDialog,
	) { }



	async ngOnInit(): Promise<void> {
		try {
			// Retrieve the candlesticks
			const candlesticks: ICandlestick[] = await this._candlestick.getForPeriod(
				moment(this.record.open).subtract(6, "hours").valueOf(),
				moment(this.record.close).add(6, "hours").valueOf(),
			);

			// Build the chart
			this.chart = this._chart.getCandlestickChartOptions(
				candlesticks, 
				this.buildMarkPriceAnnotations(), 
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
	private buildMarkPriceAnnotations(): ApexAnnotations {
		// Init the annotations
		let annotations: ApexAnnotations = { yaxis: [], xaxis: [], points: [] };

		// Add the entry and the exit points
		//const pointsColor: string = this.record.gain >= 0 ? "#004D40": "#B71C1C";
		const pointsColor: string = "#263238";
		annotations.points!.push({
			x: this.record.open,
			y: this.record.entry_price,
			marker: {
				size: 3,
				strokeColor: pointsColor,
				fillColor: pointsColor,
				strokeWidth: 3,
				shape: "square", // circle|square
			}
		});
		annotations.points!.push({
			x: this.record.close,
			y: this.record.mark_price,
			marker: {
				size: 3,
				strokeColor: pointsColor,
				fillColor: pointsColor,
				strokeWidth: 3,
				shape: "square", // circle|square
			}
		});


		// Add the open and close range
		annotations.xaxis!.push({
            x: this.record.open,
            x2: this.record.close,
            borderColor: "#ECEFF1",
            fillColor: "#ECEFF1",
            strokeDashArray: 0
        });


		// Add the take profit levels
		annotations.yaxis!.push({
            y: this.record.entry_price,
            y2: this.record.take_profit_price_1,
            borderColor: "#B2DFDB",
            fillColor: "#B2DFDB",
            strokeDashArray: 0
        });
		annotations.yaxis!.push({
            y: this.record.take_profit_price_1,
            y2: this.record.take_profit_price_2,
            borderColor: "#4DB6AC",
            fillColor: "#4DB6AC",
            strokeDashArray: 0
        });
		annotations.yaxis!.push({
            y: this.record.take_profit_price_2,
            y2: this.record.take_profit_price_3,
            borderColor: "#009688",
            fillColor: "#009688",
            strokeDashArray: 0
        });
		annotations.yaxis!.push({
            y: this.record.take_profit_price_3,
            y2: this.record.take_profit_price_3 + (this.record.side == "LONG" ? 5000: -5000),
            borderColor: "#004D40",
            fillColor: "#004D40",
            strokeDashArray: 0
        });

		// Add the stop loss
		annotations.yaxis!.push({
            y: this.record.entry_price,
            y2: this.record.stop_loss_price,
            borderColor: "#FFCDD2",
            fillColor: "#FFCDD2",
            strokeDashArray: 0
        });
		annotations.yaxis!.push({
            y: this.record.stop_loss_price,
            borderColor: "#B71C1C",
            fillColor: "#B71C1C",
            strokeDashArray: 0,
			borderWidth: 1
        });

		// Finally, return the annotations
		return annotations;
	}







	/**
     * Displays the position info dialog.
     */
    public displayPositionInfoDialog(): void {
		this.dialog.open(PositionInfoDialogComponent, {
			hasBackdrop: this._app.layout.value != "mobile",
			panelClass: "small-dialog",
			data: this.record
		})
    }







	/**
	 * Displays the Module Tooltip.
	 */
	public displayTooltip(): void {
        this._nav.displayTooltip("Position Context", [
            `@TODO`
        ]);
	}




	// Close Dialog
	public close(): void { this.dialogRef.close() }
}
