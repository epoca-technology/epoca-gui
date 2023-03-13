import { Component, OnInit } from '@angular/core';
import {MatDialogRef} from "@angular/material/dialog";
import { ILiquidityIntensityRequirements, ILiquidityPriceLevel, ILiquiditySide, ILiquidityState, MarketStateService, UtilsService } from '../../../core';
import { AppService, ChartService, IBarChartOptions, ILayout, IPieChartOptions, NavService } from '../../../services';
import { ILiquidityDialogComponent } from './interfaces';

@Component({
  selector: 'app-liquidity-dialog',
  templateUrl: './liquidity-dialog.component.html',
  styleUrls: ['./liquidity-dialog.component.scss']
})
export class LiquidityDialogComponent implements OnInit, ILiquidityDialogComponent {
	// Layout
	public layout: ILayout = this._app.layout.value;

	// Full State
	public state!: ILiquidityState;

	// Summary
	public dominance!: IPieChartOptions;
	public askConcentration!: IBarChartOptions;
	public bidConcentration!: IBarChartOptions;

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
			this.state = await this._ms.getLiquidityState();
			this.dominance = this.buildSummaryChart(this.state.al, this.state.bl);
			this.askConcentration = this.buildConcentrationChart("asks", this.state.a);
			this.bidConcentration = this.buildConcentrationChart("bids", this.state.b);
			this.asks = this.buildLiquidityChart("asks", this.state.a, this.state.air);
			this.bids = this.buildLiquidityChart("bids", this.state.b, this.state.bir);
		} catch (e) { this._app.error(e) }
		this.loaded = true;
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
	 * @param levels 
	 * @returns IBarChartOptions
	 */
	private buildConcentrationChart(side: ILiquiditySide, levels: ILiquidityPriceLevel[]): IBarChartOptions {
		// Build the intensity counters
		let intensityCounter = { high: 0, medium: 0, low: 0};
		for (let level of levels) {
			if 		(level.li == 3) { intensityCounter.high += 1 }
			else if (level.li == 2) { intensityCounter.medium += 1 }
			else if (level.li == 1) { intensityCounter.low += 1 }
		}
		
		// Init the level colors
		const colors: string[] = side == "asks" ? 
			["#EF9A9A", "#F44336", "#B71C1C"]: ["#80CBC4", "#009688", "#004D40"]

		// Finally, return the chart
		return this._chart.getBarChartOptions(
			{
				series: [
					{name: "Low", data: [intensityCounter.low]},
					{name: "Medium", data: [intensityCounter.medium]},
					{name: "High", data: [intensityCounter.high]},
				], 
				colors: colors,
				xaxis: {categories: ["Liq. Intensity"], labels: {show: true}},
				yaxis: {labels: {show: false}},
				legend: {show: false}
			}, 
			["Liq. Intensity"], 
			130
		)
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
						y: requirements.l,
						borderColor: color,
						fillColor: color,
						strokeDashArray: 2,
						borderWidth: 1
					},
					{
						y: requirements.m,
						borderColor: color,
						fillColor: color,
						strokeDashArray: 5,
						borderWidth: 1
					},
					{
						y: requirements.h,
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
