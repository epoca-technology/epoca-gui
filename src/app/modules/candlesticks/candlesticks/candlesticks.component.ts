import { Component, OnDestroy, OnInit, ViewChild } from "@angular/core";
import {Title} from "@angular/platform-browser";
import {MatDialog} from "@angular/material/dialog";
import * as moment from "moment";
import { Subscription } from "rxjs";
import { ChartComponent } from "ng-apexcharts";
import { CandlestickService, ICandlestick } from "../../../core";
import { AppService, ChartService, ICandlestickChartOptions, ILayout, NavService } from "../../../services";
import { CandlestickFilesDialogComponent } from "./candlestick-files-dialog/candlestick-files-dialog.component";
import { CandlesticksConfigDialogComponent } from "./candlesticks-config-dialog/candlesticks-config-dialog.component";
import { CandlestickDialogComponent } from "../../../shared/components/candlestick";
import { ICandlesticksComponent, ICandlesticksConfig} from "./interfaces";


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

	// Load State
	public loaded: boolean = false;



    constructor(
        public _nav: NavService,
        private _chart: ChartService,
        private dialog: MatDialog,
        private _app: AppService,
        private titleService: Title,
        private _candlestick: CandlestickService
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
			this.rawCandlesticks = await this._candlestick.getForPeriod(
				this.config.start, 
				this.config.end, 
				this.config.intervalMinutes
			);

            // Retrieve the chart options
            const self = this;
            this.chartOptions = this._chart.getCandlestickChartOptions(this.rawCandlesticks, undefined, false, true);
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

		// Update loaded state
		this.loaded = true;
		setTimeout(() => { this.chartComp?.resetSeries() }, 100);
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
			intervalMinutes: 15
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
