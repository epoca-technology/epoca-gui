import { Component, OnDestroy, OnInit } from "@angular/core";
import {Title} from "@angular/platform-browser";
import {MatDialog} from "@angular/material/dialog";
import * as moment from "moment";
import { CandlestickService, ICandlestick } from "../../../core";
import { AppService, ChartService, ICandlestickChartOptions, NavService } from "../../../services";
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
	// Config
	public config: ICandlesticksConfig = this.getDefaultConfig();

	// Raw Candlesticks
	public rawCandlesticks?: ICandlestick[];
    public chartOptions?: Partial<ICandlestickChartOptions>;

	// Load State
	public loaded: boolean = false;



    constructor(
        public _nav: NavService,
        private _candlestick: CandlestickService,
        private _chart: ChartService,
        private dialog: MatDialog,
        private _app: AppService,
        private titleService: Title
    ) { }

    ngOnInit(): void {
        this.buildCandlesticks();
    }


    ngOnDestroy(): void {
        this.titleService.setTitle("Epoca");
    }






	/**
	 * Based on the current configuration, it will retrieve the candlesticks and
	 * update the chart.
	 * @returns Promise<void>
	 */
     private async buildCandlesticks(): Promise<void> {
		try {
			// Set loading state
			this.loaded = false;

			// Retrieve the raw candlesticks
			this.rawCandlesticks = await this._candlestick.getForPeriod(
				this.config.start, 
				this.config.end, 
				this.config.intervalMinutes
			);

            // Retrieve the chart options
            const self = this;
            this.chartOptions = this._chart.getCandlestickChartOptions(this.rawCandlesticks, undefined, true, true);
            this.chartOptions.chart!.height = this._app.layout.value == "desktop" ? 600: 350;
            this.chartOptions.chart!.zoom = {enabled: true, type: "xy"}
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
			start: moment(currentTS).subtract(80, "hours").valueOf(),
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
