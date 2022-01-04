import { Component, OnInit } from '@angular/core';
import { ApexAnnotations } from 'ng-apexcharts';
import { ForecastService, IForecastResult, UtilsService } from '../../../core';
import { ChartService, ICandlestickChartConfig, NavService, SnackbarService } from '../../../services';
import { IForecastComponent } from './interfaces';



@Component({
  selector: 'app-forecast',
  templateUrl: './forecast.component.html',
  styleUrls: ['./forecast.component.scss']
})
export class ForecastComponent implements OnInit, IForecastComponent {
	// Config
	public config: ICandlestickChartConfig = this._chart.getDefaultConfig();

	// Forecast Result
	public forecast?: IForecastResult;
	public annotations: ApexAnnotations = {yaxis: []};

	// Load State
	public loaded: boolean = false;




	constructor(
        public _nav: NavService,
        public _forecast: ForecastService,
        private _snackbar: SnackbarService,
        private _utils: UtilsService,
        private _chart: ChartService,
	) { }

	ngOnInit(): void {
		this.performForecast();
	}













	/**
	 * Based on the current configuration, it will retrieve the forecast and
	 * update the chart.
	 * @returns Promise<void>
	 */
	private async performForecast(): Promise<void> {
		try {
			// Set loading state
			this.loaded = false;

			// Retrieve the forecast
			this.forecast = await this._forecast.forecast(
				this.config.start, 
				this.config.end, 
				this.config.intervalMinutes,
				this.config.zoneSize,
				this.config.zoneMergeDistanceLimit,
			);

			// Build the annotations
			this.annotations.yaxis = this._chart.buildKeyZonesAnnotations(this.forecast.state.zones, this.forecast.state.price);
		} catch (e) {
			console.log(e);
			this._snackbar.error(this._utils.getErrorMessage(e));
		}

		// Update loaded state
		this.loaded = true;
	}






	/**
	 * Displays the forecast details dialog.
	 * @returns void
	 */
	public displayForecastDetails(): void {
		this._nav.displayForecastDialog(<IForecastResult>this.forecast);
		/*this.dialog.open(ForecastDialogComponent, {
			disableClose: true,
			hasBackdrop: this._app.layout.value != 'mobile', // Mobile optimization
			panelClass: 'medium-dialog',
            data: this.forecast
		});*/
	}
	






    /**
     * Refreshes the chart with the latest candlesticks.
     * @returns void
     */
	 public refresh(): void {
        // Set Default Config
        this.config = this._chart.getDefaultConfig();

        // Rebuild the candlesticks
        this.performForecast();
    }










    /**
     * Displays the config dialog and reloads the chart once the new configuration
     * has been set.
     * @returns void
     */
     public updateConfig(): void {
        this._chart.displayChartConfigDialog({forecast: true, ...this.config}).afterClosed().subscribe(
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
