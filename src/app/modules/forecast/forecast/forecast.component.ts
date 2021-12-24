import { Component, OnInit } from '@angular/core';
import { CandlestickService, ICandlestick, UtilsService } from '../../../core';
import { CandlestickChartService, ICandlestickChartConfig, NavService, SnackbarService } from '../../../services';
import { IForecastComponent } from './interfaces';



@Component({
  selector: 'app-forecast',
  templateUrl: './forecast.component.html',
  styleUrls: ['./forecast.component.scss']
})
export class ForecastComponent implements OnInit, IForecastComponent {
	// Config
	public config: ICandlestickChartConfig = this._candlestickChart.getDefaultConfig();

	// Raw Candlesticks
	public rawCandlesticks?: ICandlestick[];

	// Load State
	public loaded: boolean = false;




	constructor(
        public _nav: NavService,
        private _candlestick: CandlestickService,
        private _snackbar: SnackbarService,
        private _utils: UtilsService,
        private _candlestickChart: CandlestickChartService
	) { }

	ngOnInit(): void {
		this.performForecast();
	}













	/**
	 * Based on the current configuration, it will retrieve the forecast and
	 * update the chart.
	 * @returns Promise<void>
	 */
	public async performForecast(): Promise<void> {
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
     * Displays the config dialog and reloads the chart once the new configuration
     * has been set.
     * @returns void
     */
     public updateConfig(): void {
        this._candlestickChart.displayChartConfigDialog(this.config).afterClosed().subscribe(
            (response) => {
                if (response) {
                    // Set the new config
                    this.config = response;

                    // Reload the chart
                    this.performForecast();
                }
            }
        );
    }
}
