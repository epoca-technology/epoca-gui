import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { ApexAxisChartSeries } from 'ng-apexcharts';
import * as moment from 'moment';
import { Subscription } from 'rxjs';
import {MatDialog} from '@angular/material/dialog';
import { IBacktestPosition, IModel, PredictionBacktestingService, PredictionService, UtilsService } from '../../../core';
import { 
	AppService, 
	ChartService, 
	ClipboardService, 
	IBarChartOptions, 
	ILayout, 
	ILineChartOptions, 
	NavService, 
	SnackbarService,
} from '../../../services';
import { BacktestPositionDialogComponent } from './backtest-position-dialog';
import { IModelCharts, IPredictionBacktestingComponent, ISection } from './interfaces';

@Component({
  selector: 'app-prediction-backtesting',
  templateUrl: './prediction-backtesting.component.html',
  styleUrls: ['./prediction-backtesting.component.scss']
})
export class PredictionBacktestingComponent implements OnInit, OnDestroy, IPredictionBacktestingComponent {
    // Sidenav Element
	@ViewChild('predBacktestingSidenav') predBacktestingSidenav: MatSidenav|undefined;
	public predBacktestingSidenavOpened: boolean = false;

	// Layout
	public layout: ILayout = this._app.layout.value;
	private layoutSub?: Subscription;

	// Backtest Initialization
	public initialized: boolean = false;
	public initializing: boolean = false;

	// Sections
	public readonly generalSections: ISection[] = [
		{id: 'points', name: 'Points', icon: 'query_stats'},
		{id: 'accuracy', name: 'Accuracy', icon: 'ads_click'},
		{id: 'positions', name: 'Positions', icon: 'format_list_numbered'},
		{id: 'duration', name: 'Backtest Duration', icon: 'timer' },
	]
	public modelID?: string = undefined;
	public section: ISection = this.generalSections[0];
	public activeIndex: number = 0;
	public loaded: boolean = false;

	// General Charts
	public generalChartHeight: number = 600;
	public pointsDistChart?: IBarChartOptions;
	public pointsLineChart?: ILineChartOptions;
	public accuracyChart?: IBarChartOptions;
	public positionsChart?: IBarChartOptions;
	public durationChart?: IBarChartOptions;

	// Model Charts
	public modelCharts: {[modelID: string]: IModelCharts} = {};

	// Positions
	public visiblePositions: number = 15;


	constructor(
		public _nav: NavService,
		private _snackbar: SnackbarService,
		private _clipboard: ClipboardService,
		private _app: AppService,
		private _chart: ChartService,
		private _utils: UtilsService,
		public _backtesting: PredictionBacktestingService,
		private _prediction: PredictionService,
		private dialog: MatDialog,
	) { }




	ngOnInit(): void {
		// Initialize layout
		this.layoutSub = this._app.layout.subscribe((nl: ILayout) => this.layout = nl);
	}

	ngOnDestroy(): void {
		if (this.layoutSub) this.layoutSub.unsubscribe();
		this._backtesting.resetBacktestResults();
	}





	/* Initialization */




	/**
	 * Whenever there is a file change, it will attempt to initialize the Backtest.
	 * @param event 
	 * @returns Promise<void>
	 */
	public async fileChanged(event: any): Promise<void> {
		// Set the state
		this.initializing = true;

		// Allow a small delay before moving on
		await this._utils.asyncDelay(0.5);

		// Attempt to initiaze the backtests
		try {
			// Pass the files to the service
			await this._backtesting.init(event);

			// Calculate the height of the general charts
			this.generalChartHeight = this.getGeneralChartsHeight()

			// Activate default section
			await this.activateSection(this.generalSections[0]);

			// Mark the backtest as initialized
			this.initialized = true;
		} catch (e) {
			this._snackbar.error(e)
		}

		// Update initializing state
		this.initializing = false;
	}






	/**
	 * Resets the results and navigates to the file input section.
	 * @returns void
	 */
	 public resetResults(): void {
		this.resetComponent();
		this._backtesting.resetBacktestResults();
	}





	/**
	 * Resets all the properties within the component.
	 * @returns void
	 */
	private resetComponent(): void {
		this.initialized = false;
		this.initializing = false;
		this.modelID = undefined;
		this.section = this.generalSections[0];
		this.activeIndex = 0;
		this.loaded = false;
		this.pointsDistChart = undefined;
		this.pointsLineChart = undefined;
		this.accuracyChart = undefined;
		this.positionsChart = undefined;
		this.durationChart = undefined;
		this.modelCharts = {};
		this.visiblePositions = 15;
	}








