import { Component, OnDestroy, OnInit, ViewChild } from "@angular/core";
import {Title} from "@angular/platform-browser";
import {MatDialog} from "@angular/material/dialog";
import * as moment from "moment";
import { ChartComponent } from "ng-apexcharts";
import { CandlestickService, ICandlestick, IPredictionCandlestick, LocalDatabaseService } from "../../../core";
import { AppService, ChartService, IBarChartOptions, ICandlestickChartOptions, ILayout, NavService } from "../../../services";
import { CandlestickFilesDialogComponent } from "./candlestick-files-dialog/candlestick-files-dialog.component";
import { CandlesticksConfigDialogComponent } from "./candlesticks-config-dialog/candlesticks-config-dialog.component";
import { CandlestickDialogComponent } from "../../../shared/components/candlestick";
import { ICandlesticksComponent, ICandlesticksConfig} from "./interfaces";
import { Subscription } from "rxjs";


@Component({
  selector: "app-candlesticks",
  templateUrl: "./candlesticks.component.html",
  styleUrls: ["./candlesticks.component.scss"]
})
export class CandlesticksComponent implements OnInit, OnDestroy, ICandlesticksComponent {
	// Layout
	public layout: ILayout = this._app.layout.value;
	private layoutSub?: Subscription;

	// Config
	public config: ICandlesticksConfig = this.getDefaultConfig();

    // Server Time
    private serverTime!: number;
    private serverTimeSub?: Subscription;

	// Raw Candlesticks
	@ViewChild("chartComp") chartComp?: ChartComponent;
	public rawCandlesticks?: ICandlestick[];
    public chartOptions?: Partial<ICandlestickChartOptions>;
	public barChart?: IBarChartOptions;

	// Load State
	public loaded: boolean = false;



    constructor(
        public _nav: NavService,
        private _candlestick: CandlestickService,
        private _chart: ChartService,
        private dialog: MatDialog,
        private _app: AppService,
        private titleService: Title,
        private _localDB: LocalDatabaseService
    ) { }

    ngOnInit(): void {
        // Initialize layout
        this.layoutSub = this._app.layout.subscribe((nl: ILayout) => this.layout = nl);

        // Subscribe to the server time
        this.serverTimeSub = this._app.serverTime.subscribe((newTime: number|null|undefined) => {
            if (typeof newTime == "number" && newTime > 0) {
                this.serverTime = newTime;
                if (!this.rawCandlesticks) this.buildCandlesticks();
            }
        });
    }


    ngOnDestroy(): void {
        if (this.layoutSub) this.layoutSub.unsubscribe();
        this.titleService.setTitle("Epoca");
        if (this.serverTimeSub) this.serverTimeSub.unsubscribe();
    }






	/**
	 * Based on the current configuration, it will retrieve the candlesticks and
	 * update the chart.
	 * @returns Promise<void>
	 */
     private async buildCandlesticks(): Promise<void> {
        // Set loading state
        this.loaded = false;

        // Build the candlesticks
		try {
			// Retrieve the raw candlesticks
			this.rawCandlesticks = await this._localDB.getCandlesticksForPeriod(
				this.config.start, 
				this.config.end, 
                this.serverTime,
				this.config.intervalMinutes
			);

            // Retrieve the chart options
            const self = this;
            this.chartOptions = this._chart.getCandlestickChartOptions(this.rawCandlesticks, undefined, true, true);
            this.chartOptions.chart!.height = this._app.layout.value == "desktop" ? 600: 400;
            this.chartOptions.chart!.zoom = {enabled: true, type: "xy"}
            this.chartOptions.chart!.id = "candles";
            this.chartOptions.chart!.group = "predictions";
            this.chartOptions.chart!.events = {
                click: function(event, chartContext, config) {
                    if (self.rawCandlesticks![config.dataPointIndex]) self.displayCandlestickDialog(self.rawCandlesticks![config.dataPointIndex]);
                }
            }

            // Set the current price as the title
            if (this.rawCandlesticks.length) {
                const p: string = this.rawCandlesticks[this.rawCandlesticks.length - 1].c.toLocaleString(undefined, {minimumFractionDigits: 2});
                this.titleService.setTitle(`$${p}`);
            }
		} catch (e) {
			console.log(e);
			this._app.error(e);
		}

        // Build the prediction indicator if applies
        if (
            this.config.intervalMinutes == this._candlestick.predictionCandlestickInterval && 
            this._app.epoch.value &&
            this.rawCandlesticks && this.rawCandlesticks.length > 0
            ) {
                try {
                    // Since the prediction sum chart will be displayed, adjust the candlesticks size
                    this.chartOptions!.chart!.height = this._app.layout.value == "desktop" ? 550: 350;

                    // Retrieve the predictions within the range
                    const preds: IPredictionCandlestick[] = await this._localDB.listPredictionCandlesticks(
                        this._app.epoch.value.id, 
                        this.rawCandlesticks[0].ot, 
                        this.rawCandlesticks[this.rawCandlesticks.length - 1].ct,
                        this._app.epoch.value.installed,
                        <number>this._app.serverTime.value
                    );
    
                    // Build the bars data
                    const { values, colors } = this.buildPredictionBarsData(this.rawCandlesticks, preds);
                    
                    // Build the chart
                    this.barChart = this._chart.getBarChartOptions(
                        {
                            series: [{name: "SUM Mean", data: values}],
                            chart: {height: 140, type: "bar",animations: { enabled: false}, toolbar: {show: false,tools: {download: false}}, zoom: {enabled: false}},
                            plotOptions: {bar: {borderRadius: 0, horizontal: false, distributed: true,}},
                            colors: colors,
                            grid: {show: true},
                            xaxis: {type: "datetime", tooltip: {enabled: false}, labels: { show: false, datetimeUTC: false } }
                        }, 
                        [], 
                        undefined, 
                        false,
                        true,
                        {
                            min: -this._app.epoch.value.model.regressions.length, 
                            max: this._app.epoch.value.model.regressions.length, 
                        }
                    );
                    this.barChart.chart!.id = "bars";
                    this.barChart.chart!.group = "predictions";
                    this.barChart.yaxis!.labels = {minWidth: 40}
                    this.barChart.yaxis!.tooltip = {enabled: false}
                } catch (e) { this._app.error(e) }
        } else { this.barChart = undefined }

		// Update loaded state
		this.loaded = true;
		setTimeout(() => { this.chartComp?.resetSeries() }, 100);
	}







