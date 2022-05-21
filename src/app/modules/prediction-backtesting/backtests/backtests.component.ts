import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormControl, FormGroup } from '@angular/forms';
import { MatSidenav } from '@angular/material/sidenav';
import { ApexAxisChartSeries } from 'ng-apexcharts';
import * as moment from 'moment';
import { Subscription } from 'rxjs';
import {MatDialog} from '@angular/material/dialog';
import { IBacktestPosition, IModel, BacktestService, PredictionService, UtilsService } from '../../../core';
import { 
	AppService, 
	ChartService, 
	ClipboardService, 
	IBarChartOptions, 
	IChartRange, 
	ILayout, 
	ILineChartOptions, 
	NavService, 
	SnackbarService,
} from '../../../services';
import { BacktestPositionDialogComponent } from './backtest-position-dialog';
import { IModelCharts, IBacktestsComponent, ISection } from './interfaces';

@Component({
  selector: 'app-backtests',
  templateUrl: './backtests.component.html',
  styleUrls: ['./backtests.component.scss']
})
export class BacktestsComponent implements OnInit, OnDestroy, IBacktestsComponent{
	// Sidenav Element
	@ViewChild('predBacktestingSidenav') predBacktestingSidenav: MatSidenav|undefined;
	public predBacktestingSidenavOpened: boolean = false;

	// Layout
	public layout: ILayout = this._app.layout.value;
	private layoutSub?: Subscription;

	// File Input Form
    public fileInputForm: FormGroup = new FormGroup({
        fileInput: new FormControl('', [ ]),
    });

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

	/* General Charts */

	// Height
	public generalChartHeight: number = 600;

	// Badges views
	public viewBest: boolean = true;
	
	// Points
	public pointsDistChart?: IBarChartOptions;
	public pointsLineChart?: ILineChartOptions;

	// Accuracy
	public accuracyChart?: IBarChartOptions;

	// Positions
	public positionsChart?: IBarChartOptions;

	// Duration
	public durationChart?: IBarChartOptions;

	// Model Charts
	public modelCharts: {[modelID: string]: IModelCharts} = {};
	public modelPointsRange: {[modelID: string]: IChartRange} = {};

	// Positions
	public visiblePositions: number = 15;


	constructor(
		public _nav: NavService,
		private _snackbar: SnackbarService,
		private _clipboard: ClipboardService,
		private _app: AppService,
		private _chart: ChartService,
		private _utils: UtilsService,
		public _backtest: BacktestService,
		private _prediction: PredictionService,
		private dialog: MatDialog,
	) { }




	ngOnInit(): void {
		// Initialize layout
		this.layoutSub = this._app.layout.subscribe((nl: ILayout) => this.layout = nl);
	}

	ngOnDestroy(): void {
		if (this.layoutSub) this.layoutSub.unsubscribe();
		this._backtest.resetBacktestResults();
	}



    /* Form Getters */
	get fileInput(): AbstractControl { return <AbstractControl>this.fileInputForm.get('fileInput') }






	/* Initialization */




	/**
	 * Whenever there is a file change, it will attempt to initialize the Backtest.
	 * @param event 
	 * @returns Promise<void>
	 */
	public async fileChanged(event: any): Promise<void> {
		// Set the state
		this.initializing = true;

		// Abort the bottom sheet if there are no files
		if (!event || !event.target || !event.target.files || !event.target.files.length) return;

		// Display the bottom sheet and handle the action
		this._nav.displayDialogMenu('Backtested Models', [
			{icon: 'format_list_numbered', title: 'View all', response: 10000},
			{icon: 'leaderboard', title: 'View top 5', response: 5},
			{icon: 'leaderboard', title: 'View top 10', response: 10},
			{icon: 'leaderboard', title: 'View top 20', response: 20},
			{icon: 'leaderboard', title: 'View top 40', response: 40},
			{icon: 'leaderboard', title: 'View top 60', response: 60},
			{icon: 'leaderboard', title: 'View top 100', response: 100},
			{icon: 'leaderboard', title: 'View top 150', response: 150},
			{icon: 'leaderboard', title: 'View top 200', response: 200},
		]).afterClosed().subscribe(async (response: any) => {
			if (typeof response == "number") {
				// Attempt to initiaze the backtests
				try {
					// Pass the files to the service
					await this._backtest.init(event, response);

					// Calculate the height of the general charts
					this.generalChartHeight = this.getGeneralChartsHeight()

					// Activate default section
					await this.activateSection(this.generalSections[0]);

					// Mark the backtest as initialized
					this.initialized = true;
				} catch (e) {
					this._snackbar.error(e)
				}
			} else {
				console.log(response)
			}

			// Update initializing state
			this.initializing = false;
			this.fileInput.setValue(null);
		});
	}






