import { Component, OnInit, Inject } from '@angular/core';
import {MatDialogRef, MAT_DIALOG_DATA, MatDialog} from "@angular/material/dialog";
import { ApexAnnotations } from 'ng-apexcharts';
import { 
	IPositionCandlestick, 
	IPositionRecord, 
	LocalDatabaseService, 
	MarketStateService, 
	PositionService, 
	UtilsService 
} from '../../../../core';
import { 
	AppService, 
	ChartService, 
	ICandlestickChartOptions, 
	ILayout, 
	NavService 
} from '../../../../services';
import { PositionInfoDialogComponent } from './position-info-dialog';
import { PositionContextDialogComponent } from './position-context-dialog';
import { IPositionRecordDialogComponent } from './interfaces';

@Component({
  selector: 'app-position-record-dialog',
  templateUrl: './position-record-dialog.component.html',
  styleUrls: ['./position-record-dialog.component.scss']
})
export class PositionRecordDialogComponent implements OnInit, IPositionRecordDialogComponent {
	// Layout
	private layout: ILayout = this._app.layout.value;

	// Position Record
	public record!: IPositionRecord;
	public markPriceChart!: ICandlestickChartOptions;
	public gainChart!: ICandlestickChartOptions;


	// Submission
	public submitting: boolean = false;

	// Load state
	public loaded: boolean = false;

	constructor(
		public dialogRef: MatDialogRef<PositionRecordDialogComponent>,
		@Inject(MAT_DIALOG_DATA) private id: string,
		public _app: AppService,
		public _nav: NavService,
		public _ms: MarketStateService,
        private dialog: MatDialog,
		private _position: PositionService,
		private _localDB: LocalDatabaseService,
		private _chart: ChartService,
		private _utils: UtilsService
	) { }

	async ngOnInit(): Promise<void> {
		await this.refreshPositionRecord();
		this.loaded = true;
		setTimeout(() => {this.processCandlesticks();});
	}








	/* Data Loader */



	/**
	 * Retrieves the position record from the server and
	 * sets it on the local property.
	 * @returns Promise<void>
	 */
	public async refreshPositionRecord(): Promise<void> {
		try {
			// Retrieve the record from the server
			this.record = await this._localDB.getPositionRecord(this.id);

			// Process the candlesticks
			this.processCandlesticks();
		} catch (e) { 
			console.log(this.record);
			this._app.error(e);
		}
	}







	/**
	 * Initializes or updates the history candlesticks.
	 */
	private processCandlesticks(): void {
		// Unpack the candlesticks
		const { markPrice, gain } = this.unpackCandlesticks();

		// Check if the charts already exist
		if (this.markPriceChart && this.gainChart) {
			/*this.markPriceChart.series = [
				{
					name: "candle",
					data: this._chart.getApexCandlesticks(markPrice)
				}
			];*/
			//this.markPriceChart.annotations = this.buildMarkPriceAnnotations(markPrice[markPrice.length - 1]);
			this.markPriceChart.series = [ {data: this._chart.getApexCandlesticks(markPrice)}];
			/*this.gainChart.series = [
				{
					name: "candle",
					data: this._chart.getApexCandlesticks(gain)
				}
			];*/
			//this.gainChart.series[0].data = this._chart.getApexCandlesticks(gain);
			//this.gainChart.annotations = { yaxis: [this.getCurrentValueAnnotation(gain[gain.length - 1])]};
			this.gainChart.series = [ {data: this._chart.getApexCandlesticks(gain)}]

		}

		// Otherwise, create them from scratch
		else {
			// Mark Price Chart
			this.markPriceChart = this._chart.getCandlestickChartOptions(
				markPrice, 
				this.buildMarkPriceAnnotations(), 
				false, 
				false,
				undefined,
				this.layout == "desktop" ? 400: 330,
				`${this._ms.getBaseAssetName(this.record.coin.symbol)} Price`
			);
			this.markPriceChart.chart!.toolbar = {show: true,tools: {selection: true,zoom: true,zoomin: true,zoomout: true,download: false}};
			this.markPriceChart.chart!.zoom = {enabled: true, type: "xy"};
			//this.markPriceChart.chart!.zoom = {enabled: false};

			// Gain Chart
			this.gainChart = this._chart.getCandlestickChartOptions(
				gain, 
				{
					yaxis: [
						{y: 0,y2: 100,borderColor: "#B2DFDB",fillColor: "#B2DFDB",strokeDashArray: 0},
						{y: 0,y2: -100,borderColor: "#FFCDD2",fillColor: "#FFCDD2",strokeDashArray: 0},
					]
				}, 
				false, 
				false,
				undefined,
				this.layout == "desktop" ? 400: 330,
				"Gain%"
			);
			//this.gainChart.annotations = {yaxis: [this.getCurrentValueAnnotation(gain[gain.length - 1])]}
			this.gainChart.chart!.toolbar = {show: true,tools: {selection: true,zoom: true,zoomin: true,zoomout: true,download: false}};
			this.gainChart.chart!.zoom = {enabled: true, type: "xy"};
			//this.gainChart.chart!.zoom = {enabled: false};
		}

		// Add the reduction annotations
		this.gainChart.annotations = this.buildReductionsAnnotations();
	}