	/**
	 * Builds the data required by the bar chart based on the 
	 * candlesticks and the generated predictions.
	 * @param candlesticks 
	 * @param preds 
	 * @returns {values: number[], colors: string[]}
	 */
     private buildPredictionBarsData(
		candlesticks: ICandlestick[], 
		preds: IPredictionCandlestick[]
	): {values: {x: number, y: number}[], colors: string[]} {
		// Init values
		let values: {x: number, y: number}[] = [];
		let colors: string[] = [];

		// Iterate over each candlestick and group the preds
		for (let candle of candlesticks) {
			// Group the predictions within the candlestick
			const predsInCandle: IPredictionCandlestick[] = preds.filter((p) => candle.ot >= p.ot  && p.ot <= candle.ct);

			// Make sure there are predictions in the candle
			if (predsInCandle.length) {
				// Calculate the mean of the sums within the group
				const sumsMean: number = predsInCandle[predsInCandle.length - 1].sm;

				// Append the values
				values.push({x: candle.ot, y: sumsMean});
				if (sumsMean > 0) { colors.push(this._chart.upwardColor) }
				else if (sumsMean < 0) { colors.push(this._chart.downwardColor) }
				else { colors.push(this._chart.neutralColor) }
			}
			
			// Otherwise, fill the void with blanks
			else {
				values.push({x: candle.ot, y: 0.000000});
				colors.push(this._chart.neutralColor);
			}
		}

		// Finally, return the data
		return { values: values, colors: colors };
	}










    /**
     * Refreshes the chart with the latest candlesticks.
     * @returns void
     */
    public refresh(): void {
        // Set Default Config
        this.config = this.getDefaultConfig();

        // Rebuild the candlesticks
        this.buildCandlesticks();
    }










    /**
     * Displays the config dialog and reloads the chart once the new configuration
     * has been set.
     * @returns void
     */
    public updateConfig(): void {
        this.dialog.open(CandlesticksConfigDialogComponent, {
			disableClose: true,
			hasBackdrop: this._app.layout.value != "mobile", // Mobile optimization
			panelClass: "small-dialog",
            data: this.config
		}).afterClosed().subscribe(
            (response) => {
                if (response) {
                    // Set the new config
                    this.config = response;

                    // Reload the chart
                    this.buildCandlesticks();
                }
            }
        );
    }







    /**
     * Retrieves the default chart configuration.
     * @returns IPriceChartConfig
     */
    private getDefaultConfig(): ICandlesticksConfig {
        const currentTS: number = Date.now();
		return {
			start: moment(currentTS).subtract(128, "hours").valueOf(),
			end: currentTS,
			intervalMinutes: 30
		}
    }










    /**
     * Displays the candlestick spreadsheets dialog.
     * @returns void
     */
    public displayCandlestickFiles(): void {
        this.dialog.open(CandlestickFilesDialogComponent, {
			disableClose: true,
			hasBackdrop: this._app.layout.value != "mobile", // Mobile optimization
			panelClass: "small-dialog"
		})
    }








    

	/*
	* Displays the candlestick dialog
	* @param candlestick
	* @returns void
	* */
	private displayCandlestickDialog(candlestick: ICandlestick): void {
		this.dialog.open(CandlestickDialogComponent, {
			disableClose: false,
			hasBackdrop: this._app.layout.value != "mobile", // Mobile optimization
			panelClass: "small-dialog",
			data: candlestick
		});
	}
}
