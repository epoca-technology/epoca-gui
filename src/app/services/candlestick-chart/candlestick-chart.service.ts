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
		"#B71C1C","#2E7D32","#212121","#3E2723","#BF360C","#E65100","#827717","#33691E","#1B5E20",
		"#004D40","#006064","#01579B","#0D47A1","#1A237E","#311B92","#4A148C","#880E4F","#000000",
		"#37474F","#424242","#4E342E","#D84315","#EF6C00","#9E9D24","#558B2F","#263238","#00695C",
		"#00838F","#0277BD","#1565C0","#283593","#4527A0","#6A1B9A","#AD1457","#C62828","#455A64",
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
					style: { color: '#fff', background: this.colors[i]}
				}
			});

			// Add the end
			annotations.push({
				y: keyZones[i].end,
				strokeDashArray: 0,
				borderColor: this.colors[i],
				label: {
					borderColor: this.colors[i],
					style: { color: '#fff', background: this.colors[i]},
					text: this.getKeyZoneLabelText(keyZones[i]),
					position: 'right'
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
		if (this._app.layout.value == 'mobile') return ''; 
		let label: string = '';
		label += `${zone.mutated ? 'm': ''}${zone.reversals[zone.reversals.length - 1].type.toUpperCase()} `;
		label += `${moment(zone.id).format('DD-MM HH:mm')} | `;
		label += `Reversals ${zone.reversals.length} | `;
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
			start: moment(currentTS).subtract(30, 'days').valueOf(),
			end: currentTS,
			intervalMinutes: 300,
			zoneSize: 0.5,
			zoneMergeDistanceLimit: 1.5,
			reversalCountRequirement: 1
		}
	}
}
