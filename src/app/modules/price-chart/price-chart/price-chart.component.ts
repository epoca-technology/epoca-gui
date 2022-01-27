import { Component, OnInit } from '@angular/core';
import { IPriceChartComponent, IPriceChartConfig } from './interfaces';
import { CandlestickService, ICandlestick, UtilsService } from '../../../core';
import { AppService, ChartService, NavService, SnackbarService } from '../../../services';
import * as moment from 'moment';
import {MatDialog} from '@angular/material/dialog';
import { PriceChartConfigComponent } from './price-chart-config/price-chart-config.component';



@Component({
  selector: 'app-price-chart',
  templateUrl: './price-chart.component.html',
  styleUrls: ['./price-chart.component.scss']
})
export class PriceChartComponent implements OnInit, IPriceChartComponent {
	// Config
	public config: IPriceChartConfig = this.getDefaultConfig();

	// Raw Candlesticks
	public rawCandlesticks?: ICandlestick[];

	// Load State
	public loaded: boolean = false;



    constructor(
        public _nav: NavService,
        private _candlestick: CandlestickService,
        private _snackbar: SnackbarService,
        private _utils: UtilsService,
        private _chart: ChartService,
        private dialog: MatDialog,
        private _app: AppService
    ) { }

    ngOnInit(): void {
        this.buildCandlesticks();
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
		} catch (e) {
			console.log(e);
			this._snackbar.error(this._utils.getErrorMessage(e));
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
        this.dialog.open(PriceChartConfigComponent, {
			disableClose: true,
			hasBackdrop: this._app.layout.value != 'mobile', // Mobile optimization
			panelClass: 'small-dialog',
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
    private getDefaultConfig(): IPriceChartConfig {
        const currentTS: number = Date.now();
		return {
			start: moment(currentTS).subtract(3, 'days').valueOf(),
			end: currentTS,
			intervalMinutes: 30
		}
    }
}
