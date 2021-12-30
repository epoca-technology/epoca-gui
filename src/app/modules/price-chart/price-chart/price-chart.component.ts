import { Component, OnInit } from '@angular/core';
import { IPriceChartComponent } from './interfaces';
import { CandlestickService, ICandlestick, UtilsService } from '../../../core';
import { ChartService, ICandlestickChartConfig, NavService, SnackbarService } from '../../../services';




@Component({
  selector: 'app-price-chart',
  templateUrl: './price-chart.component.html',
  styleUrls: ['./price-chart.component.scss']
})
export class PriceChartComponent implements OnInit, IPriceChartComponent {
	// Config
	public config: ICandlestickChartConfig = this._chart.getDefaultConfig();

	// Raw Candlesticks
	public rawCandlesticks?: ICandlestick[];

	// Load State
	public loaded: boolean = false;



    constructor(
        public _nav: NavService,
        private _candlestick: CandlestickService,
        private _snackbar: SnackbarService,
        private _utils: UtilsService,
        private _chart: ChartService
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
        this.config = this._chart.getDefaultConfig();

        // Rebuild the candlesticks
        this.buildCandlesticks();
    }





    /**
     * Displays the config dialog and reloads the chart once the new configuration
     * has been set.
     * @returns void
     */
    public updateConfig(): void {
        this._chart.displayChartConfigDialog(this.config).afterClosed().subscribe(
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


}
