import { Component, OnDestroy, OnInit } from '@angular/core';
import {MatDialogRef} from "@angular/material/dialog";
import * as moment from "moment";
import { ApexAnnotations, PointAnnotations } from 'ng-apexcharts';
import { Subscription } from 'rxjs';
import { 
	ICandlestick,
	IFullLiquidityState,
	ILiquidityIntensity,
	ILiquidityIntensityRequirements,
	ILiquidityPeaks,
	ILiquidityPriceLevel, 
	ILiquiditySide, 
	MarketStateService, 
	UtilsService 
} from '../../../core';
import { 
	AppService, 
	ChartService, 
	IBarChartOptions, 
	ILayout, 
	ILineChartOptions, 
	IPieChartOptions, 
	NavService,
} from '../../../services';
import { 
	ILiquidityDialogComponent,
	ILiquidityIntensityLevelCounter,
} from './interfaces';

@Component({
  selector: 'app-liquidity-dialog',
  templateUrl: './liquidity-dialog.component.html',
  styleUrls: ['./liquidity-dialog.component.scss']
})
export class LiquidityDialogComponent implements OnInit, OnDestroy, ILiquidityDialogComponent {
	// Layout
	public layout: ILayout = this._app.layout.value;
    private layoutSub?: Subscription;

	// The current window in candlesticks format
	private window!: ICandlestick[];

	// Full State
	public state!: IFullLiquidityState;

	// Summary
	public bidLiqPower!: IBarChartOptions;
	public liqDistribution!: IPieChartOptions;
	public askConcentration!: IBarChartOptions;
	public bidConcentration!: IBarChartOptions;

	// Peaks
	public peaks!: ILineChartOptions;

	// Orders
	public asks!: IBarChartOptions;
	public bids!: IBarChartOptions;

	// Tabs
	public activeTab: number = 0;

	// Load State
	public loaded: boolean = false;

	constructor(
		public dialogRef: MatDialogRef<LiquidityDialogComponent>,
		public _nav: NavService,
		public _app: AppService,
		public _ms: MarketStateService,
		private _chart: ChartService,
		private _utils: UtilsService
	) { }

	async ngOnInit(): Promise<void> {
        // Initialize layout
        this.layoutSub = this._app.layout.subscribe((nl: ILayout) => this.layout = nl);

        // Load the data
		try {
			await this.loadLiquidityData();
		} catch (e) { this._app.error(e) }
		this.loaded = true;
	}


    ngOnDestroy(): void {
        if (this.layoutSub) this.layoutSub.unsubscribe();
    }





	/**
	 * Loads and initializes the liquidity data from the server.
	 * @returns Promise<void>
	 */
	public async loadLiquidityData(): Promise<void> {
		try {
			// Initialize the window
			this.window = this._app.marketState.value!.window.w;

			// Retrieve the state
			this.state = await this._ms.getFullLiquidityState();

			// Build the summary charts
			this.bidLiqPower = this.buildBidLiqPowerChart(this.state.blp);
			this.liqDistribution = this.buildSummaryChart(this.state.a.t, this.state.b.t);
			this.askConcentration = this.buildConcentrationChart("asks");
			this.bidConcentration = this.buildConcentrationChart("bids");

			// Build the peaks charts
			this.peaks = this.buildPeaks();

			// Build the dedicated by side liquidity charts
			this.asks = this.buildLiquidityChart("asks", this.state.a.l, this.state.r);
			this.bids = this.buildLiquidityChart("bids", this.state.b.l, this.state.r);
		} catch (e) {
			this._app.error(e);
		}
	}


















	/* Summary */



	/**
	 * Builds the pie chart in order to compare the asks and the bids.
	 * @param askLiquidity 
	 * @param bidLiquidity 
	 * @returns IPieChartOptions
	 */
	private buildSummaryChart(askLiquidity: number, bidLiquidity: number): IPieChartOptions {
		return this._chart.getPieChartOptions(
			{
				series: [ <number>this._utils.outputNumber(askLiquidity), <number>this._utils.outputNumber(bidLiquidity)],
				colors: [this._chart.downwardColor, this._chart.upwardColor],
				legend: {show: false}
			}, 
			["Asks BTC", "Bids BTC"], 
			this.layout == "desktop" ? 290: 270
		)
	}





	/**
	 * Builds the bid liquidity power chart.
	 * @param bidLiquidityPower
	 * @returns IPieChartOptions
	 */
	private buildBidLiqPowerChart(bidLiquidityPower: number): IBarChartOptions {
		let chart: IBarChartOptions = this._chart.getBarChartOptions(
			{
				series: [ 
					{ 
						name: "Bid Liq. Power", 
						data: [<number>this._utils.outputNumber(bidLiquidityPower)]
					},
					{ 
						name: "Ask Liq. Power", 
						data: [<number>this._utils.outputNumber(100 - bidLiquidityPower)]
					},
				],
				colors: [this._chart.upwardColor, this._chart.downwardColor],
				legend: {show: false},
				xaxis: {categories: ["Bid Liq. Power", "Ask Liq. Power"], labels: {show: false}, axisTicks: {show: false}, axisBorder: {show: false}},
				yaxis: {labels: {show: false}, axisBorder: {show: false}},
				
			}, 
			["Bid Liq. Power", "Ask Liq. Power"], 
			this.layout == "desktop" ? 105: 105,
			false
		);
		return chart;
	}





