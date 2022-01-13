import { ICandlestick } from "../../core";
import {
	ApexAxisChartSeries,
	ApexChart,
	ApexYAxis,
	ApexXAxis,
	ApexTitleSubtitle,
    ApexAnnotations,
    YAxisAnnotations,
    XAxisAnnotations
} from "ng-apexcharts";



export interface IChartService {
    // Candlesticks
    build(candlesticks: ICandlestick[], annotations?: ApexAnnotations, highlightCurrentPrice?: boolean): ICandlestickChartOptions,
}










// Chart Options
export type ICandlestickChartOptions = {
	series: ApexAxisChartSeries;
	chart: ApexChart;
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