	/**
	 * Resets the results and navigates to the file input section.
	 * @returns void
	 */
	public resetResults(): void {
		this.resetComponent();
		this._backtest.resetBacktestResults();
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
		this.viewBest = true;
		this.pointsDistChart = undefined;
		this.pointsLineChart = undefined;
		this.accuracyChart = undefined;
		this.positionsChart = undefined;
		this.durationChart = undefined;
		this.modelCharts = {};
		this.modelPointsRange = {};
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

		// Scroll top
		this._nav.scrollTop('#content-header')

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
		for (let i = 0; i < this._backtest.modelIDs.length; i++) {
			// Add the distribution
			dist[0].data.push(<any>this._backtest.performances[this._backtest.modelIDs[i]].points);

			// Add the lines
			lines.push({
				name: this._backtest.modelIDs[i], 
				data: this._backtest.performances[this._backtest.modelIDs[i]].points_hist, 
				color: this._chart.colors[i]
			})
		}

		// Create a copy of the instance to handle chart click events
		const self = this;

		// Build the dist chart options
		this.pointsDistChart = this._chart.getBarChartOptions({series: dist}, this._backtest.modelIDs, this.generalChartHeight, true);
		this.pointsDistChart.chart.events = {click: function(e, cc, c) {self.displayModel(c.dataPointIndex)}}

		// Populate the line chart values
		this.pointsLineChart = this._chart.getLineChartOptions({series: lines}, this.generalChartHeight, true, {
			max: this._backtest.pointsHistoryMD.max.value,
			min: this._backtest.pointsHistoryMD.min.value,
		});
		this.pointsLineChart.chart.events = {click: function(e: any, cc: any, c: any) {self.displayModel(c.seriesIndex)}}
	}




	// Initializes the general accuracy section.
	private initAccuracySection(): void {
		// Init the chart data
		let series: ApexAxisChartSeries = [{name:'Long Accuracy',data:[]},{name:'Short Accuracy',data:[]},{name:'General Accuracy',data:[]}];

		// Iterate over each model building the data
		for (let id of this._backtest.modelIDs) {
			// Add the distribution
			series[0].data.push(<any>this._backtest.performances[id].long_acc);
			series[1].data.push(<any>this._backtest.performances[id].short_acc);
			series[2].data.push(<any>this._backtest.performances[id].general_acc);
		}

		// Build the chart options
		const self = this;
		this.accuracyChart = this._chart.getBarChartOptions(
			{series: series, colors: [this._chart.upwardColor, this._chart.downwardColor, '#000000']}, 
			this._backtest.modelIDs, this.generalChartHeight
		);
		this.accuracyChart.chart.events = {click: function(e, cc, c) {self.displayModel(c.dataPointIndex)}}
	}



	// Initializes the general positions section
	private initPositionsSection(): void {
		// Init the chart data
		let series: ApexAxisChartSeries = [{name:'Longs',data:[]},{name:'Shorts',data:[]},{name:'Total',data:[]}];

		// Iterate over each model building the data
		for (let id of this._backtest.modelIDs) {
			// Add the distribution
			series[0].data.push(<any>this._backtest.performances[id].long_num);
			series[1].data.push(<any>this._backtest.performances[id].short_num);
			series[2].data.push(<any>this._backtest.performances[id].positions.length);
		}

		// Build the chart options
		const self = this;
		this.positionsChart = this._chart.getBarChartOptions(
			{series: series, colors: [this._chart.upwardColor, this._chart.downwardColor, '#000000']}, 
			this._backtest.modelIDs, this.generalChartHeight
		);
		this.positionsChart.chart.events = {click: function(e, cc, c) {self.displayModel(c.dataPointIndex)}}
	}



	// Initializes the general durations section
	private initDurationSection(): void {
		// Init the chart data
		let series: ApexAxisChartSeries = [{name: 'Minutes', data: []}];

		// Iterate over each model building the data
		for (let id of this._backtest.modelIDs) {series[0].data.push(<any>this._backtest.backtests[id].model_duration)}

		// Build the chart options
		const self = this;
		this.durationChart = this._chart.getBarChartOptions({series: series}, this._backtest.modelIDs, this.generalChartHeight, true);
		this.durationChart.chart.events = {click: function(e, cc, c) {self.displayModel(c.dataPointIndex)}}
	}




