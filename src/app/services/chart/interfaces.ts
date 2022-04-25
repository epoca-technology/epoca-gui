import { ICandlestick } from "../../core";
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
	ApexStroke
} from "ng-apexcharts";
import { MatDialogRef } from "@angular/material/dialog";



export interface IChartService {
	// General Properties
	colors: string[],
	upwardColor: string,
	downwardColor: string,
	
    // Candlesticks
    getCandlestickChartOptions(candlesticks: ICandlestick[], annotations?: ApexAnnotations, highlightCurrentPrice?: boolean): ICandlestickChartOptions,

	// Bar Charts
	getBarChartOptions(
		config: Partial<IBarChartOptions>, 
		categories: string[], 
		height?: number,
		plotOptionsDistributed?: boolean,
	): IBarChartOptions,

	// Line Chart
	getLineChartOptions(config: Partial<ILineChartOptions>, height?: number, disableNiceScale?: boolean): ILineChartOptions,
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
};