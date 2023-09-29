import { Injectable } from "@angular/core";
import * as moment from "moment";
import { 
    ApexAnnotations, 
    ApexChart, 
    ApexPlotOptions, 
    ApexYAxis, 
    ApexAxisChartSeries, 
    ApexXAxis 
} from "ng-apexcharts";
import { ICandlestick, IPositionCandlestick, MarketStateService, UtilsService } from "../../core";
import { AppService, ILayout } from "../app";
import { 
	IApexCandlestick, 
	IChartService, 
	ICandlestickChartOptions, 
	IChartRange, 
	IBarChartOptions, 
	ILineChartOptions, 
	IScatterChartOptions,
	IPieChartOptions
} from "./interfaces";




@Injectable({
  providedIn: "root"
})
export class ChartService implements IChartService {
	// Random Colors
	private readonly randomColors: string[] = this.getRandomColors();


  	constructor(
		private _app: AppService,
        private _ms: MarketStateService,
		private _utils: UtilsService,
	  ) { }













    /* Candlesticks */








    /**
     * Given a list of candlesticks and annotation data, will retrieve the chart object
     * to be rendered.
     * @param candlesticks 
     * @param annotations?
     * @param highlightCurrentPrice?
     * @param disableNiceScale?
     * @param range?
     * @returns ICandlestickChartOptions
     */
	public getCandlestickChartOptions(
		 candlesticks: Array<ICandlestick|IPositionCandlestick|any>, 
		 annotations?: ApexAnnotations, 
		 highlightCurrentPrice?: boolean,
		 disableNiceScale?: boolean,
		 range?: IChartRange,
		 height?: number,
		 title?: string
	): ICandlestickChartOptions {
		// Check if nice scale should be disabled
		let yaxis: ApexYAxis = { tooltip: { enabled: true }, forceNiceScale: true}
		if (disableNiceScale) {
			// Retrieve the range
			const finalRange: IChartRange = 
                range ? range: this.getCandlesticksChartRange(candlesticks);

			// Build the y axis
			yaxis = { 
                tooltip: { enabled: true }, 
                forceNiceScale: false, 
                min: finalRange.min, 
                max: finalRange.max
            }
		}
        // Return the chart
        return {
            series: [{name: "candle", data: this.getApexCandlesticks(candlesticks)}],
            chart: {
				type: "candlestick",
				toolbar: {
                    show: true,
                    tools: {selection: true,zoom: true,zoomin: true,zoomout: true,download: false}
                },
				animations: {enabled: false},
				height: height || 600
            },
			plotOptions: {
                candlestick: {colors: {
                    upward: this._ms.colors.increase_2,
                    downward: this._ms.colors.decrease_2
                }}
            },
            annotations: this.getCandlesticksAnnotations(
				annotations, 
				highlightCurrentPrice ? candlesticks[candlesticks.length -1].c: undefined
			),
            title: {
				text: title ? title: this.getCandlesticksTitle(candlesticks), 
				align: "left"
			},
            xaxis: {type: "datetime",tooltip: {enabled: true}, labels: {datetimeUTC: false}}, 
            yaxis: yaxis
        }
    }









	/**
	 * Given a list of raw candlesticks, it will convert them into Apex format.
	 * @returns IApexCandlestick[]
	 */
    public getApexCandlesticks(
        candlesticks: Array<ICandlestick|IPositionCandlestick>
    ): IApexCandlestick[] {
		return candlesticks.map((c) => {
			return {
				x: c.ot,
				y: [c.o, c.h, c.l, c.c]
			}
		});
	}







