import { Component, OnInit } from '@angular/core';
import {MatDialogRef} from "@angular/material/dialog";
import * as moment from "moment";
import { ApexAnnotations, PointAnnotations } from 'ng-apexcharts';
import { 
	ICandlestick,
	ILiquidityPriceLevel, 
	ILiquiditySide, 
	ILiquidityState, 
	MarketStateService, 
	UtilsService 
} from '../../../../core';
import { 
	AppService, 
	ChartService, 
	IBarChartOptions, 
	ILayout, 
	ILineChartOptions, 
	IPieChartOptions, 
	NavService,
} from '../../../../services';
import { 
	ILiquidityDialogComponent,
	ILiquidityIntensity,
	ILiquidityIntensityLevelCounter,
	ILiquidityIntensityRequirements,
	ILiquidityExtendedIPriceLevel
} from './interfaces';

@Component({
  selector: 'app-liquidity-dialog',
  templateUrl: './liquidity-dialog.component.html',
  styleUrls: ['./liquidity-dialog.component.scss']
})
export class LiquidityDialogComponent implements OnInit, ILiquidityDialogComponent {
	// Layout
	public layout: ILayout = this._app.layout.value;

	// The current window in candlesticks format
	private window!: ICandlestick[];

	// Full State
	public state!: ILiquidityState;

	// Requirements
	private askRequirements: ILiquidityIntensityRequirements = this.buildDefaultRequirements();
	private bidRequirements: ILiquidityIntensityRequirements = this.buildDefaultRequirements();

	// Counters
	private askCounter: ILiquidityIntensityLevelCounter = this.buildDefaultCounter();
	private bidCounter: ILiquidityIntensityLevelCounter = this.buildDefaultCounter();

	// Extended Price Levels
	private extAsks: ILiquidityExtendedIPriceLevel[] = []
	private extBids: ILiquidityExtendedIPriceLevel[] = []

