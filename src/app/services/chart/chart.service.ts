import { Injectable } from '@angular/core';
import * as moment from 'moment';
import { ApexAnnotations, ApexChart, ApexPlotOptions, ApexYAxis, ApexAxisChartSeries, ApexXAxis } from 'ng-apexcharts';
import { ICandlestick, UtilsService } from '../../core';
import { AppService, ILayout } from '../app';
import { 
	IApexCandlestick, 
	IChartService, 
	ICandlestickChartOptions, 
	IChartRange, 
	IBarChartOptions, 
	ILineChartOptions, 
	IPieChartOptions
} from './interfaces';




@Injectable({
  providedIn: 'root'
})
export class ChartService implements IChartService {
	// Colors
	public readonly colors: string[] = this.getColors();

	// Event Colors
	public readonly upwardColor: string = '#00695C';
	public readonly downwardColor: string = '#B71C1C';


  	constructor(
		private _app: AppService,
		private _utils: UtilsService,
	  ) { }













    /* Candlesticks */








    /**
     * Given a list of candlesticks and annotation data, will retrieve the chart object
     * to be rendered.
     * @param candlesticks 
     * @param annotations?
     * @param highlightCurrentPrice?
     * @returns ICandlestickChartOptions
     */
	public getCandlestickChartOptions(
		 candlesticks: ICandlestick[], 
		 annotations?: ApexAnnotations, 
		 highlightCurrentPrice?: boolean
	): ICandlestickChartOptions {
        // Make sure at least 5 candlesticks have been provided
        if (!candlesticks || candlesticks.length < 5) {
            throw new Error('A minimum of 5 candlesticks must be provided in order to render the chart.');
        }

		// Retrieve the range
		const range: IChartRange = this.getCandlesticksChartRange(candlesticks);

		let self = this;

        // Return the chart
        return {
            series: [{name: "candle", data: this.getApexCandlesticks(candlesticks)}],
            chart: {
				type: "candlestick",
				toolbar: {show: true,tools: {selection: true,zoom: true,zoomin: true,zoomout: true,download: false}},
				animations: {enabled: false},
            },
			plotOptions: {candlestick: {colors: {upward: this.upwardColor,downward: this.downwardColor}}},
            annotations: this.getCandlesticksAnnotations(
				annotations, 
				highlightCurrentPrice === false ? undefined: candlesticks[candlesticks.length -1].c
			),
            title: {text: this.getCandlesticksTitle(candlesticks),align: "left"},
            xaxis: {type: "datetime",tooltip: {enabled: true}, labels: {datetimeUTC: false}}, 
            yaxis: { tooltip: { enabled: true }, forceNiceScale: false, min: range.min, max: range.max}
        }
    }









	/**
	 * Given a list of raw candlesticks, it will convert them into Apex format.
	 * @returns IApexCandlestick[]
	 */
     private getApexCandlesticks(candlesticks: ICandlestick[]): IApexCandlestick[] {
		// Init the final list
		let final: IApexCandlestick[] = [];

		// Build the candlesticks
		candlesticks.forEach((c) => { final.push({x: c.ot, y: [c.o, c.h, c.l, c.c]}) });

		// Return the final list
		return final;
	}







	/**
	 * Retrieves the title to be placed in the chart.
	 * @returns string
	 */
     private getCandlesticksTitle(candlesticks: ICandlestick[]): string {
		// Init values
        const l: ILayout = this._app.layout.value;
		let title: string = '';

		if (candlesticks.length) {
			title += `${moment(candlesticks[0].ot).format(l == 'mobile' ? 'DD/MM/YY': 'DD MMMM YYYY HH:mm')}`;
			title += ` - ${moment(candlesticks[candlesticks.length - 1].ot).format(l == 'mobile' ? 'DD/MM/YY': 'DD MMMM YYYY HH:mm')}`;
		}

		// Return the final title
		return title;
	}








	/**
	 * Given a list of candlesticks, it will retrieve the highest and the lowest
	 * values.
	 * @param candlesticks 
	 * @returns IChartRange
	 */
	private getCandlesticksChartRange(candlesticks: ICandlestick[]): IChartRange {
		// Init lists
		let high: number[] = [];
		let low: number[] = [];

		// Iterate over each candlestick populating the lists
		candlesticks.forEach((c) => {
			high.push(c.h);
			low.push(c.l);
		});

		// Return the range
		return {
			max: this._utils.getMax(high),
			min: this._utils.getMin(low)
		}
	}









