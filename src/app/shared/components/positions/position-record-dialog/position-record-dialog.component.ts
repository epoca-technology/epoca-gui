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
	IChartRange, 
	ILayout, 
	NavService 
} from '../../../../services';
import { PositionInfoDialogComponent } from './position-info-dialog';
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
	public gainDrawdownChart!: ICandlestickChartOptions;


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
		this.submitting = true;
		try {
			// Retrieve the record from the server
			this.record = await this._localDB.getPositionRecord(this.id);

			// Process the candlesticks
			this.processCandlesticks();
		} catch (e) { 
			console.log(this.record);
			this._app.error(e);
		}
		this.submitting = false;
	}







	/**
	 * Initializes or updates the history candlesticks.
	 */
	private processCandlesticks(): void {
		// Unpack the candlesticks
		const { markPrice, gain, gainDrawdown } = this.unpackCandlesticks();

		// Calculate the mark price chart range
		const { min, max } = this.calculateMarkPriceRange(markPrice);

		// Check if the charts already exist
		if (this.markPriceChart && this.gainChart && this.gainDrawdownChart) {
			/*this.markPriceChart.series = [
				{
					name: "candle",
					data: this._chart.getApexCandlesticks(markPrice)
				}
			];*/
			this.markPriceChart.series = [ {data: this._chart.getApexCandlesticks(markPrice)}];
			this.markPriceChart.yaxis.min = min;
			this.markPriceChart.yaxis.max = max;
			/*this.gainChart.series = [
				{
					name: "candle",
					data: this._chart.getApexCandlesticks(gain)
				}
			];*/
			//this.gainChart.series[0].data = this._chart.getApexCandlesticks(gain);
			this.gainChart.series = [ {data: this._chart.getApexCandlesticks(gain)}]
			/*this.gainDrawdownChart.series = [
				{
					name: "candle",
					data: this._chart.getApexCandlesticks(gainDrawdown)
				}
			];*/
			//this.gainDrawdownChart.series[0].data = this._chart.getApexCandlesticks(gainDrawdown);
			this.gainDrawdownChart.series = [ {data: this._chart.getApexCandlesticks(gainDrawdown)}]
		}

		// Otherwise, create them from scratch
		else {
			// Mark Price Chart
			this.markPriceChart = this._chart.getCandlestickChartOptions(
				markPrice, 
				this.buildMarkPriceAnnotations(), 
				false, 
				true,
				{ min: min, max: max},
				this.layout == "desktop" ? 400: 330,
				"Mark Price"
			);
			this.markPriceChart.chart!.toolbar = {show: true,tools: {selection: true,zoom: true,zoomin: true,zoomout: true,download: false}};
			this.markPriceChart.chart!.zoom = {enabled: true, type: "xy"};
			//this.markPriceChart.chart!.zoom = {enabled: false};

			// Gain Chart
			this.gainChart = this._chart.getCandlestickChartOptions(
				gain, 
				undefined, 
				false, 
				false,
				undefined,
				this.layout == "desktop" ? 400: 330,
				"Gain%"
			);
			this.gainChart.annotations = {
				yaxis: [
					{
						y: 0,
						y2: 100,
						borderColor: "#B2DFDB",
						fillColor: "#B2DFDB",
						strokeDashArray: 0
					},
					{
						y: 0,
						y2: -100,
						borderColor: "#FFCDD2",
						fillColor: "#FFCDD2",
						strokeDashArray: 0
					}
				]
			}
			this.gainChart.chart!.toolbar = {show: true,tools: {selection: true,zoom: true,zoomin: true,zoomout: true,download: false}};
			this.gainChart.chart!.zoom = {enabled: true, type: "xy"};
			//this.gainChart.chart!.zoom = {enabled: false};

			// Gain Drawdown Chart
			this.gainDrawdownChart = this._chart.getCandlestickChartOptions(
				gainDrawdown, 
				undefined, 
				false, 
				false,
				undefined,
				this.layout == "desktop" ? 400: 330,
				"Gain Drawdown%"
			);
			this.gainDrawdownChart.chart!.toolbar = {show: true,tools: {selection: true,zoom: true,zoomin: true,zoomout: true,download: false}};
			this.gainDrawdownChart.chart!.zoom = {enabled: true, type: "xy"};
			//this.gainDrawdownChart.chart!.zoom = {enabled: false};
		}
	}






	/**
	 * Calculates the range that should be applied to the mark price chart.
	 * @param candlesticks 
	 * @returns IChartRange
	 */
	private calculateMarkPriceRange(candlesticks: IPositionCandlestick[]): IChartRange {
		// Init values
		let min: number = 0;
		let max: number = 0;

		// Iterate over each candlestick and populate the min and max values
		for (let candlestick of candlesticks) {
			min = min == 0 || candlestick.l < 0 ? candlestick.l: min;
			max = candlestick.h > max ? candlestick.h: max;
		}

		// Update the values based on the exit combinations.
		if (this.record.side == "LONG") {
			max = this.record.take_profit_price_3 > max ? this.record.take_profit_price_3: max;
			min = this.record.stop_loss_price < min ? this.record.stop_loss_price: min;
		} else {
			max = this.record.stop_loss_price > max ? this.record.stop_loss_price: max;
			min = this.record.take_profit_price_3 < min ? this.record.take_profit_price_3: min;
		}

		// Finally, return the range
		return { min: min, max: max };
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
            y2: this.record.take_profit_price_3 + (this.record.side == "LONG" ? 1000: -1000),
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
	 * Unpacks the candlesticks retrieved from the record.
	 * @returns {markPrice: IPositionCandlestick[], gain: IPositionCandlestick[], gainDrawdown: IPositionCandlestick[]}
	 */
	private unpackCandlesticks(): {
		markPrice: IPositionCandlestick[], 
		gain: IPositionCandlestick[], 
		gainDrawdown: IPositionCandlestick[]
	} {
		// Init the unpacked lists
		let markPrice: IPositionCandlestick[] = [];
		let gain: IPositionCandlestick[] = [];
		let gainDrawdown: IPositionCandlestick[] = [];

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
			gainDrawdown.push({
				ot: candlestick.ot,
				o: candlestick.d.o[2],
				h: candlestick.d.h[2],
				l: candlestick.d.l[2],
				c: candlestick.d.c[2],
			});
		}

		// Finally, return the unpacked candlesticks
		return { markPrice: markPrice, gain: gain, gainDrawdown: gainDrawdown }
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
                        await this._position.closePosition(this.record.coin.symbol, otp);

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
     * Displays the signal records dialog.
     */
    public displayPositionInfoDialog(): void {
		this.dialog.open(PositionInfoDialogComponent, {
			hasBackdrop: this._app.layout.value != "mobile",
			panelClass: "small-dialog",
			data: this.record
		})
    }




	/**
	 * Displays the Signal Module Tooltip.
	 */
	public displayTooltip(): void {
        this._nav.displayTooltip("Position Record", [
            `@TODO`
        ]);
	}




	// Close Dialog
	public close(): void { this.dialogRef.close() }
}
