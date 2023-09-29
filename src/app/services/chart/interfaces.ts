import { ICandlestick, IPositionCandlestick } from "../../core";
import {
	ApexAxisChartSeries,
	ApexChart,
	ApexYAxis,
	ApexXAxis,
	ApexTitleSubtitle,
    ApexAnnotations,
	ApexDataLabels,
	ApexGrid,
	ApexPlotOptions,
	ApexStroke,
	ApexFill,
	ApexResponsive,
	ApexNonAxisChartSeries,
	ApexLegend,
	ApexOptions
} from "ng-apexcharts";



export interface IChartService {
    // Candlesticks
    getCandlestickChartOptions(
		candlesticks: Array<ICandlestick|IPositionCandlestick|any>, 
		annotations?: ApexAnnotations, 
		highlightCurrentPrice?: boolean,
		disableNiceScale?: boolean,
		range?: IChartRange,
		height?: number
	): ICandlestickChartOptions,
	getApexCandlesticks(candlesticks: Array<ICandlestick>): IApexCandlestick[],

	// Bar Charts
	getBarChartOptions(
		config: Partial<IBarChartOptions>, 
		categories?: string[], 
		height?: number,
		plotOptionsDistributed?: boolean,
	): IBarChartOptions,

	// Line Chart
	getLineChartOptions(
		config: Partial<ILineChartOptions>, 
		height?: number, 
		disableNiceScale?: boolean, 
		range?: IChartRange
   ): ILineChartOptions,
	getLineChartRange(series: ApexAxisChartSeries): IChartRange,

	// Scatter Chart
	getScatterChartOptions(
		config: Partial<IScatterChartOptions>, 
		height?: number, 
		disableNiceScale?: boolean, 
		range?: IChartRange,
		colors?: string[]
   ): IScatterChartOptions,

	// Pie Chart
	getPieChartOptions(
		config: Partial<IPieChartOptions>, 
		labels: string[], 
		height?: number
	): IPieChartOptions,

	// Misc Helpers
	calculateChartHeight(
		baseHeight: number,
		increment: number,
		categoriesNum: number,
		itemsPerCategory?: number,
		maxHeight?: number
	): number,
	getRandomColor(): string
}








/* Candlesticks */


// Candlestick Chart Options
export type ICandlestickChartOptions = {
	series: ApexAxisChartSeries;
	chart: ApexChart;
	plotOptions: ApexPlotOptions;
	xaxis: ApexXAxis;
	yaxis: ApexYAxis;
	title: ApexTitleSubtitle;
	annotations: ApexAnnotations;
};




// Chart Candlestick
export interface IApexCandlestick {
    x: number,
    y: [number, number, number, number]
}



export interface IChartRange {
    min: number,
    max: number
}






/* Bar Chart Options */
export type IBarChartOptions = {
	series: ApexAxisChartSeries;
	chart: ApexChart;
	colors: string[];
	plotOptions: ApexPlotOptions;
	dataLabels: ApexDataLabels;
	grid: ApexGrid;
	fill: ApexFill;
	xaxis: ApexXAxis;
	yaxis: ApexYAxis;
	annotations: ApexAnnotations;
	legend: ApexLegend;
	title: ApexTitleSubtitle;
};





/* Line Chart Options */
export type ILineChartOptions = {
	series: ApexAxisChartSeries;
	chart: ApexChart;
	dataLabels: ApexDataLabels;
	stroke: ApexStroke;
	grid: ApexGrid;
	xaxis: ApexXAxis;
	yaxis: ApexYAxis;
	annotations: ApexAnnotations;
	options?: ApexOptions;
	colors: string[];
	title: ApexTitleSubtitle;
};


/* Scatter Chart Options */
export type IScatterChartOptions = {
	series: ApexAxisChartSeries;
	chart: ApexChart;
	xaxis: ApexXAxis;
	yaxis: ApexYAxis;
	dataLabels: ApexDataLabels;
	colors: string[];
};




/* Pie Chart Options */
export type IPieChartOptions = {
	series: ApexNonAxisChartSeries;
	chart: ApexChart;
	labels: string[];
	colors: string[];
	responsive: ApexResponsive[];
	legend: ApexLegend;
}