    /**
     * Retrieves the annotations for the current chart.
	 * @param data?
	 * @param currentPrice?
     * @returns any
     */
     private getCandlesticksAnnotations(data?: ApexAnnotations, currentPrice?: number): ApexAnnotations {
		 // Init the annotations
		 let annotations: ApexAnnotations = {
			xaxis: data?.xaxis || [],
			yaxis: data?.yaxis || []
		 }

		 // Check if the current price was provided
		 if (currentPrice) {
			annotations.yaxis?.push({
				y: currentPrice,
				strokeDashArray: 0,
				borderColor: '',
				fillColor: '',
				label: {
					borderColor: '#000000',
					style: { color: '#fff', background: '#000000'},
					text: `$${this._utils.formatNumber(currentPrice, 2)}`,
					position: 'left',
					offsetX: 50
				}
			});
		 }

		 // Return the final annotations
		 return annotations;
    }












	


	/* Bar Chart */






	/**
	 * Builds the configuration for a bar chart.
	 * @param config 
	 * @param categories? 
	 * @param height?
	 * @param plotOptionsDistributed?
	 * @returns IBarChartOptions
	 */
	public getBarChartOptions(
		config: Partial<IBarChartOptions>, 
		categories?: string[], 
		height?: number,
		plotOptionsDistributed?: boolean,
	): IBarChartOptions {
		// Init the default chart
		let defaultChart: ApexChart = {height: 600, type: 'bar',animations: { enabled: false}, toolbar: {show: false}};
		if (typeof height == "number") defaultChart.height = height;

		// Init the default plot options
		let defaultPlotOptions: ApexPlotOptions = {bar: {borderRadius: 4, horizontal: true, distributed: false,}};
		if (plotOptionsDistributed) defaultPlotOptions.bar!.distributed = true;

		// Init the colors
		let colors: string[] = config.colors || [];
		if (!colors.length && categories && categories.length) {
			colors = this.colors.slice(0, categories.length)
		}

		// Init the xaxis if none provided and the categories have been
		let xaxis: ApexXAxis = config.xaxis || {};
		if (!config.xaxis && categories) {
			xaxis = {categories: categories}
		}

		// Return the Options Object
		return {
			series: config.series!,
			chart: config.chart ? config.chart: defaultChart,
			colors: colors,
			plotOptions: config.plotOptions ? config.plotOptions: defaultPlotOptions,
			dataLabels: config.dataLabels ? config.dataLabels: {enabled: false},
			grid: config.grid ? config.grid: {show: false},
			xaxis: xaxis,
			yaxis: config.yaxis ? config.yaxis: {}
		}
	}











	/* Line Chart */






	/**
	 * Builds the configuration for a line chart.
	 * @param config 
	 * @param height?
	 * @param disableNiceScale?
	 * @param range?
	 * @param colors?
	 * @returns ILineChartOptions
	 */
	 public getLineChartOptions(
		 config: Partial<ILineChartOptions>, 
		 height?: number, 
		 disableNiceScale?: boolean, 
		 range?: IChartRange,
		 colors?: string[]
	): ILineChartOptions {
		// Init the default chart
		let defaultChart: ApexChart = {height: 600, type: 'line',animations: { enabled: false}, toolbar: {show: false}, zoom: {enabled: false}};
		if (typeof height == "number") defaultChart.height = height;

		// Init the yaxis
		let yaxis: ApexYAxis|undefined = config.yaxis;

		// Check if the nice scale should be disabled
		if (disableNiceScale) {
			// Check if the range was provided, otherwise, calculate it
			if (!range) range = this.getLineChartRange(config.series!);

			// Check if a yaxis was needs to be initialized or updated
			if (yaxis) { yaxis = {...yaxis, forceNiceScale: false, min: range.min, max: range.max}} 
			else { yaxis = {forceNiceScale: false, min: range.min, max: range.max} }
		}


		// Return the Options Object
		return {
			series: config.series!,
			chart: config.chart ? config.chart: defaultChart,
			dataLabels: config.dataLabels ? config.dataLabels: {enabled: false},
			stroke: config.stroke ? config.stroke: {curve: "straight"},
			grid: config.grid ? config.grid: {row: { opacity: 0.5 }},
			xaxis: config.xaxis ? config.xaxis: {labels: { show: false } },
			yaxis: yaxis || {},
			annotations: config.annotations ? config.annotations: {},
			colors: colors ? colors: []
		}
	}