	/**
	 * Builds the concentration chart for a side.
	 * @param side 
	 * @returns IBarChartOptions
	 */
	private buildConcentrationChart(side: ILiquiditySide): IBarChartOptions {
		// Init the level colors
		const colors: string[] = side == "asks" ? 
			["#FFCDD2", "#E57373", "#F44336", "#D32F2F", "#B71C1C"]: 
			["#B2DFDB", "#4DB6AC", "#009688", "#00796B", "#004D40"];

		// Init the counter
		const counter: ILiquidityIntensityLevelCounter = this.calculatePeakCounter(side == "asks" ? this.state.ap: this.state.bp);

		// Finally, return the chart
		return this._chart.getBarChartOptions(
			{
				series: [
					{name: "Low", data: [counter[1]]},
					{name: "Medium", data: [counter[2]]},
					{name: "High", data: [counter[3]]},
					{name: "Very High", data: [counter[4]]},
				], 
				colors: colors,
				xaxis: {categories: ["Liq. Intensity"], labels: {show: true}},
				yaxis: {labels: {show: false}},
				legend: {show: false}
			}, 
			["Liq. Intensity"], 
			this.layout == "desktop" ? 190: 175
		)
	}


	/**
	 * Based on the state peaks, it will iterate over each and build the
	 * counter that will be charted.
	 * 
	 */
	private calculatePeakCounter(peaks: ILiquidityPeaks): ILiquidityIntensityLevelCounter {
		// Init the counter
		let counter: ILiquidityIntensityLevelCounter = this.buildDefaultCounter();

		// Iterate over each peak and update the counter
		let finalPeaks: ILiquidityPeaks = peaks || {};
		for (let price in finalPeaks) {
			counter[finalPeaks[price]] += 1;
		}

		// Finally, return the counter
		return counter;
	}


















	/* Peaks */





	/**
	 * Builds the peaks chart object.
	 * @returns ILineChartOptions
	 */
	private buildPeaks(): ILineChartOptions {
		// Init the chart
		let chart: ILineChartOptions = this._chart.getLineChartOptions(
			{ 
				series: [
					{
						name: "Market Price", 
						data: this.window.map((c) => { return { x: c.ot, y: c.c}}), 
						color: "#000000"
					}
				],
				stroke: { curve: "straight", width: 3 },
				xaxis: {type: "datetime",tooltip: {enabled: true}, labels: {datetimeUTC: false}},
				yaxis: { labels: { show: true},tooltip: {enabled: true}  }
			},
			this.layout == "desktop" ? 600: 400,
			true,
			{ 
				min: <number>this._utils.alterNumberByPercentage(this.window[this.window.length - 1].c, -0.6),
				max: <number>this._utils.alterNumberByPercentage(this.window[this.window.length - 1].c, 0.6),
			}
		);

		// Init the annotations
        const x: number = this.window[0].ot;
		let annotations: ApexAnnotations = { points: [], xaxis: [], yaxis: []};

        // Build the Asks (If any)
		const askPeaks: ILiquidityPeaks = this.state.ap || {};
		for (let askPrice in askPeaks) {
			if (askPeaks[askPrice] > 0) {
				annotations.points!.push(this.buildLiquidityAnnotation("asks", x, Number(askPrice), askPeaks[askPrice]));
			}
		}

        // Build the Bids (If any)
		const bidPeaks: ILiquidityPeaks = this.state.bp || {};
		for (let bidPrice in bidPeaks) {
			if (bidPeaks[bidPrice] > 0) {
				annotations.points!.push(this.buildLiquidityAnnotation("bids", x, Number(bidPrice), bidPeaks[bidPrice]));
			}
		}

		// Highlight the current price
		annotations.yaxis!.push({
            y: this.window[this.window.length - 1].c,
            strokeDashArray: 0,
            borderColor: "#000000",
            fillColor: "#000000",
            borderWidth: 0.5
        });

		// Insert the annotations into the chart
		chart.annotations = annotations;

		// Finally, return the chart
		return chart;
	}







    /**
     * Builds a liquidity level annotation for a given side.
     * @param side 
     * @param x 
     * @param level 
     * @returns PointAnnotations
     */
    private buildLiquidityAnnotation(
        side: ILiquiditySide,
        x: number,
		price: number,
        intensity: ILiquidityIntensity
    ): PointAnnotations {
        return {
            x: x,
            y: price,
            marker: {size: 0},
            label: {
                text: ".",
                borderWidth: 0,
                borderRadius: 0,
                offsetY: 1,
                style: {
                    background: this._ms.peakColors[side][intensity],
                    color: '#FFFFFF',
                    fontSize: "1px",
                    padding: {
                        left: 0,
                        right: this._ms.peakWidth[this.layout][intensity],
                        top: 1,
                        bottom: 1,
                      }
                }
            }
        }
    }















