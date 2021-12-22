import { ICryptoCurrencySymbol } from "../../../core";
import {
	ApexAxisChartSeries,
	ApexChart,
	ApexYAxis,
	ApexXAxis,
	ApexTitleSubtitle,
    ApexAnnotations
} from "ng-apexcharts";


// Service
export interface IForecastComponent {
    performForecast(): Promise<void>
}




export type IChartOptions = {
	series: ApexAxisChartSeries;
	chart: ApexChart;
	xaxis: ApexXAxis;
	yaxis: ApexYAxis;
	title: ApexTitleSubtitle;
	annotations: ApexAnnotations;
};



export interface IApexCandlestick {
    x: number,
    y: [number, number, number, number]
}



export interface IForecastConfig {
    symbol: ICryptoCurrencySymbol,
    start: number,
    end: number,
    intervalMinutes: number
}

