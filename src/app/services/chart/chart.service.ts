import { Injectable } from "@angular/core";
import * as moment from "moment";
import { ApexAnnotations, ApexChart, ApexPlotOptions, ApexYAxis, ApexAxisChartSeries, ApexXAxis } from "ng-apexcharts";
import { ICandlestick, IPositionCandlestick, UtilsService } from "../../core";
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
	// Colors
	public readonly colors: string[] = this.getColors();

	// Event Colors
	public readonly upwardColor: string = "#00695C";
	public readonly downwardColor: string = "#B71C1C";
	public readonly neutralColor: string = "#78909C";


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
        // Make sure at least 5 candlesticks have been provided
        if (!candlesticks || candlesticks.length < 1) {
            throw new Error("A minimum of 1 candlesticks must be provided in order to render the chart.");
        }

		// Check if nice scale should be disabled
		let yaxis: ApexYAxis = { tooltip: { enabled: true }, forceNiceScale: true}
		if (disableNiceScale) {
			// Retrieve the range
			const finalRange: IChartRange = range ? range: this.getCandlesticksChartRange(candlesticks);

			// Build the y axis
			yaxis = { tooltip: { enabled: true }, forceNiceScale: false, min: finalRange.min, max: finalRange.max}
		}
        // Return the chart
        return {
            series: [{name: "candle", data: this.getApexCandlesticks(candlesticks)}],
            chart: {
				type: "candlestick",
				toolbar: {show: true,tools: {selection: true,zoom: true,zoomin: true,zoomout: true,download: false}},
				animations: {enabled: false},
				height: height || 600
            },
			plotOptions: {candlestick: {colors: {upward: this.upwardColor,downward: this.downwardColor}}},
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
    public getApexCandlesticks(candlesticks: Array<ICandlestick|IPositionCandlestick>): IApexCandlestick[] {
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
			title += `${moment(candlesticks[0].ot).format(l == "mobile" ? "DD/MM/YY": "DD MMMM YYYY HH:mm")}`;
			title += ` - ${moment(candlesticks[candlesticks.length - 1].ot).format(l == "mobile" ? "DD/MM/YY": "DD MMMM YYYY HH:mm")}`;
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
     private getCandlesticksAnnotations(data?: ApexAnnotations, currentPrice?: number): ApexAnnotations {
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
		let defaultChart: ApexChart = {height: 600, type: "bar",animations: { enabled: false}, toolbar: {show: false}};
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
		let defaultChart: ApexChart = {height: 600, type: "line",animations: { enabled: false}, toolbar: {show: false}, zoom: {enabled: false}};
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
			const seriesNumbers: number[] = <number[]>series.map((seriesItem) => { return seriesItem.data }).flat();

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
	   let defaultChart: ApexChart = {height: 600, type: "scatter",animations: { enabled: false}, toolbar: {show: false}, zoom: {enabled: false}};
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
		let defaultChart: ApexChart = {height: 400, type: "pie",animations: { enabled: false}, toolbar: {show: false}};
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
		const randomIndex: number= Math.floor(Math.random() * ((this.colors.length - 1) - 0 + 1) + 0);

		// Return the random color
		return this.colors[randomIndex];
	}




	/**
	 * Returns a large list of colors ordered randomly.
	 * @returns string[]
	 */
	private getColors(): string[] {
		return [
			"#310101", "#013131", "#4F3131", "#314F4F", "#9D4B4B", "#4B9D9D", "#910E0E", "#0E9191", "#DF0202", "#02DFDF",
			"#36021B", "#02361D", "#371F2B", "#1F372B", "#673A4F", "#3A6752", "#B94D80", "#4DB986", "#990A4D", "#0A9956",
			"#3A0334", "#033A09", "#6B3C66", "#3C6B41", "#B84BAC", "#4BB857", "#B0029E", "#02B014", "#270439", "#543066",
			"#9B43C8", "#7704B2", "#180745", "#344507", "#373174", "#4A3DC7", "#1605B9", "#A8B905", "#084058", "#2D5A6E",
			"#3D99C1", "#096E9A", "#0A6662", "#42817F", "#0BC4BD", "#0D7B1D", "#4C9A57", "#5F650B", "#A8B402", "#B75116",
			"#167CB7", "#F17C37", "#37ACF1", "#FDD200", "#49EFD3", "#EF4965", "#EF49E4", "#8F000F", "#503149", "#AD451E",
			"#263238", "#546E7A", "#78909C", "#BF360C", "#F4511E", "#FF7043", "#3E2723", "#6D4C41", "#8D6E63", "#424242",
			"#757575", "#9E9E9E", "#F57F17", "#FBC02D", "#1B5E20", "#388E3C", "#4CAF50", "#33691E", "#8BC34A", "#827717",
			"#AFB42B", "#01579B", "#0288D1", "#29B6F6", "#006064", "#00BCD4", "#004D40", "#00897B", "#26A69A", "#311B92",
			"#5E35B1", "#7E57C2", "#1A237E", "#3949AB", "#5C6BC0", "#0D47A1", "#2196F3", "#B71C1C", "#E53935", "#EF5350",
			"#880E4F", "#D81B60", "#EC407A", "#4A148C", "#8E24AA", "#AB47BC", "#AA00FF", "#00BFA5", "#64DD17", "#263238",
		].map(value => ({ value, sort: Math.random() }))
		.sort((a, b) => a.sort - b.sort)
		.map(({ value }) => value);
		/*return [
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
			"#D69F69","#CDDC7A","#8DA5B9","#9690A8","#907B80","#004C9A","#057501","#3DCBD0","#63904C","#f989f7",
			"#2baa8f","#fcff6a","#a58744","#040737","#ae94b0","#5e4301","#b571f6","#f95503","#267782","#ad07ea",
			"#f234b2","#b4be64","#aeee42","#a7c3ca","#a7c3ca","#3093a2","#204b88","#8d6ed0","#80f296","#06e909",
			"#464b95","#c34641","#dec39e","#d5867c","#003960","#b245ce","#d70d62","#8b8a71","#41b6d7","#1b59e9",
			"#6d0f63","#d3011c","#f96818","#2b3b64","#1407b1","#984078","#0e8593","#724f19","#c9ab85","#cea12f",
			"#d6e64e","#60e6cb","#daa1ac","#3f293e","#472b72","#90ed68","#1dcd6d","#a950af","#68f0df","#3F4B30",
			"#680808","#086808","#0808F5","#080868","#682D08","#08682D","#2D0868","#686408","#086864","#640868",
			"#306808","#083068","#680830","#086833","#330868","#683308","#086867","#670868","#686708","#084668",
			"#680846","#466808","#080F68","#68080F","#0F6808","#560868","#685608","#086856","#680843","#436808",
			"#084368","#800000","#408000","#008080","#400080","#805400","#008014","#002C80","#80006C","#3B8000",
			"#4B3030","#304B30","#30304B","#4B4130","#304B41","#41304B","#3A4B30","#303A4B","#4B303A","#303F4B",
			"#4B303F", 
		].map(value => ({ value, sort: Math.random() }))
		.sort((a, b) => a.sort - b.sort)
		.map(({ value }) => value)*/
	}
}