	/* Navigation */




    /**
     * Activates a given section and prepares all the data needed.
	 * @param section
	 * @param modelID?
     * @returns Promise<void>
     */
	 public async activateSection(section: ISection, modelID?: string): Promise<void> {
        // Hide the sidenavs if any
		if (this.predBacktestingSidenav && this.predBacktestingSidenavOpened) this.predBacktestingSidenav.close();

		// Set loading state
		this.loaded = false;

		// Set the section values
		this.section = section;
		this.modelID = modelID;

		// Initialize the data needed for the active section in case it hasn't been
		this.initDataForActiveSection();

		// If the view is a model, reset the visible positions
		if (this.section.id == 'model') this.visiblePositions = 15;

		// Allow a small delay
		await this._utils.asyncDelay(0.5);

		// Set loading state
		this.loaded = true;
    }









	/* Section Initialization */



	/**
	 * Initializes the data for a given section in case
	 * it hasn't been. Does nothing otherwise.
	 * @returns void
	 */
	private initDataForActiveSection(): void {
		// Points
		if (this.section.id == 'points' && (!this.pointsDistChart || !this.pointsLineChart)) { this.initPointsSection() }

		// Accuracy
		else if (this.section.id == 'accuracy' && !this.accuracyChart) { this.initAccuracySection() }

		// Positions
		else if (this.section.id == 'positions' && !this.positionsChart) { this.initPositionsSection() }

		// Duration
		else if (this.section.id == 'duration' && !this.durationChart) { this.initDurationSection() }

		// Model
		else if (this.section.id == 'model' && this.modelID && !this.modelCharts[this.modelID]) { this.initModelCharts() }
	}






	// Initializes the points section.
	private initPointsSection(): void {
		// Init the chart data
		let dist: ApexAxisChartSeries = [{
			name: 'Points Accumulated',
			data: []
		}];
		let lines: ApexAxisChartSeries = [];

		// Iterate over each model building the data
		for (let i = 0; i < this._backtesting.modelIDs.length; i++) {
			// Add the distribution
			dist[0].data.push(<any>this._backtesting.performances[this._backtesting.modelIDs[i]].points);

			// Add the lines
			lines.push({
				name: this._backtesting.modelIDs[i], 
				data: this._backtesting.performances[this._backtesting.modelIDs[i]].points_hist, 
				color: this._chart.colors[i]
			})
		}

		// Create a copy of the instance to handle chart click events
		const self = this;

		// Build the dist chart options
		this.pointsDistChart = this._chart.getBarChartOptions({series: dist}, this._backtesting.modelIDs, this.generalChartHeight, true);
		this.pointsDistChart.chart.events = {click: function(e, cc, c) {self.displayModel(c.dataPointIndex)}}

		// Populate the line chart values
		this.pointsLineChart = this._chart.getLineChartOptions({series: lines}, this.generalChartHeight, true);
		this.pointsLineChart.chart.events = {click: function(e: any, cc: any, c: any) {self.displayModel(c.seriesIndex)}}
	}




	// Initializes the general accuracy section.
	private initAccuracySection(): void {
		// Init the chart data
		let series: ApexAxisChartSeries = [{name:'Long Accuracy',data:[]},{name:'Short Accuracy',data:[]},{name:'General Accuracy',data:[]}];

		// Iterate over each model building the data
		for (let id of this._backtesting.modelIDs) {
			// Add the distribution
			series[0].data.push(<any>this._backtesting.performances[id].long_acc);
			series[1].data.push(<any>this._backtesting.performances[id].short_acc);
			series[2].data.push(<any>this._backtesting.performances[id].general_acc);
		}

		// Build the chart options
		const self = this;
		this.accuracyChart = this._chart.getBarChartOptions(
			{series: series, colors: [this._chart.upwardColor, this._chart.downwardColor, '#000000']}, 
			this._backtesting.modelIDs, this.generalChartHeight
		);
		this.accuracyChart.chart.events = {click: function(e, cc, c) {self.displayModel(c.dataPointIndex)}}
	}