	/**
	 * Retrieves the title to be placed in the chart.
	 * @returns string
	 */
     private getCandlesticksTitle(candlesticks: Array<ICandlestick>): string {
		// Init values
        const l: ILayout = this._app.layout.value;
		let title: string = "";

		if (candlesticks.length) {
			title += `${moment(
                candlesticks[0].ot
            ).format(l == "mobile" ? "DD/MM/YY": "DD MMMM YYYY HH:mm")}`;
			title += ` - ${moment(
                candlesticks[candlesticks.length - 1].ot
            ).format(l == "mobile" ? "DD/MM/YY": "DD MMMM YYYY HH:mm")}`;
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
	private getCandlesticksChartRange(candlesticks: Array<ICandlestick>): IChartRange {
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
			max: <number>this._utils.getMax(high),
			min: <number>this._utils.getMin(low)
		}
	}









    /**
     * Retrieves the annotations for the current chart.
	 * @param data?
	 * @param currentPrice?
     * @returns any
     */
     private getCandlesticksAnnotations(
        data?: ApexAnnotations, 
        currentPrice?: number
    ): ApexAnnotations {
		 // Init the annotations
		 let annotations: ApexAnnotations = {
			xaxis: data?.xaxis || [],
			yaxis: data?.yaxis || [],
			points: data?.points || []
		 }

		 // Check if the current price was provided
		 if (currentPrice) {
			annotations.yaxis?.push({
				y: currentPrice,
				strokeDashArray: 0,
				borderColor: "",
				fillColor: "",
				label: {
					borderColor: "#000000",
					style: { color: "#fff", background: "#000000"},
					text: `$${this._utils.formatNumber(currentPrice, 2)}`,
					position: "left",
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
	 * @param disableNiceScale?
	 * @param range?
	 * @returns IBarChartOptions
	 */
	public getBarChartOptions(
		config: Partial<IBarChartOptions>, 
		categories?: string[], 
		height?: number,
		plotOptionsDistributed?: boolean,
		disableNiceScale?: boolean,
		range?: IChartRange,
		annotations?: ApexAnnotations
	): IBarChartOptions {
		// Init the default chart
		let defaultChart: ApexChart = {
            height: 600, 
            type: "bar",
            animations: { enabled: false}, 
            toolbar: {show: false}
        };
		if (typeof height == "number") defaultChart.height = height;

		// Init the default plot options
		let defaultPlotOptions: ApexPlotOptions = {
            bar: {borderRadius: 4, horizontal: true, distributed: false,}
        };
		if (plotOptionsDistributed) defaultPlotOptions.bar!.distributed = true;

		// Init the colors
		let colors: string[] = config.colors || [];
		if (!colors.length && categories && categories.length) {
			colors = this.randomColors.slice(0, categories.length)
		}

		// Init the xaxis if none provided and the categories have been
		let xaxis: ApexXAxis = config.xaxis || {};
		if (!config.xaxis && categories) {
			xaxis = {categories: categories}
		}

		// Check if the nice scale should be disabled
		let yaxis = config.yaxis || {};
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
			colors: colors,
			plotOptions: config.plotOptions ? config.plotOptions: defaultPlotOptions,
			dataLabels: config.dataLabels ? config.dataLabels: {enabled: false},
			grid: config.grid ? config.grid: {show: false},
			fill: config.fill ? config.fill: {},
			xaxis: xaxis,
			yaxis: yaxis,
			annotations: annotations ? annotations: {},
			legend: config.legend ? config.legend: {},
			title: config.title ? config.title: {}
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
		let defaultChart: ApexChart = {
            height: 600, 
            type: "line",
            animations: { enabled: false}, 
            toolbar: {show: false}, 
            zoom: {enabled: false}
        };
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
			xaxis: config.xaxis ? config.xaxis: {labels: { show: false }, axisTicks: {show: false} },
			yaxis: yaxis || {},
			annotations: config.annotations ? config.annotations: {},
			colors: colors ? colors: [],
			title: config.title ? config.title: {}
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
			const seriesNumbers: number[] = <number[]>series.map(
                (seriesItem) => { return seriesItem.data }
            ).flat();

			// Return the min and the max value
			return {
				min: <number>this._utils.getMin(seriesNumbers),
				max: <number>this._utils.getMax(seriesNumbers)
			}
	}







	/**
	 * Builds the configuration for a scatter chart.
	 * @param config 
	 * @param height?
	 * @param disableNiceScale?
	 * @param range?
	 * @param colors?
	 * @returns IScatterChartOptions
	 */
	 public getScatterChartOptions(
		config: Partial<IScatterChartOptions>, 
		height?: number, 
		disableNiceScale?: boolean, 
		range?: IChartRange,
		colors?: string[]
   ): IScatterChartOptions {
	   // Init the default chart
	   let defaultChart: ApexChart = {
            height: 600, type: "scatter",
            animations: { enabled: false}, 
            toolbar: {show: false}, 
            zoom: {enabled: false}
        };
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
		   xaxis: config.xaxis ? config.xaxis: {labels: { show: false }, axisTicks: {show: false} },
		   yaxis: yaxis || {},
		   dataLabels: config.dataLabels ? config.dataLabels: {enabled: false},
		   colors: colors || []
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
		let defaultChart: ApexChart = {
            height: 400, 
            type: "pie",
            animations: { enabled: false}, toolbar: {show: false}
        };
		if (typeof height == "number") defaultChart.height = height;

		// Init the colors
		let colors: string[] = config.colors || [];
		if (!colors.length && labels && labels.length) {
			colors = this.randomColors.slice(0, labels.length)
		}

		// Return the Options Object
		return {
			series: config.series!,
			chart: config.chart ? config.chart: defaultChart,
			colors: colors,
			labels: labels,
			legend: config.legend ? config.legend: {},
			responsive: [
				{
					breakpoint: 480,
					options: {
					  chart: {
						width: 250
					  },
					  legend: {
						position: "bottom"
					  }
					}
				  }
			]
		}
	}












    /* Misc Helpers */











	/**
	 * Retrieves the recommended height for a chart based on the 
	 * number of categories in it.
	 * @param baseHeight	HorizontalBarCharts: 110 | Lines: 400
	 * @param increment		HorizontalBarCharts: 20 | Lines: 10
	 * @param categoriesNum
	 * @param itemsPerCategory?
	 * @param maxHeight?	Lines: 800
	 */
	public calculateChartHeight(
		baseHeight: number,
		increment: number,
		categoriesNum: number,
		itemsPerCategory?: number,
		maxHeight?: number
	): number {
		// Calculate the recommended height
		let height: number = ((categoriesNum-1) * increment) + baseHeight;

		// Check if the items per category was provided
		if (typeof itemsPerCategory == "number" && itemsPerCategory > 1) {
			if (itemsPerCategory == 2) {
				height = height * 1.4;
			} else if (itemsPerCategory == 3) {
				height = height * 2.3;
			} else if (itemsPerCategory == 4) {
				height = height * 2.8;
			}
		}

		// Check if the max height has been exceeded
		if (typeof maxHeight == "number" && height > maxHeight) {
			return maxHeight;
		} else {
			return height;
		}
	}






	/**
	 * Retrieves a random color from the list.
	 * @returns string
	 */
	public getRandomColor(): string {
		// Init the random index
		const randomIndex: number= Math.floor(
            Math.random() * ((this.randomColors.length - 1) - 0 + 1) + 0
        );

		// Return the random color
		return this.randomColors[randomIndex];
	}




	/**
	 * Returns a large list of colors ordered randomly.
	 * @returns string[]
	 */
	private getRandomColors(): string[] {
		return [
			"#310101", "#013131", "#4F3131", "#314F4F", "#9D4B4B", "#4B9D9D", "#910E0E", "#0E9191", 
            "#DF0202", "#02DFDF", "#36021B", "#02361D", "#371F2B", "#1F372B", "#673A4F", "#3A6752", 
            "#B94D80", "#4DB986", "#990A4D", "#0A9956", "#3A0334", "#033A09", "#6B3C66", "#3C6B41", 
            "#B84BAC", "#4BB857", "#B0029E", "#02B014", "#270439", "#543066", "#9B43C8", "#7704B2", 
            "#180745", "#344507", "#373174", "#4A3DC7", "#1605B9", "#A8B905", "#084058", "#2D5A6E",
			"#3D99C1", "#096E9A", "#0A6662", "#42817F", "#0BC4BD", "#0D7B1D", "#4C9A57", "#5F650B", 
            "#A8B402", "#B75116", "#167CB7", "#F17C37", "#37ACF1", "#FDD200", "#49EFD3", "#EF4965", 
            "#EF49E4", "#8F000F", "#503149", "#AD451E", "#263238", "#546E7A", "#78909C", "#BF360C", 
            "#F4511E", "#FF7043", "#3E2723", "#6D4C41", "#8D6E63", "#424242", "#757575", "#9E9E9E", 
            "#F57F17", "#FBC02D", "#1B5E20", "#388E3C", "#4CAF50", "#33691E", "#8BC34A", "#827717",
			"#AFB42B", "#01579B", "#0288D1", "#29B6F6", "#006064", "#00BCD4", "#004D40", "#00897B", 
            "#26A69A", "#311B92", "#5E35B1", "#7E57C2", "#1A237E", "#3949AB", "#5C6BC0", "#0D47A1", 
            "#2196F3", "#B71C1C", "#E53935", "#EF5350", "#880E4F", "#D81B60", "#EC407A", "#4A148C", 
            "#8E24AA", "#AB47BC", "#AA00FF", "#00BFA5", "#64DD17", "#263238",
		].map(value => ({ value, sort: Math.random() }))
		.sort((a, b) => a.sort - b.sort)
		.map(({ value }) => value);
	}
}
