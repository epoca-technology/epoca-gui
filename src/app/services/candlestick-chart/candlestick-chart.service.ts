import { Injectable } from '@angular/core';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import { AppService, ILayout } from '../app';
import { IApexCandlestick, ICandlestickChartService, ICandlestickChartOptions, ICandlestickChartConfig } from './interfaces';
import { CryptocurrencyService, ICandlestick } from '../../core';
import * as moment from 'moment';
import { CandlestickChartConfigComponent } from '../../shared/components/candlestick-chart/candlestick-chart-config/candlestick-chart-config.component';



@Injectable({
  providedIn: 'root'
})
export class CandlestickChartService implements ICandlestickChartService {

    constructor(
        private _app: AppService,
        private dialog: MatDialog,
        private _cCurrency: CryptocurrencyService
    ) { }





    /* Chart Builder */





    /**
     * Given a list of candlesticks and annotation data, will retrieve the chart object
     * to be rendered.
     * @param candlesticks 
     * @param annotations? 
     * @returns ICandlestickChartOptions
     */
    public build(candlesticks: ICandlestick[], annotations?: any): ICandlestickChartOptions {
        // Make sure at least 5 candlesticks have been provided
        if (!candlesticks || candlesticks.length < 5) {
            throw new Error('A minimum of 5 candlesticks must be provided in order to render the chart.');
        }

        // Return the chart
        return {
            series: [
              {
                name: "candle",
                data: this.getApexCandlesticks(candlesticks)
              }
            ],
            chart: {
              type: "candlestick",
              toolbar: {
                show: true,
                tools: {
                    selection: true,
                    zoom: true,
                    zoomin: true,
                    zoomout: true,
                    download: false
                }
              },
              animations: {
                  enabled: false
              }
            },
            annotations: this.getAnnotations(annotations),
            title: {
              text: this.getTitle(candlesticks),
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
        }
    }











	/**
	 * Given a list of raw candlesticks, it will convert them into Apex format.
	 * @returns IApexCandlestick[]
	 */
     private getApexCandlesticks(candlesticks: ICandlestick[]): IApexCandlestick[] {
		// Init the final list
		let final: IApexCandlestick[] = [];

		// Build the candlesticks
		candlesticks.forEach((c) => {
			final.push({
				x: c.ot,
				y: [Number(c.o), Number(c.h), Number(c.l), Number(c.c)]
			});
		});


		// Return the final list
		return final;
	}











    /**
     * Retrieves the annotations for the current chart.
     * @returns any
     */
     private getAnnotations(data: any): any {
        return {};
        /*return {
            xaxis: [
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
                }
            ],
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
                }
            ]
        }*/
    }








	/**
	 * Retrieves the title to be placed in the chart.
	 * @returns string
	 */
     private getTitle(candlesticks: ICandlestick[]): string {
		// Init values
        const l: ILayout = this._app.layout.value;
		let title: string = '';

		if (candlesticks.length) {
			title += `From ${moment(candlesticks[0].ot).format(l == 'mobile' ? 'DD-MM': 'DD-MM-YY HH:mm')}`;
			title += ` to ${moment(candlesticks[candlesticks.length - 1].ot).format(l == 'mobile' ? 'DD-MM': 'DD-MM-YY HH:mm')}`;
		}

		// Return the final title
		return title;
	}













    /* Misc Helpers */




	
	/*
	* Opens the reCAPTCHA dialog.
	* @returns MatDialogRef<any>
	* */
	public displayChartConfigDialog(config: ICandlestickChartConfig): MatDialogRef<any> {
		return this.dialog.open(CandlestickChartConfigComponent, {
			disableClose: true,
			hasBackdrop: this._app.layout.value != 'mobile', // Mobile optimization
			panelClass: 'small-dialog',
            data: config
		});
	}









	/**
	 * Retrieves the default configuration values.
	 * @returns ICandlestickChartConfig
	 */
     public getDefaultConfig(): ICandlestickChartConfig {
		const currentTS: number = Date.now();
		return {
			symbol: this._cCurrency.mainSymbol,
			start: moment(currentTS).subtract(7, 'days').valueOf(),
			end: currentTS,
			intervalMinutes: 30
		}
	}
}