	// Summary
	public dominance!: IPieChartOptions;
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
		try {
			// Initialize the window
			this.window = this._app.marketState.value!.window.w;

			// Retrieve the state based on the current price
			this.state = await this._ms.getLiquidityState(this.window[this.window.length - 1].c);

			// Process the state
			this.processState();

			// Build the summary charts
			this.dominance = this.buildSummaryChart(this.state.a.t, this.state.b.t);
			this.askConcentration = this.buildConcentrationChart("asks", this.askCounter);
			this.bidConcentration = this.buildConcentrationChart("bids", this.bidCounter);

			// Build the peaks charts
			this.peaks = this.buildPeaks();

			// Build the dedicated by side liquidity charts
			this.asks = this.buildLiquidityChart("asks", this.state.a.l, this.askRequirements);
			this.bids = this.buildLiquidityChart("bids", this.state.b.l, this.bidRequirements);
		} catch (e) { this._app.error(e) }
		this.loaded = true;
	}







	/* State Processing */




	/**
	 * Based on the retrieved state, it will perform a deep analysis on the
	 * liquidity and build all the neccessary data.
	 */
	private processState(): void {
		// Calculate the requirements
		this.askRequirements = this.calculateRequirements(this.state.a.l);
		this.bidRequirements = this.calculateRequirements(this.state.b.l);

		// Process the asks
		for (let ask of this.state.a.l) {
			// Calculate the intensity
			const intensity: ILiquidityIntensity = this.calculateIntesity(ask.l, this.askRequirements);

			// Update the counter
			this.askCounter[intensity] += 1;

			// Add the level
			this.extAsks.push({li: intensity, ...ask});
		}


		// Process the bids
		for (let bid of this.state.b.l) {
			// Calculate the intensity
			const intensity: ILiquidityIntensity = this.calculateIntesity(bid.l, this.bidRequirements);

			// Update the counter
			this.bidCounter[intensity] += 1;

			// Add the level
			this.extBids.push({li: intensity, ...bid});
		}
	}







	/**
	 * Calculates a level's intensity based on its liquidity and the
	 * requirements.
	 * @param liq 
	 * @param requirements 
	 * @returns ILiquidityIntensity
	 */
	private calculateIntesity(liq: number, requirements: ILiquidityIntensityRequirements): ILiquidityIntensity {
		if 		(liq >= requirements.meanHigh) 		{ return 4 }
		else if (liq >= requirements.meanMedium)  	{ return 3 }
		else if (liq >= requirements.meanLow)  		{ return 2 }
		else if (liq >= requirements.mean)  		{ return 1 }
		else 									  	{ return 0 }
	}




	/**
	 * Calculates the intensity requirements for a side.
	 * @param levels 
	 * @returns ILiquidityIntensityRequirements
	 */
	private calculateRequirements(levels: ILiquidityPriceLevel[]): ILiquidityIntensityRequirements {
		// Init values
		let accum: number = 0;
		let lowest: number = 0;
		let highest: number = 0;

		// Iterate over each level, populating the values
		for (let level of levels) {
			accum += level.l;
			lowest = lowest == 0 || level.l < lowest ? level.l: lowest;
			highest = level.l > highest ? level.l: highest;
		}

		// Calculate the requirements
		let mean: number = <number>this._utils.outputNumber(accum / levels.length);
		const meanHigh: number = <number>this._utils.getMean([mean, highest]);
		const meanMedium: number = <number>this._utils.getMean([mean, meanHigh]);
		const meanLow: number = <number>this._utils.getMean([mean, meanMedium]);
		mean = <number>this._utils.getMean([mean, meanLow]);

		// Finally, return the requirements
		return {
			mean: mean,
			meanLow: meanLow,
			meanMedium: meanMedium,
			meanHigh: meanHigh,
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
			this.layout == "desktop" ? 285: 270
		)
	}





	/**
	 * Builds the concentration chart for a side.
	 * @param side 
	 * @param counter 
	 * @returns IBarChartOptions
	 */
	private buildConcentrationChart(side: ILiquiditySide, counter: ILiquidityIntensityLevelCounter): IBarChartOptions {
		// Init the level colors
		const colors: string[] = side == "asks" ? 
			["#FFCDD2", "#E57373", "#F44336", "#D32F2F", "#B71C1C"]: 
			["#B2DFDB", "#4DB6AC", "#009688", "#00796B", "#004D40"]

		// Finally, return the chart
		return this._chart.getBarChartOptions(
			{
				series: [
					{name: "Average", data: [counter[1]]},
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
			163
		)
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
				xaxis: {type: "datetime",tooltip: {enabled: true}, labels: {datetimeUTC: false}}
			},
			this.layout == "desktop" ? 400: 400,
			undefined,
			undefined
		);

		// Init the annotations
        const x: number = this.window[0].ot;
		let annotations: ApexAnnotations = { points: []};

        // Build the Asks (If any)
        if (this.extAsks) {
            for (let ask of this.extAsks) {
                if (ask.li > 0) annotations.points!.push(this.buildLiquidityAnnotation("asks", x, ask));
            }
        }

        // Build the Bids (If any)
        if (this.extBids) {
            for (let bid of this.extBids) {
                if (bid.li > 0) annotations.points!.push(this.buildLiquidityAnnotation("bids", x, bid));
            }
        }

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
        level: ILiquidityExtendedIPriceLevel
    ): PointAnnotations {
        // Calculate the metadata
        const { color, width } = this.getLiquidityLevelMetadata(side, level.li);

        // Finally, return the annotation
        return {
            x: x,
            y: level.p,
            marker: {size: 0},
            label: {
                text: ".",
                borderWidth: 0,
                borderRadius: 0,
                offsetY: 1,
                style: {
                    background: color,
                    color: '#FFFFFF',
                    fontSize: "1px",
                    padding: {
                        left: 0,
                        right: width,
                        top: 1,
                        bottom: 1,
                      }
                }
            }
        }
    }



    /**
     * Retrieves the color and the width of a liquidity bar based on the side and
     * the intensity.
     * @param side 
     * @param intensity 
     * @returns {color: string, width: number}
     */
    private getLiquidityLevelMetadata(side: ILiquiditySide, intensity: ILiquidityIntensity): {color: string, width: number} {
        // Init values
        let color: string;
        let width: number;

        // Set the values based on the intensity
        if (intensity == 4) {
            color = side == "asks" ? "#B71C1C": "#004D40";
            width = this.layout == "desktop" ? 350: 130;
        } else if (intensity == 3) {
            color = side == "asks" ? "#E53935": "#00897B";
            width = this.layout == "desktop" ? 250: 100;
        } else if (intensity == 2) {
            color = side == "asks" ? "#EF5350": "#26A69A";
            width = this.layout == "desktop" ? 150: 60;
        } else {
            color = side == "asks" ? "#FFCDD2": "#B2DFDB";
            width = this.layout == "desktop" ? 75: 30;
        }
        
        // Finally, pack and return the values
        return { color: color, width: width };
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
				yaxis: { tooltip: { enabled: true}, axisBorder: { show: true}, axisTicks: {show: true}}
			},
			undefined,
			this.layout == "desktop" ? 400: 400,
			undefined,
			true,
			{min: min, max: max},
			{
				yaxis: [
					{
						y: requirements.mean,
						borderColor: color,
						fillColor: color,
						strokeDashArray: 2,
						borderWidth: 1
					},
					{
						y: requirements.meanLow,
						borderColor: color,
						fillColor: color,
						strokeDashArray: 4,
						borderWidth: 1
					},
					{
						y: requirements.meanMedium,
						borderColor: color,
						fillColor: color,
						strokeDashArray: 6,
						borderWidth: 1
					},
					{
						y: requirements.meanHigh,
						borderColor: color,
						fillColor: color,
						strokeDashArray: 0,
						borderWidth: 1
					},
				]
			}
		);
		chart.chart.zoom = {enabled: false};
		chart.xaxis.labels = {rotateAlways: true}
		return chart
	}









	/* Misc Helpers */





	/**
	 * Builds the default requirements object for a side.
	 * @returns ILiquidityIntensityRequirements
	 */
	private buildDefaultRequirements(): ILiquidityIntensityRequirements {
		return {
			meanLow: 0,
			mean: 0,
			meanMedium: 0,
			meanHigh: 0
		}
	}






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
			`ASK REQUIREMENTS`,
			`Mean: ${this._utils.formatNumber(this.askRequirements.mean)} BTC`,
			`Mean Low: ${this._utils.formatNumber(this.askRequirements.meanLow)} BTC`,
			`Mean Medium: ${this._utils.formatNumber(this.askRequirements.meanMedium)} BTC`,
			`Mean High: ${this._utils.formatNumber(this.askRequirements.meanHigh)} BTC`,
			`-----`,
			`BID REQUIREMENTS`,
			`Mean: ${this._utils.formatNumber(this.bidRequirements.mean)} BTC`,
			`Mean Low: ${this._utils.formatNumber(this.bidRequirements.meanLow)} BTC`,
			`Mean Medium: ${this._utils.formatNumber(this.bidRequirements.meanMedium)} BTC`,
			`Mean High: ${this._utils.formatNumber(this.bidRequirements.meanHigh)} BTC`,
        ]);
	}





	/**
	 * Displays the Signal Module Tooltip.
	 */
	public displayTooltip(): void {
        this._nav.displayTooltip("Liquidity", [
			`@TODO`,
        ]);
	}



	// Close Dialog
	public close(): void { this.dialogRef.close() }
}