	/**
	 * Given a line chart series, it will check all the values and retrieve the min and the 
	 * max.
	 * @param series 
	 * @returns IChartRange
	 */
	public getLineChartRange(series: ApexAxisChartSeries): IChartRange {
			// Build a list with the numeric data
			const seriesNumbers: number[] = <number[]>series.map((seriesItem) => { return seriesItem.data }).flat();

			// Return the min and the max value
			return {
				min: this._utils.getMin(seriesNumbers),
				max: this._utils.getMax(seriesNumbers)
			}
	}








	/* Pie Chart */






	/**
	 * Builds the configuration for a pie chart.
	 * @param config 
	 * @param labels
	 * @param height?
	 * @returns IBarChartOptions
	 */
	 public getPieChartOptions(
		config: Partial<IPieChartOptions>, 
		labels: string[], 
		height?: number
	): IPieChartOptions {
		// Init the default chart
		let defaultChart: ApexChart = {height: 400, type: 'pie',animations: { enabled: false}, toolbar: {show: false}};
		if (typeof height == "number") defaultChart.height = height;

		// Init the colors
		let colors: string[] = config.colors || [];
		if (!colors.length && labels && labels.length) {
			colors = this.colors.slice(0, labels.length)
		}

		// Return the Options Object
		return {
			series: config.series!,
			chart: config.chart ? config.chart: defaultChart,
			colors: colors,
			labels: labels
		}
	}












    /* Misc Helpers */









	/**
	 * Returns a large list of colors ordered randomly.
	 * @returns string[]
	 */
	private getColors(): string[] {
		return [
			"#227bb3","#b3228f","#b3228f","#b34b22","#6a22b3","#db56c5","#db566e","#5d784e","#784e4e","#4db2d1",
			"#363a78","#db4dd9","#4d462c","#5a9e68","#58aab0","#bb04c4","#2003ff","#e68302","#4aedb1","#7fa308",
			"#EF5350","#7E57C2","#29B6F6","#66BB6A","#EC407A","#FF7043","#78909C","#5C6BC0","#26C6DA","#0c5c02",
			"#9CCC65","#8D6E63","#AB47BC","#42A5F5","#26A69A","#D4E157","#FFA726","#F44336","#673AB7","#ff96ee",
			"#03A9F4","#4CAF50","#FF5722","#607D8B","#E91E63","#3F51B5","#00BCD4","#8BC34A","#795548","#4491BA",
			"#9C27B0","#2196F3","#009688","#CDDC39","#FF9800","#E53935","#5E35B1","#039BE5","#43A047","#1d3d6e",
			"#F4511E","#546E7A","#D81B60","#3949AB","#00ACC1","#7CB342","#6D4C41","#8E24AA","#1E88E5","#44def2",
			"#00897B","#C0CA33","#FB8C00","#D32F2F","#512DA8","#0288D1","#388E3C","#E64A19","#455A64","#ce5cf7",
			"#C2185B","#303F9F","#0097A7","#689F38","#5D4037","#7B1FA2","#1976D2","#00796B","#F57C00","#a3a2a6",
			"#708c7e","#3ee692","#80222a","#524a4b","#f54838","#4e396e","#02304d","#61e000","#61e000","#0a164d",
			"#542227","#223854","#544122","#225450","#432254","#57ed40","#ed7440","#08a3a1","#15ab6c","#ad7911",
			"#2e0707","#2e2607","#1c2e07","#072e20","#071b2e","#0c072e","#1e072e","#2e0720","#2e0713","#ff000d",
			"#D69F69","#CDDC7A","#000000","#8DA5B9","#9690A8","#907B80","#004C9A","#057501","#3DCBD0","#63904C",
			"#2baa8f","#fcff6a","#a58744","#040737","#ae94b0","#5e4301","#b571f6","#f95503","#267782","#ad07ea",
			"#f234b2","#b4be64","#aeee42","#a7c3ca","#a7c3ca","#3093a2","#204b88","#8d6ed0","#80f296","#06e909",
			"#464b95","#c34641","#dec39e","#d5867c","#003960","#b245ce","#d70d62","#8b8a71","#41b6d7","#1b59e9",
			"#6d0f63","#d3011c","#f96818","#2b3b64","#1407b1","#984078","#0e8593","#724f19","#c9ab85","#cea12f",
			"#d6e64e","#60e6cb","#daa1ac","#3f293e","#472b72","#90ed68","#1dcd6d","#a950af","#68f0df","#f989f7",
		].map(value => ({ value, sort: Math.random() }))
		.sort((a, b) => a.sort - b.sort)
		.map(({ value }) => value)
	}
}
