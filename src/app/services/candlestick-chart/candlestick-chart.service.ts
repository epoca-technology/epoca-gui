import { Injectable } from '@angular/core';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import { AppService, ILayout } from '../app';
import { IApexCandlestick, ICandlestickChartService, ICandlestickChartOptions, ICandlestickChartConfig } from './interfaces';
import { ICandlestick, IKeyZone } from '../../core';
import * as moment from 'moment';
import { CandlestickChartConfigComponent } from '../../shared/components/candlestick-chart/candlestick-chart-config/candlestick-chart-config.component';
import { ApexAnnotations, XAxisAnnotations, YAxisAnnotations } from 'ng-apexcharts';



@Injectable({
  providedIn: 'root'
})
export class CandlestickChartService implements ICandlestickChartService {


	// Annotation Colors
	private readonly colors: string[] = [
		"#567bda","#9c39e7","#ccad2d","#d80c32","#601574","#235b2b","#4ec1ef","#0c0f5f","#a289bc",
		"#474747","#1045fa","#be55b6","#f4e80e","#c21e49","#7ffb2e","#6f18f2","#6a0b06","#000000",
		"#459a89","#e38c7a","#97985e","#16f342",
	];




    constructor(
        private _app: AppService,
        private dialog: MatDialog
    ) { }





    /* Chart Builder */





    /**
     * Given a list of candlesticks and annotation data, will retrieve the chart object
     * to be rendered.
     * @param candlesticks 
     * @param annotations? 
     * @returns ICandlestickChartOptions
     */
    public build(candlesticks: ICandlestick[], annotations?: ApexAnnotations): ICandlestickChartOptions {
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







	/* General Helpers */




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
				y: [c.o, c.h, c.l, c.c]
			});
		});


		// Return the final list
		return final;
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









	/* Annotation Helpers */



    /**
     * Retrieves the annotations for the current chart.
     * @returns any
     */
     private getAnnotations(data?: ApexAnnotations): any {
        return {
			xaxis: data?.xaxis || [],
			yaxis: data?.yaxis || []
		};
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
            ]
        }*/
    }






	/**
	 * Given a list of key zones, it will build the annotations.
	 * @param keyZones 
	 * @returns YAxisAnnotations[]
	 */
	public buildKeyZonesAnnotations(keyZones: IKeyZone[]): YAxisAnnotations[] {
		// Init values
		let annotations: YAxisAnnotations[] = [];

		// Build the annotations
		for (let i = 0; i < keyZones.length; i++) {
			// Add the start
			annotations.push({
				y: keyZones[i].start,
				strokeDashArray: 0,
				borderColor: this.colors[i],
				label: {
					borderColor: this.colors[i],
					style: { color: '#fff', background: this.colors[i]},
					text: this.getKeyZoneLabelText(keyZones[i]),
					position: 'right'
				}
			});

			// Add the end
			annotations.push({
				y: keyZones[i].end,
				strokeDashArray: 0,
				borderColor: this.colors[i],
				label: {
					borderColor: this.colors[i],
					style: { color: '#fff', background: this.colors[i]}
				}
			});
		}

		// Return the annotations
		return annotations;
	}








	/**
	 * Returns a label for a given zone.
	 * @param zone 
	 * @returns string
	 */
	private getKeyZoneLabelText(zone: IKeyZone): string {
		let label: string = '';
		label += `${zone.reversalType.toUpperCase()} (${zone.reversalCount}) | `;
		label += `${moment(zone.id).format('DD-MM-YY HH:mm')} | `;
		label += `Starts ${zone.start} Ends ${zone.end} `;
		return label;
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
			start: moment(currentTS).subtract(20, 'days').valueOf(),
			end: currentTS,
			intervalMinutes: 30,
			zoneSize: 1,
			reversalCountRequirement: 1
		}
	}
}
