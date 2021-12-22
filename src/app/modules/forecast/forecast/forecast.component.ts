import { Component, OnInit, ViewChild } from '@angular/core';
import { CandlestickService, CryptocurrencyService, ICandlestick, UtilsService } from '../../../core';
import { AppService, NavService, SnackbarService } from '../../../services';
import { IForecastComponent, IForecastConfig, IChartOptions, IApexCandlestick } from './interfaces';
import * as moment from 'moment';
import {ChartComponent} from "ng-apexcharts";



@Component({
  selector: 'app-forecast',
  templateUrl: './forecast.component.html',
  styleUrls: ['./forecast.component.scss']
})
export class ForecastComponent implements OnInit, IForecastComponent {
	@ViewChild("chart") chart?: ChartComponent;
	public chartOptions?: Partial<IChartOptions>;


	// Config
	private config: IForecastConfig = this.getDefaultConfig();

	// Raw Candlesticks
	public rawCandlesticks: ICandlestick[] = [];



	// Load State
	public loaded: boolean = false;

	constructor(
		public _nav: NavService,
		public _cCurrency: CryptocurrencyService,
		private _candlestick: CandlestickService,
		private _snackbar: SnackbarService,
		private _utils: UtilsService,
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
	public async performForecast(): Promise<void> {
		try {
			// Set loading state
			this.loaded = false;

			// Retrieve the raw candlesticks
			this.rawCandlesticks = await this._candlestick.getForPeriod(
				this.config.symbol, 
				this.config.start, 
				this.config.end, 
				this.config.intervalMinutes
			);

			this.chartOptions = {
				series: [
				  {
					name: "candle",
					data: this.getApexCandlesticks(this.rawCandlesticks)
				  }
				],
				chart: {
				  type: "candlestick",
				  animations: {
					  enabled: false
				  }
				},
				annotations: {
					/*xaxis: [
						{
							x: this.rawCandlesticks[30].ot,
							strokeDashArray: 0,
							borderColor: '#00695C',
							label: {
								borderColor: '#00695C',
								style: {
									color: '#fff',
									background: '#00695C',
								},
								text: 'LONG POSITION',
							}
						},
						{
							x: this.rawCandlesticks[186].ot,
							strokeDashArray: 0,
							borderColor: '#00695C',
							label: {
								borderColor: '#00695C',
								style: {
									color: '#fff',
									background: '#00695C',
								},
								text: 'SHORT POSITION',
							}
						},
					],*/
					yaxis: [
						{
							y: 48845.12,
							strokeDashArray: 0,
							borderColor: '#00695C',
							label: {
								borderColor: '#00695C',
								style: {
									color: '#fff',
									background: '#00695C',
								},
								text: 'LEVEL 1',
							}
						},
						{
							y: 48514.36,
							strokeDashArray: 0,
							borderColor: '#00695C',
							label: {
								borderColor: '#00695C',
								style: {
									color: '#fff',
									background: '#00695C',
								}
							}
						},

						{
							y: 47788,
							strokeDashArray: 0,
							borderColor: '#00695C',
							label: {
								borderColor: '#00695C',
								style: {
									color: '#fff',
									background: '#00695C',
								},
								text: 'LEVEL 2',
							}
						},
						{
							y: 47432,
							strokeDashArray: 0,
							borderColor: '#00695C',
							label: {
								borderColor: '#00695C',
								style: {
									color: '#fff',
									background: '#00695C',
								}
							}
						},

						{
							y: 47001,
							strokeDashArray: 0,
							borderColor: '#00695C',
							label: {
								borderColor: '#00695C',
								style: {
									color: '#fff',
									background: '#00695C',
								},
								text: 'LEVEL 3',
							}
						},
						{
							y: 46570,
							strokeDashArray: 0,
							borderColor: '#00695C',
							label: {
								borderColor: '#00695C',
								style: {
									color: '#fff',
									background: '#00695C',
								}
							}
						},

						{
							y: 49500,
							strokeDashArray: 0,
							borderColor: '#00695C',
							label: {
								borderColor: '#00695C',
								style: {
									color: '#fff',
									background: '#00695C',
								},
								text: 'LEVEL 4',
							}
						},
						{
							y: 49100,
							strokeDashArray: 0,
							borderColor: '#00695C',
							label: {
								borderColor: '#00695C',
								style: {
									color: '#fff',
									background: '#00695C',
								}
							}
						},


						{
							y: 46000,
							strokeDashArray: 0,
							borderColor: '#00695C',
							label: {
								borderColor: '#00695C',
								style: {
									color: '#fff',
									background: '#00695C',
								},
								text: 'LEVEL 5',
							}
						},
						{
							y: 45471.66,
							strokeDashArray: 0,
							borderColor: '#00695C',
							label: {
								borderColor: '#00695C',
								style: {
									color: '#fff',
									background: '#00695C',
								}
							}
						},
					],
				},
				title: {
				  text: this.getApexTitle(),
				  align: "left"
				},
				xaxis: {
				  type: "datetime",
				  tooltip: {
					enabled: true
				  },
				},
				yaxis: {
				  tooltip: {
					enabled: true
				  },
				}
			};
		} catch (e) {
			console.log(e);
			this._snackbar.error(this._utils.getErrorMessage(e));
		}

		// Update loaded state
		this.loaded = true;
	}












	/**
	 * Given a list of raw candlesticks, it will convert them into Apex format.
	 * @param raw 
	 * @returns IApexCandlestick[]
	 */
	private getApexCandlesticks(raw: ICandlestick[]): IApexCandlestick[] {
		// Init the final list
		let final: IApexCandlestick[] = [];

		// Build the candlesticks
		raw.forEach((c) => {
			final.push({
				x: c.ot,
				y: [Number(c.o), Number(c.h), Number(c.l), Number(c.c)]
			});
		});


		// Return the final list
		return final;
	}






	/**
	 * Retrieves the title to be placed in the chart.
	 * @returns string
	 */
	private getApexTitle(): string {
		// Init values
		let title: string = '';

		if (this.rawCandlesticks.length) {
			title += `${moment(this.rawCandlesticks[0].ot).format(this._app.layout.value == 'mobile' ? 'DD-MM-YY': 'DD-MM-YY HH:mm:ss a')}`;
			title += ` / ${moment(this.rawCandlesticks[this.rawCandlesticks.length - 1].ot).format(this._app.layout.value == 'mobile' ? 'DD-MM-YY': 'DD-MM-YY HH:mm:ss a')}`;
		}

		// Return the final title
		return title;
	}













	/**
	 * Retrieves the default configuration values.
	 * @returns IForecastConfig
	 */
	private getDefaultConfig(): IForecastConfig {
		const currentTS: number = Date.now();
		return {
			symbol: this._cCurrency.mainSymbol,
			start: moment(currentTS).subtract(7, 'days').valueOf(),
			end: currentTS,
			intervalMinutes: 15
		}
	}
}
