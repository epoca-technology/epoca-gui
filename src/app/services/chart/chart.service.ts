import { Injectable } from '@angular/core';
import { AppService, ILayout } from '../app';
import { IApexCandlestick, IChartService, ICandlestickChartOptions, IChartRange } from './interfaces';
import { ICandlestick } from '../../core';
import * as moment from 'moment';
import { ApexAnnotations, XAxisAnnotations, YAxisAnnotations } from 'ng-apexcharts';
import {BigNumber} from "bignumber.js";
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import { CandlestickDialogComponent } from '../../shared/components/charts';




@Injectable({
  providedIn: 'root'
})
export class ChartService implements IChartService {


	// Colors
	public readonly colors: string[] = this.getColors();

	// Event Colors
	public readonly upwardColor: string = '#00695C';
	public readonly downwardColor: string = '#B71C1C';


  	constructor(
		private _app: AppService,
		private dialog: MatDialog,
	  ) { }













    /* Candlesticks */





    /**
     * Given a list of candlesticks and annotation data, will retrieve the chart object
     * to be rendered.
     * @param candlesticks 
     * @param annotations?
     * @param highlightCurrentPrice?
     * @returns ICandlestickChartOptions
     */
	 public build(candlesticks: ICandlestick[], annotations?: ApexAnnotations, highlightCurrentPrice?: boolean): ICandlestickChartOptions {
        // Make sure at least 5 candlesticks have been provided
        if (!candlesticks || candlesticks.length < 5) {
            throw new Error('A minimum of 5 candlesticks must be provided in order to render the chart.');
        }

		// Retrieve the range
		const range: IChartRange = this.getCandlestickChartRange(candlesticks);

		let self = this;

        // Return the chart
        return {
            series: [{name: "candle", data: this.getApexCandlesticks(candlesticks)}],
            chart: {
				type: "candlestick",
				toolbar: {show: true,tools: {selection: true,zoom: true,zoomin: true,zoomout: true,download: false}},
				animations: {enabled: false},
				events: {
					click: function(event, chartContext, config) {
						if (candlesticks[config.dataPointIndex]) self.displayCandlestickDialog(candlesticks[config.dataPointIndex]);
					}
				},
            },
			plotOptions: {candlestick: {colors: {upward: this.upwardColor,downward: this.downwardColor}}},
            annotations: this.getAnnotations(
				annotations, 
				highlightCurrentPrice === false ? undefined: candlesticks[candlesticks.length -1].c
			),
            title: {text: this.getTitle(candlesticks),align: "left"},
            xaxis: {type: "datetime",tooltip: {enabled: true}}, 
            yaxis: { tooltip: { enabled: true }, forceNiceScale: false, min: range.min, max: range.max}
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
		candlesticks.forEach((c) => { final.push({x: c.ot, y: [c.o, c.h, c.l, c.c]}) });

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
			title += `${moment(candlesticks[0].ot).format(l == 'mobile' ? 'DD/MM/YY': 'DD MMMM YYYY HH:mm')}`;
			title += ` - ${moment(candlesticks[candlesticks.length - 1].ot).format(l == 'mobile' ? 'DD/MM/YY': 'DD MMMM YYYY HH:mm')}`;
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
				borderColor: '',
				fillColor: '',
				label: {
					borderColor: '#000000',
					style: { color: '#fff', background: '#000000'},
					text: `$${new BigNumber(currentPrice).toFormat(2)}`,
					position: 'left',
					offsetX: 50
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
	/*public buildKeyZonesAnnotations(keyZones: IKeyZone[], currentPrice: number): YAxisAnnotations[] {
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
	}*/








	/**
	 * Returns a label for a given zone.
	 * @param zone 
	 * @returns string
	 */
	/*private getKeyZoneLabelText(zone: IKeyZone): string {
		if (this._app.layout.value == 'mobile') return ''; 
		let label: string = '';
		//label += `${zone.mutated ? 'm': ''}${zone.reversals[zone.reversals.length - 1].type.toUpperCase()} `;
		//label += `${moment(zone.id).format('DD-MM HH:mm')}  (${zone.reversals.length}) | `;
		//label += `Reversals ${zone.reversals.length} | `;
		label += `$${new BigNumber(zone.s).toFormat(2)} - $${new BigNumber(zone.e).toFormat(2)} `;
		return label;
	}*/
















    /* Misc Helpers */






	/*
	* Displays the candlestick dialog
	* @param candlestick
	* @returns MatDialogRef<any>
	* */
	public displayCandlestickDialog(candlestick: ICandlestick): MatDialogRef<any> {
		return this.dialog.open(CandlestickDialogComponent, {
			disableClose: false,
			hasBackdrop: this._app.layout.value != 'mobile', // Mobile optimization
			panelClass: 'small-dialog',
			data: candlestick
		});
	}






	private getColors(): string[] {
		return [
			"#227bb3","#b3228f","#b3228f","#b34b22","#6a22b3","#db56c5","#db566e","#5d784e","#784e4e","#4db2d1",
			"#363a78","#db4dd9","#4d462c","#5a9e68","#58aab0","#bb04c4","#2003ff","#e68302","#4aedb1","#7fa308",
			"#EF5350","#7E57C2","#29B6F6","#66BB6A","#EC407A","#FF7043","#78909C","#5C6BC0","#26C6DA","#0c5c02",
			"#9CCC65","#8D6E63","#AB47BC","#42A5F5","#26A69A","#D4E157","#FFA726","#F44336","#673AB7","#ff96ee",
			"#03A9F4","#4CAF50","#FF5722","#607D8B","#E91E63","#3F51B5","#00BCD4","#8BC34A","#795548","#4491BA",
			"#9C27B0","#2196F3","#009688","#CDDC39","#FF9800","#E53935","#5E35B1","#039BE5","#43A047","#1d3d6e",
			"#F4511E","#546E7A","#D81B60","#3949AB","#00ACC1","#7CB342","#6D4C41","#8E24AA","#1E88E5","#44def2",
			"#00897B","#C0CA33","#FB8C00","#D32F2F","#512DA8","#0288D1","#388E3C","#E64A19","#455A64","#ce5cf7",
			"#C2185B","#303F9F","#0097A7","#689F38","#5D4037","#7B1FA2","#1976D2","#00796B","#F57C00","#a3a2a6",
			"#708c7e","#3ee692","#80222a","#524a4b","#f54838","#4e396e","#02304d","#61e000","#61e000","#0a164d",
			"#542227","#223854","#544122","#225450","#432254","#57ed40","#ed7440","#08a3a1","#15ab6c","#ad7911",
			"#2e0707","#2e2607","#1c2e07","#072e20","#071b2e","#0c072e","#1e072e","#2e0720","#2e0713","#ff000d",
		].map(value => ({ value, sort: Math.random() }))
		.sort((a, b) => a.sort - b.sort)
		.map(({ value }) => value)
	}
}