	// Initializes the general positions section
	private initPositionsSection(): void {
		// Init the chart data
		let series: ApexAxisChartSeries = [{name:'Longs',data:[]},{name:'Shorts',data:[]},{name:'Total',data:[]}];

		// Iterate over each model building the data
		for (let id of this._backtesting.modelIDs) {
			// Add the distribution
			series[0].data.push(<any>this._backtesting.performances[id].long_num);
			series[1].data.push(<any>this._backtesting.performances[id].short_num);
			series[2].data.push(<any>this._backtesting.performances[id].positions.length);
		}

		// Build the chart options
		const self = this;
		this.positionsChart = this._chart.getBarChartOptions(
			{series: series, colors: [this._chart.upwardColor, this._chart.downwardColor, '#000000']}, 
			this._backtesting.modelIDs, this.generalChartHeight
		);
		this.positionsChart.chart.events = {click: function(e, cc, c) {self.displayModel(c.dataPointIndex)}}
	}



	// Initializes the general durations section
	private initDurationSection(): void {
		// Init the chart data
		let series: ApexAxisChartSeries = [{name: 'Minutes', data: []}];

		// Iterate over each model building the data
		for (let id of this._backtesting.modelIDs) {series[0].data.push(<any>this._backtesting.backtests[id].model_duration)}

		// Build the chart options
		const self = this;
		this.durationChart = this._chart.getBarChartOptions({series: series}, this._backtesting.modelIDs, this.generalChartHeight, true);
		this.durationChart.chart.events = {click: function(e, cc, c) {self.displayModel(c.dataPointIndex)}}
	}




	// Initializes the charts for a model
	private initModelCharts(): void {
		this.modelCharts[this.modelID!] = {
			points: this._chart.getLineChartOptions({
				series: [{
					name: this.modelID, 
					data: this._backtesting.performances[this.modelID!].points_hist, 
					color: '#000000'
				}]
			}, 250, true),
			accuracy: this._chart.getBarChartOptions({
				series: [
					{name:'Long Accuracy',data:[this._backtesting.performances[this.modelID!].long_acc]},
					{name:'Short Accuracy',data:[this._backtesting.performances[this.modelID!].short_acc]},
					{name:'General Accuracy',data:[this._backtesting.performances[this.modelID!].general_acc]}
				],
				colors: [this._chart.upwardColor, this._chart.downwardColor, '#000000'],
				yaxis: {labels: {show: false}}
			}, [this.modelID!], 130),
			positions: this._chart.getBarChartOptions({
				series: [
					{name:'Longs',data:[this._backtesting.performances[this.modelID!].long_num]},
					{name:'Shorts',data:[this._backtesting.performances[this.modelID!].short_num]},
					{name:'Total',data:[this._backtesting.performances[this.modelID!].positions.length]}
				],
				colors: [this._chart.upwardColor, this._chart.downwardColor, '#000000'],
				yaxis: {labels: {show: false}}
			}, [this.modelID!], 130)
		}
	}









	


	/* Dialogs */



	/**
	 * Displays the Model's dialog. Accepts an ID or the index of 
	 * the model.
	 * @param id 
	 * @returns void
	 */
	public displayModel(id: string|number): void {
		// If the Model's index was provided instead of the id, populate it.
		if (typeof id == "number" && id >= 0) id = this._backtesting.modelIDs[id]; 

		// Init the model
		const model: IModel = this._backtesting.models[id];

		// Display the dialog if the model was found
		if (model) this._nav.displayModelDialog(model);
	}







	/**
	 * Opens the backtest position dialog.
	 * @param position 
	 * @returns void
	 */
	public displayPosition(position: IBacktestPosition): void {
		this.dialog.open(BacktestPositionDialogComponent, {
			hasBackdrop: this._app.layout.value != 'mobile', // Mobile optimization
			panelClass: 'small-dialog',
            data: {
				model: this._backtesting.models[this.modelID!],
				position: position
			}
		})
	}







	

	/* Backtest Summary Text */