	/* Orders */


	/**
	 * Builds the bar chart to be used in order to display orders.
	 * @param side 
	 * @param levels 
	 * @param requirements 
	 * @returns IBarChartOptions
	 */
	private buildLiquidityChart(
		side: ILiquiditySide, 
		levels: ILiquidityPriceLevel[], 
		requirements: ILiquidityIntensityRequirements
	): IBarChartOptions {
		// Init the color
		const color: string = side == "asks" ? this._chart.downwardColor: this._chart.upwardColor;

		// Build the chart
		const liquidities: number[] = levels.map((pl) => pl.l);
		const min: number = <number>this._utils.getMin(liquidities);
		const max: number = <number>this._utils.getMax(liquidities);
		let chart: IBarChartOptions = this._chart.getBarChartOptions(
			{ 
				series: [ { 
					name: "BTC Liquidity", 
					data: levels.map(pl => { return { 
						x: pl.p,
						y: <number>this._utils.outputNumber(pl.l, {dp: 1})
					}}), 
					color: color
				}],
				yaxis: { labels: {show: true}, tooltip: { enabled: true}, axisBorder: { show: true}, axisTicks: {show: true}, crosshairs: {show: true}}
			},
			undefined,
			this.layout == "desktop" ? 600: 400,
			undefined,
			true,
			{min: min, max: max},
			{
				yaxis: [
					{
						y: requirements.low,
						borderColor: color,
						fillColor: color,
						strokeDashArray: 0,
						borderWidth: 1
					},
					{
						y: requirements.medium,
						borderColor: color,
						fillColor: color,
						strokeDashArray: 0,
						borderWidth: 1
					},
					{
						y: requirements.high,
						borderColor: color,
						fillColor: color,
						strokeDashArray: 0,
						borderWidth: 1
					},
					{
						y: requirements.veryHigh,
						borderColor: color,
						fillColor: color,
						strokeDashArray: 0,
						borderWidth: 1
					},
				],
				xaxis: [
					{
						x: this.state.ppr.current,
						x2: side == "asks" ? this.state.ppr.upper: this.state.ppr.lower,
						strokeDashArray: 0,
						borderColor: side == "asks" ? "#EF9A9A": "#80CBC4",
						fillColor: side == "asks" ? "#EF9A9A": "#80CBC4",
					}
				]
			}
		);
		chart.chart.zoom = {enabled: false};
		chart.xaxis.labels = {rotateAlways: true};
		if (side == "bids") chart.yaxis.opposite = true;
		return chart
	}








	/* Misc Helpers */





	/**
	 * Builds the default counter object for a side.
	 * @returns ILiquidityIntensityLevelCounter
	 */
	private buildDefaultCounter(): ILiquidityIntensityLevelCounter {
		return {
			0: 0,
			1: 0,
			2: 0,
			3: 0,
			4: 0,
		}
	}










	/**
	 * Displays the Info Tooltip.
	 */
	public displayInfoTooltip(): void {
        this._nav.displayTooltip("Liquidity", [
			`BUILD`,
			`${moment(this.state.ts).format("dddd, MMMM Do, h:mm:ss a")}`,
			`-----`,
			`STATE PRICE RANGE`,
			`Upperband: $${this._utils.formatNumber(this.state.ppr.upper)}`,
			`Current: $${this._utils.formatNumber(this.state.ppr.current)}`,
			`Lowerband: $${this._utils.formatNumber(this.state.ppr.lower)}`,
			`-----`,
			`LIQ. REQUIREMENTS`,
			`Low: ${this._utils.formatNumber(this.state.r.low)} BTC`,
			`Medium: ${this._utils.formatNumber(this.state.r.medium)} BTC`,
			`High: ${this._utils.formatNumber(this.state.r.high)} BTC`,
			`Very High: ${this._utils.formatNumber(this.state.r.veryHigh)} BTC`,
        ]);
	}





	/**
	 * Displays the Liquidity Module Tooltip.
	 */
	public displayTooltip(): void {
        this._nav.displayTooltip("Liquidity", [
			`This module aims to have a deep understanding of the Order Book State for the Bitcoin Spot Market.`,
			`The server establishes a WebSocket Connection to the "Order Book" and processes the raw data on a real time basis. During this process, the system identifies "Liquidity Peaks" and groups them based on their intensity. `,
			`Having identified all the peaks within the price range, the "Bid Liquidity Power" is calculated, whose only purpose is to indicate when there is an abnormal amount of buy or sell liquidity in the Order Book.`,
			`The out-of-the-box configuration has been tested for a significant period of time. However, all the parameters can be tuned in the "Adjustments" section.`,
        ]);
	}



	// Close Dialog
	public close(): void { this.dialogRef.close() }
}
