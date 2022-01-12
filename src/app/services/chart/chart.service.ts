import { Injectable } from '@angular/core';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import { AppService, ILayout } from '../app';
import { IApexCandlestick, IChartService, ICandlestickChartOptions, ICandlestickChartConfig, IChartRange, ICandlestickChartPartialConfig } from './interfaces';
import { ICandlestick, IKeyZone } from '../../core';
import * as moment from 'moment';
import { CandlestickChartConfigComponent } from '../../shared/components/charts';
import { ApexAnnotations, XAxisAnnotations, YAxisAnnotations } from 'ng-apexcharts';
import {BigNumber} from "bignumber.js";



@Injectable({
  providedIn: 'root'
})
export class ChartService implements IChartService {


	// Annotation Colors
	private readonly colors: string[] = [
		"#B71C1C","#2E7D32","#212121","#3E2723","#BF360C","#E65100","#827717","#33691E","#1B5E20",
		"#004D40","#006064","#01579B","#0D47A1","#1A237E","#311B92","#4A148C","#880E4F","#000000",
		"#37474F","#424242","#4E342E","#D84315","#EF6C00","#9E9D24","#558B2F","#263238","#00695C",
		"#00838F","#0277BD","#1565C0","#283593","#4527A0","#6A1B9A","#AD1457","#C62828","#455A64",
		"#072227","#781C68","#876445","#676FA3","#146356","#EA5C2B","#370665","#FF1700","#406882",
		"#191919","#3E8E7E","#C84B31","#F2789F","#9145B6","#516BEB","#344CB7","#7267CB","#0B4619",
	];

	// Price Level Color
	private readonly priceLevelColor: string = '#304FFE';


  	constructor(
		private _app: AppService,
        private dialog: MatDialog
	  ) { }













    /* Candlesticks */





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

		// Retrieve the range
		const range: IChartRange = this.getCandlestickChartRange(candlesticks);

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
              },
            },
            annotations: this.getAnnotations(annotations, candlesticks[candlesticks.length -1].c),
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
				forceNiceScale: true,
				min: range.min,
				max: range.max,
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








	/**
	 * Given a list of candlesticks, it will retrieve the highest and the lowest
	 * values.
	 * @param candlesticks 
	 * @returns IChartRange
	 */
	private getCandlestickChartRange(candlesticks: ICandlestick[]): IChartRange {
		// Init lists
		let high: number[] = [];
		let low: number[] = [];

		// Iterate over each candlestick populating the lists
		candlesticks.forEach((c) => {
			high.push(c.h);
			low.push(c.l);
		});

		// Return the range
		return {
			max: BigNumber.max.apply(null, high).toNumber(),
			min: BigNumber.min.apply(null, low).toNumber()
		}
	}












	/* Annotation Helpers */



    /**
     * Retrieves the annotations for the current chart.
	 * @param data?
	 * @param currentPrice?
     * @returns any
     */
     private getAnnotations(data?: ApexAnnotations, currentPrice?: number): ApexAnnotations {
		 // Init the annotations
		 let annotations: ApexAnnotations = {
			xaxis: data?.xaxis || [],
			yaxis: data?.yaxis || []
		 }

		 // Check if the current price was provided
		 if (currentPrice) {
			annotations.yaxis?.push({
				y: currentPrice,
				strokeDashArray: 0,
				borderColor: this.priceLevelColor,
				fillColor: this.priceLevelColor,
				label: {
					borderColor: this.priceLevelColor,
					style: { color: '#fff', background: this.priceLevelColor},
					text: `$${new BigNumber(currentPrice).toFormat(2)}`,
					position: 'left',
					offsetX: 120
				}
			});
		 }

		 // Return the final annotations
		 return annotations;
		 
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
	 * @param currentPrice 
	 * @returns YAxisAnnotations[]
	 */
	public buildKeyZonesAnnotations(keyZones: IKeyZone[], currentPrice: number): YAxisAnnotations[] {
		// Init values
		let annotations: YAxisAnnotations[] = [];

		// Build the annotations
		for (let i = 0; i < keyZones.length; i++) {
			annotations.push({
				y: keyZones[i].s,
				y2: keyZones[i].e,
				strokeDashArray: 0,
				borderColor: this.colors[i],
				fillColor: this.colors[i],
				label: {
					borderColor: this.colors[i],
					style: { color: '#fff', background: this.colors[i],},
					text: this.getKeyZoneLabelText(keyZones[i]),
					position: 'left',
					offsetX: 50
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
		//label += `${zone.mutated ? 'm': ''}${zone.reversals[zone.reversals.length - 1].type.toUpperCase()} `;
		//label += `${moment(zone.id).format('DD-MM HH:mm')}  (${zone.reversals.length}) | `;
		//label += `Reversals ${zone.reversals.length} | `;
		label += `$${new BigNumber(zone.s).toFormat(2)} - $${new BigNumber(zone.e).toFormat(2)} `;
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
     public getDefaultConfig(config?: ICandlestickChartPartialConfig): ICandlestickChartConfig {
		const currentTS: number = Date.now();
		return {
			start: config?.start || moment(currentTS).subtract(365, 'days').valueOf(),
			end: config?.end || currentTS,
			intervalMinutes: config?.intervalMinutes || 720,
			zoneSize: config?.zoneSize || 0.7,
			zoneMergeDistanceLimit: config?.zoneMergeDistanceLimit || 1.5,
			priceActionCandlesticksRequirement: config?.priceActionCandlesticksRequirement || 30,
		}
	}
}