	/**
	 * Builds the backtest receipt in a string format and
	 * copies it to the clipboard.
	 * @returns void
	 */
	public copyBacktestSummary(): void {
		// Initialize the model
		const model: IModel = this._backtesting.models[this.modelID!];
		// Initialize the string
		let sum: string = '====================\n';

		// Add the basic information
		sum += `MODEL:\n`;
		sum += `ID: ${model.id}\n`;
		sum += `Type: ${this._prediction.getModelTypeName(model.single_models.length)}\n`;
		if (model.consensus) sum += `Consensus: ${model.consensus}\n`;
		sum += '\n'

		// DATE RANGE
		sum += `DATE RANGE:\n`;
		sum += `${moment(this._backtesting.backtests[model.id].start).format('DD MMMM YYYY HH:mm')}\n`;
		sum += `${moment(this._backtesting.backtests[model.id].end).format('DD MMMM YYYY HH:mm')}\n\n`;

		// POSITION EXITS
		sum += `POSITION EXITS:\n`;
		sum += `Take Profit: ${this._backtesting.backtests[model.id].take_profit}%\n`;
		sum += `Stop Loss: ${this._backtesting.backtests[model.id].stop_loss}%\n\n`;

		// PERFORMANCE
		sum += `PERFORMANCE:\n`;
		sum += `Points: ${this._backtesting.performances[model.id].points}\n`;
		sum += `Accuracy:\n`;
		sum += `- General: ${this._backtesting.performances[model.id].general_acc}%\n`;
		sum += `- Long: ${this._backtesting.performances[model.id].long_acc}%\n`;
		sum += `- Short: ${this._backtesting.performances[model.id].short_acc}%\n`;
		sum += `Positions:\n`;
		sum += `- Total: ${this._backtesting.performances[model.id].positions.length}\n`;
		sum += `- Long: ${this._backtesting.performances[model.id].long_num}\n`;
		sum += `- Short: ${this._backtesting.performances[model.id].short_num}\n`;

		// SINGLE MODELS
		if (model.single_models.length) {
			sum += `\nSINGLE MODELS (${model.single_models.length}):`;
			for (let sm of model.single_models) {
				sum += `\n\nLookback: ${sm.lookback}\n`;
				sum += `Arima: (${sm.arima.p}, ${sm.arima.d}, ${sm.arima.q})`;
				sum += `(${sm.arima.P}, ${sm.arima.D}, ${sm.arima.Q}, ${sm.arima.m})`;
				sum += ` -> [${sm.arima.predictions}]\n`;
				sum += `Interpreter:\n`;
				sum += `- Long: ${sm.interpreter.long}%\n`;
				sum += `- Short: ${sm.interpreter.short}%\n`;
				if (sm.interpreter.rsi.active)sum += `- RSI: (${sm.interpreter.rsi.overbought}, ${sm.interpreter.rsi.oversold})\n`;
				if (sm.interpreter.ema.active)sum += `- EMA: (${sm.interpreter.ema.distance}%)\n`;
			}
		}
		


		// Add the tail of the string
		sum += '====================';

		// Copy the contents to the clipboard
		this._clipboard.copy(sum, false);

		// Notify the user
		this._snackbar.info('The Backtest Summary has been copied to your clipboard.');
	}









	/* Misc Helpers */






	/**
	 * Based on the total number of models, it determines the best height
	 * for the general charts.
	 * @returns number
	 */
	private getGeneralChartsHeight(): number {
		if (this._backtesting.modelIDs.length <= 2) 		{ return 300 }
		if (this._backtesting.modelIDs.length <= 3) 		{ return 350 }
		if (this._backtesting.modelIDs.length <= 4) 		{ return 370 }
		else if (this._backtesting.modelIDs.length <= 5) 	{ return 390 }
		else if (this._backtesting.modelIDs.length <= 6) 	{ return 410 }
		else if (this._backtesting.modelIDs.length <= 7) 	{ return 430 }
		else if (this._backtesting.modelIDs.length <= 8) 	{ return 450 }
		else if (this._backtesting.modelIDs.length <= 10) 	{ return 600 }
		else if (this._backtesting.modelIDs.length <= 12) 	{ return 630 }
		else if (this._backtesting.modelIDs.length <= 15) 	{ return 660 }
		else if (this._backtesting.modelIDs.length <= 17) 	{ return 700 }
		else if (this._backtesting.modelIDs.length <= 20) 	{ return 730 }
		else if (this._backtesting.modelIDs.length <= 25) 	{ return 770 }
		else if (this._backtesting.modelIDs.length <= 30) 	{ return 800 }
		else if (this._backtesting.modelIDs.length <= 35) 	{ return 850 }
		else if (this._backtesting.modelIDs.length <= 40) 	{ return 900 }
		else { return 1000}
	}
}
