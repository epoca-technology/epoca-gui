import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { ICandlestick, UtilsService } from '../../../../core';
import { ICandlestickChartComponent } from './interfaces';
import { SnackbarService, ICandlestickChartOptions, ChartService } from '../../../../services';
import {ApexAnnotations, ChartComponent} from "ng-apexcharts";



@Component({
  selector: 'app-candlestick-chart',
  templateUrl: './candlestick-chart.component.html',
  styleUrls: ['./candlestick-chart.component.scss']
})
export class CandlestickChartComponent implements OnInit, ICandlestickChartComponent {
    @ViewChild("chart") chart?: ChartComponent;
	public chartOptions?: Partial<ICandlestickChartOptions>;



    // Data Input
    private rawCandlesticks!: ICandlestick[];
    private annotations?: any;
    private highlightCurrentPrice!: boolean;
    @Input() 
    set data(data: {candlesticks: ICandlestick[], annotations?: ApexAnnotations, highlightCurrentPrice?: boolean}) {
        // Store the raw candlesticks locally
        this.rawCandlesticks = data.candlesticks;

        // Store annotations if any
        this.annotations = data.annotations;

        // Current Price Highlight
        this.highlightCurrentPrice = data.highlightCurrentPrice !== false;
        
        // Initialize the chart
        this.init();
    }




    // Initialization
    public initialized: boolean = false;
    
    constructor(
        private _snackbar: SnackbarService,
        private _utils: UtilsService,
        private _chart: ChartService
    ) { }

    ngOnInit(): void {
    }







    private init(): void {
        try {
			// Set init state
			this.initialized = false;

            // Make sure at least 5 candlesticks have been provided
            if (!this.rawCandlesticks || this.rawCandlesticks.length < 5) {
                throw new Error('A minimum of 5 candlesticks must be provided in order to render the chart.');
            }

            // Build the chart
            this.chartOptions = this._chart.build(this.rawCandlesticks, this.annotations, this.highlightCurrentPrice);

            // Set init state
			this.initialized = true;
        } catch (e) {
            console.log(e);
            this._snackbar.error(this._utils.getErrorMessage(e));
        }
    }
}
