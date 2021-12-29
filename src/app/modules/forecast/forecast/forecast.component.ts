import { Component, OnInit } from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import { ApexAnnotations } from 'ng-apexcharts';
import { ForecastService, IForecastResult, UtilsService } from '../../../core';
import { AppService, CandlestickChartService, ICandlestickChartConfig, NavService, SnackbarService } from '../../../services';
import { ForecastDialogComponent } from './forecast-dialog';
import { IForecastComponent } from './interfaces';



@Component({
  selector: 'app-forecast',
  templateUrl: './forecast.component.html',
  styleUrls: ['./forecast.component.scss']
})
export class ForecastComponent implements OnInit, IForecastComponent {
	// Config
	public config: ICandlestickChartConfig = this._candlestickChart.getDefaultConfig();

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
        private _candlestickChart: CandlestickChartService,
		private dialog: MatDialog,
		private _app: AppService
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
				this.config.reversalCountRequirement,
			);

			// Build the annotations
			this.annotations.yaxis = this._candlestickChart.buildKeyZonesAnnotations(this.forecast.keyZonesState.zones);
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
		this.dialog.open(ForecastDialogComponent, {
			disableClose: true,
			hasBackdrop: this._app.layout.value != 'mobile', // Mobile optimization
			panelClass: 'medium-dialog',
            data: this.forecast
		});
	}
	






    /**
     * Refreshes the chart with the latest candlesticks.
     * @returns void
     */
	 public refresh(): void {
        // Set Default Config
        this.config = this._candlestickChart.getDefaultConfig();

        // Rebuild the candlesticks
        this.performForecast();
    }










    /**
     * Displays the config dialog and reloads the chart once the new configuration
     * has been set.
     * @returns void
     */
     public updateConfig(): void {
        this._candlestickChart.displayChartConfigDialog({forecast: true, ...this.config}).afterClosed().subscribe(
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
