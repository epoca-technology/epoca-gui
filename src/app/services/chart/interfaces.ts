import { ICandlestick, IKeyZone } from "../../core";
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
import { MatDialogRef } from "@angular/material/dialog";



export interface IChartService {
    // Candlesticks
    build(candlesticks: ICandlestick[], annotations?: ApexAnnotations): ICandlestickChartOptions,
    buildKeyZonesAnnotations(keyZones: IKeyZone[], currentPrice: number): YAxisAnnotations[],
    displayChartConfigDialog(config: ICandlestickChartConfig): MatDialogRef<any>,
    getDefaultConfig(config?: ICandlestickChartPartialConfig): ICandlestickChartConfig,
}






// Config
export interface ICandlestickChartConfig {
    start: number,
    end: number,
    intervalMinutes: number,

    // Forecast Specific
    forecast?: boolean,
    zoneSize: number,
    zoneMergeDistanceLimit: number,
    priceActionCandlesticksRequirement: number,
}
export interface ICandlestickChartPartialConfig {
    start?: number,
    end?: number,
    intervalMinutes?: number,
    zoneSize?: number,
    zoneMergeDistanceLimit?: number,
    priceActionCandlesticksRequirement?: number,
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