import { ICandlestick } from "../../core";
import {
	ApexAxisChartSeries,
	ApexChart,
	ApexYAxis,
	ApexXAxis,
	ApexTitleSubtitle,
    ApexAnnotations
} from "ng-apexcharts";
import { MatDialogRef } from "@angular/material/dialog";



// Service
export interface ICandlestickChartService {
    // Chart Builder
    build(candlesticks: ICandlestick[], annotations?: any): ICandlestickChartOptions,

    // Misc Helpers
    displayChartConfigDialog(config: ICandlestickChartConfig): MatDialogRef<any>,
    getDefaultConfig(): ICandlestickChartConfig,
}





// Config
export interface ICandlestickChartConfig {
    start: number,
    end: number,
    intervalMinutes: number
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



export interface IApexCandlestick {
    x: number,
    y: [number, number, number, number]
}
