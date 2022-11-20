import { IBacktestPosition, ICandlestick, IPredictionCandlestick } from "../../core";
import {
	ApexAxisChartSeries,
	ApexChart,
	ApexYAxis,
	ApexXAxis,
	ApexTitleSubtitle,
    ApexAnnotations,
    YAxisAnnotations,
    XAxisAnnotations,
	ApexDataLabels,
	ApexGrid,
	ApexPlotOptions,
	ApexStroke,
	ApexFill,
	ApexMarkers,
	ApexResponsive,
	ApexNonAxisChartSeries,
	ApexLegend
} from "ng-apexcharts";



export interface IChartService {
	// General Properties
	colors: string[],
	upwardColor: string,
	downwardColor: string,
	neutralColor: string,
	
    // Candlesticks
    getCandlestickChartOptions(
		candlesticks: Array<ICandlestick|IPredictionCandlestick>, 
		annotations?: ApexAnnotations, 
		highlightCurrentPrice?: boolean,
		disableNiceScale?: boolean,
		range?: IChartRange
	): ICandlestickChartOptions,
	getApexCandlesticks(candlesticks: Array<ICandlestick|IPredictionCandlestick>): IApexCandlestick[],

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
	getModelBalanceHistoryData(positions: IBacktestPosition[]): {colors: string[], values: {x: number, y: number}[]},
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
	colors: string[];
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