	/**
	 * Builds the annotations for the mark price chart.
	 * @returns ApexAnnotations
	 */
	private buildMarkPriceAnnotations(): ApexAnnotations {
		// Init the annotations
		let annotations: ApexAnnotations = { yaxis: []};

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
            y2: this.record.take_profit_price_4,
            borderColor: "#00796B",
            fillColor: "#00796B",
            strokeDashArray: 0
        });
		annotations.yaxis!.push({
            y: this.record.take_profit_price_4,
            y2: this.record.take_profit_price_5,
            borderColor: "#004D40",
            fillColor: "#004D40",
            strokeDashArray: 0
        });
		annotations.yaxis!.push({
            y: this.record.take_profit_price_5,
            y2: this.record.take_profit_price_5 + (this.record.side == "LONG" ? 100000: -100000),
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
            y: this.record.liquidation_price,
            borderColor: "#B71C1C",
            fillColor: "#B71C1C",
            strokeDashArray: 0,
			borderWidth: 1
        });

		// Finally, return the annotations
		return annotations;
	}








	/**
	 * Builds the reduction annotations for a given position
	 */
	private buildReductionsAnnotations(): ApexAnnotations {
		// Init the annotations
		let annotations: ApexAnnotations = { points: []};

		// Build the points by level
		for (let tp1 of this.record.reductions.take_profit_1) {
			annotations.points!.push({
				x: tp1.t,
				y: tp1.g,
				marker: {size: 2,strokeColor: "#00796B",fillColor: "#00796B",strokeWidth: 2,shape: "square"}
			});
		}
		for (let tp2 of this.record.reductions.take_profit_2) {
			annotations.points!.push({
				x: tp2.t,
				y: tp2.g,
				marker: {size: 2,strokeColor: "#00796B",fillColor: "#00796B",strokeWidth: 2,shape: "square"}
			});
		}
		for (let tp3 of this.record.reductions.take_profit_3) {
			annotations.points!.push({
				x: tp3.t,
				y: tp3.g,
				marker: {size: 2,strokeColor: "#00796B",fillColor: "#00796B",strokeWidth: 2,shape: "square"}
			});
		}
		for (let tp4 of this.record.reductions.take_profit_4) {
			annotations.points!.push({
				x: tp4.t,
				y: tp4.g,
				marker: {size: 2,strokeColor: "#00796B",fillColor: "#00796B",strokeWidth: 2,shape: "square"}
			});
		}
		for (let tp5 of this.record.reductions.take_profit_5) {
			annotations.points!.push({
				x: tp5.t,
				y: tp5.g,
				marker: {size: 2,strokeColor: "#00796B",fillColor: "#00796B",strokeWidth: 2,shape: "square"}
			});
		}

		// Finally, return the annotations
		return annotations;
	}









	/* Candlesticks Unpacker */



	/**
	 * Unpacks the candlesticks retrieved from the record.
	 * @returns {markPrice: IPositionCandlestick[], gain: IPositionCandlestick[]}
	 */
	private unpackCandlesticks(): {
		markPrice: IPositionCandlestick[], 
		gain: IPositionCandlestick[]
	} {
		// Init the unpacked lists
		let markPrice: IPositionCandlestick[] = [];
		let gain: IPositionCandlestick[] = [];

		// Iterate over each packed record
		for (let candlestick of this.record.history) {
			markPrice.push({
				ot: candlestick.ot,
				o: candlestick.d.o[0],
				h: candlestick.d.h[0],
				l: candlestick.d.l[0],
				c: candlestick.d.c[0],
			});
			gain.push({
				ot: candlestick.ot,
				o: candlestick.d.o[1],
				h: candlestick.d.h[1],
				l: candlestick.d.l[1],
				c: candlestick.d.c[1],
			});
		}

		// Finally, return the unpacked candlesticks
		return { markPrice: markPrice, gain: gain }
	}










	/* Position Actions */




	/**
	 * Closes the active position and updates the record
	 * right away.
	 * @returns Promise<void>
	 */
	public async closePosition(): Promise<void> {
        // Calculate the PNL's color
        let pnlClass: string = "light-text";
        if (this.record.unrealized_pnl > 0) { pnlClass = "success-color" }
        else if (this.record.unrealized_pnl < 0) { pnlClass = "error-color" }

        let confirmContent: string = `
            <table class="confirmation-dialog-table bordered">
                <tbody>
                    <tr>
                        <td><strong>Entry</strong></td>
                        <td class="align-right">$${this._utils.formatNumber(this.record.entry_price)}</td>
                    </tr>
                    <tr>
                        <td><strong>Exit</strong></td>
                        <td class="align-right">$${this._utils.formatNumber(this.record.mark_price)}</td>
                    </tr>
                    <tr>
                        <td><strong>Margin</strong></td>
                        <td class="align-right">$${this._utils.formatNumber(this.record.isolated_margin)}</td>
                    </tr>
                    <tr>
                        <td><strong>PNL</strong></td>
                        <td class="align-right"><strong><span class="${pnlClass}">$${this._utils.formatNumber(this.record.unrealized_pnl)}</strong></td>
                    </tr>
                </tbody>
            </table>
        `;
        if (this.record.unrealized_pnl < 0) {
            confirmContent += `
                <p class="margin-top align-center ts-m error-color">
                    <strong>Warning:</strong> you're about to close a <strong>${this.record.side}</strong> position with a 
                    <strong>negative PNL</strong>
                </p>
            `;
        }
        this._nav.displayConfirmationDialog({
            title: `Close ${this.record.coin.symbol} ${this.record.side}`,
            content: confirmContent,
            otpConfirmation: true
        }).afterClosed().subscribe(
            async (otp: string|undefined) => {
                if (otp) {
                    // Set Submission State
                    this.submitting = true;
                    try {
                        // Perform Action
                        await this._position.closePosition(this.record.side, otp);

                        // Notify
                        this._app.success(`The ${this.record.coin.symbol} ${this.record.side} position was closed successfully.`);
                    } catch(e) { this._app.error(e) }

                    // Set Submission State
                    this.submitting = false;
                }
            }
        );
	}












	/* Misc Helpers */




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
     * Displays the position context dialog.
     */
    public displayPositionContextDialog(): void {
		this.dialog.open(PositionContextDialogComponent, {
			hasBackdrop: this._app.layout.value != "mobile",
			panelClass: "large-dialog",
			data: this.record
		})
    }





	/**
	 * Displays the Module Tooltip.
	 */
	public displayTooltip(): void {
        this._nav.displayTooltip("Position Record", [
            `@TODO`
        ]);
	}




	// Close Dialog
	public close(): void { this.dialogRef.close() }
}