	// Initializes the charts for a model
	private initModelCharts(): void {
		// Build the meta data
		this.modelPointsRange[this.modelID!] = { 
			max: this._utils.getMax(this._backtest.performances[this.modelID!].points_hist),
			min: this._utils.getMin(this._backtest.performances[this.modelID!].points_hist)
		}

		// Retrieve the points charts data
		const {colors, values} = this.getModelPointsValues(this.modelID!)

		// Build the chart
		this.modelCharts[this.modelID!] = {
			points: this._chart.getBarChartOptions({
				series: [{name: this.modelID,data: values}],
				chart: {height: 350, type: 'bar',animations: { enabled: false}, toolbar: {show: true,tools: {download: false}}},
				plotOptions: {bar: {borderRadius: 0, horizontal: false, distributed: true,}},
				colors: colors,
				yaxis: {forceNiceScale: false, min: this.modelPointsRange[this.modelID!].min, max: this.modelPointsRange[this.modelID!].max},
				grid: {show: true},
				xaxis: {labels: { show: false } }
			}, [], undefined, true),
			accuracy: this._chart.getBarChartOptions({
				series: [
					{name:'Long Accuracy',data:[this._backtest.performances[this.modelID!].long_acc]},
					{name:'Short Accuracy',data:[this._backtest.performances[this.modelID!].short_acc]},
					{name:'General Accuracy',data:[this._backtest.performances[this.modelID!].general_acc]}
				],
				colors: [this._chart.upwardColor, this._chart.downwardColor, '#000000'],
				yaxis: {labels: {show: false}}
			}, [this.modelID!], 130),
			positions: this._chart.getBarChartOptions({
				series: [
					{name:'Longs',data:[this._backtest.performances[this.modelID!].long_num]},
					{name:'Shorts',data:[this._backtest.performances[this.modelID!].short_num]},
					{name:'Total',data:[this._backtest.performances[this.modelID!].positions.length]}
				],
				colors: [this._chart.upwardColor, this._chart.downwardColor, '#000000'],
				yaxis: {labels: {show: false}}
			}, [this.modelID!], 130)
		}
	}





	/**
	 * Builds the points bar chart's data.
	 * @param id 
	 * @returns {colors: string[], values: number[]}
	 */
	private getModelPointsValues(id: string): {colors: string[], values: number[]}{
		let colors: string[] = ['#000000'];
		let values: number[] = [0];
		for (let i = 0; i < this._backtest.performances[id].positions.length; i++) {
			if (this._backtest.performances[id].positions[i].t == 1) { 
				colors.push(this._chart.upwardColor);
			} else { 
				colors.push(this._chart.downwardColor);
			}
			values.push(this._backtest.performances[id].points_hist[i+1])
		}
		return {colors: colors, values: values};
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
		if (typeof id == "number" && id >= 0) id = this._backtest.modelIDs[id]; 

		// Init the model
		const model: IModel = this._backtest.models[id];

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
					model: this._backtest.models[this.modelID!],
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
		const model: IModel = this._backtest.models[this.modelID!];
		// Initialize the string
		let sum: string = '====================\n';

		// Add the basic information
		sum += `MODEL:\n`;
		sum += `ID: ${model.id}\n`;
		sum += `Type: ${this._prediction.getModelTypeName(model)}\n`;
		sum += '\n'

		// DATE RANGE
		sum += `DATE RANGE:\n`;
		sum += `${moment(this._backtest.backtests[model.id].start).format('DD MMMM YYYY HH:mm')}\n`;
		sum += `${moment(this._backtest.backtests[model.id].end).format('DD MMMM YYYY HH:mm')}\n\n`;

		// POSITION EXITS
		sum += `POSITION EXITS:\n`;
		sum += `Take Profit: ${this._backtest.backtests[model.id].take_profit}%\n`;
		sum += `Stop Loss: ${this._backtest.backtests[model.id].stop_loss}%\n\n`;

		// PERFORMANCE
		sum += `PERFORMANCE:\n`;
		sum += `Points: ${this._backtest.performances[model.id].points}\n`;
		sum += `Accuracy:\n`;
		sum += `- General: ${this._backtest.performances[model.id].general_acc}%\n`;
		sum += `- Long: ${this._backtest.performances[model.id].long_acc}%\n`;
		sum += `- Short: ${this._backtest.performances[model.id].short_acc}%\n`;
		sum += `Positions:\n`;
		sum += `- Total: ${this._backtest.performances[model.id].positions.length}\n`;
		sum += `- Long: ${this._backtest.performances[model.id].long_num}\n`;
		sum += `- Short: ${this._backtest.performances[model.id].short_num}\n`;

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
		if (this._backtest.modelIDs.length <= 3) 		{ return 350 }
		else if (this._backtest.modelIDs.length <= 4) 	{ return 370 }
		else if (this._backtest.modelIDs.length <= 5) 	{ return 390 }
		else if (this._backtest.modelIDs.length <= 6) 	{ return 410 }
		else if (this._backtest.modelIDs.length <= 7) 	{ return 430 }
		else if (this._backtest.modelIDs.length <= 8) 	{ return 450 }
		else if (this._backtest.modelIDs.length <= 10) 	{ return 600 }
		else if (this._backtest.modelIDs.length <= 12) 	{ return 630 }
		else if (this._backtest.modelIDs.length <= 15) 	{ return 660 }
		else if (this._backtest.modelIDs.length <= 17) 	{ return 700 }
		else if (this._backtest.modelIDs.length <= 20) 	{ return 730 }
		else if (this._backtest.modelIDs.length <= 25) 	{ return 770 }
		else if (this._backtest.modelIDs.length <= 30) 	{ return 800 }
		else if (this._backtest.modelIDs.length <= 35) 	{ return 850 }
		else if (this._backtest.modelIDs.length <= 40) 	{ return 900 }
		else { return 1000}
	}
}
