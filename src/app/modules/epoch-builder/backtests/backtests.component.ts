import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormControl, FormGroup } from '@angular/forms';
import { MatSidenav } from '@angular/material/sidenav';
import {MatDialog} from '@angular/material/dialog';
import { ApexAxisChartSeries } from 'ng-apexcharts';
import * as moment from 'moment';
import { Subscription } from 'rxjs';
import { IBacktestPosition, IModel, BacktestService, PredictionService, UtilsService, IBacktestOrder } from '../../../core';
import { 
	AppService, 
	ChartService, 
	ClipboardService, 
	IBarChartOptions, 
	IChartRange, 
	ILayout, 
	ILineChartOptions, 
	ModelSelectionService, 
	NavService, 
	SnackbarService,
} from '../../../services';
import { BacktestPositionDialogComponent } from './backtest-position-dialog';
import { IModelCharts, IBacktestsComponent, ISection } from './interfaces';
import { BacktestConfigDialogComponent, IConfigResponse } from './backtest-config-dialog';

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
    public fileInputForm: FormGroup = new FormGroup({ fileInput: new FormControl('', [ ]) });

	// Backtest Initialization
	public initialized: boolean = false;
	public initializing: boolean = false;

	// Backtests Order
	public order: IBacktestOrder = "points";

	// Sections
	public readonly generalSections: ISection[] = [
		{id: 'points', name: 'Points', icon: 'query_stats'},
		{id: 'points_median', name: 'Points Median', icon: 'vertical_align_center'},
		{id: 'accuracy', name: 'Accuracy', icon: 'ads_click'},
		{id: 'positions', name: 'Positions', icon: 'format_list_numbered'}
	]
	public modelID?: string = undefined;
	public section: ISection = this.generalSections[0];
	public activeIndex: number = 0;
	public loaded: boolean = false;

	/* General Charts */

	// Badges views
	public viewBest: boolean = true;
	
	// Points
	public pointsDistChart?: IBarChartOptions;
	public pointsLineChart?: ILineChartOptions;
	
	// Points Median
	public pointsMedianChart?: IBarChartOptions;

	// Accuracy
	public accuracyChart?: IBarChartOptions;

	// Positions
	public positionsChart?: IBarChartOptions;

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
		public _selection: ModelSelectionService,
		private dialog: MatDialog,
	) { }




	ngOnInit(): void {
		// Initialize layout
		this.layoutSub = this._app.layout.subscribe((nl: ILayout) => this.layout = nl);
	}

	ngOnDestroy(): void {
		if (this.layoutSub) this.layoutSub.unsubscribe();
		this._backtest.resetBacktestResults();
		this._selection.reset();
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


		// Open the configuration dialog
		this.dialog.open(BacktestConfigDialogComponent, {
			hasBackdrop: this._app.layout.value != 'mobile', // Mobile optimization
			panelClass: 'small-dialog',
			disableClose: true
		}).afterClosed().subscribe(async (response: IConfigResponse|undefined) => {
			if (response) {
				// Attempt to initiaze the certificates
				try {
					// Pass the files to the service
					await this._backtest.init(event, response.order, response.limit);

					// Set the order
					this.order = response.order;

					// Activate default section

					// If it is 1 model, navigate straight to it
					if (this._backtest.modelIDs.length == 1) {
						// Navigate to the certificate
						this.activateModel(this._backtest.modelIDs[0])
					} 
					
					// Otherwise, activate the section based on the order
					else { 
						// Navigate to the selected evaluation
						if (this.order == "points") {
							await this.activateSection(this.generalSections[0]);
						} else if (this.order == "point_medians") {
							await this.activateSection(this.generalSections[1]);
						} else {
							await this.activateSection(this.generalSections[2]);
						}
					}

					// Allow a small delay
					await this._utils.asyncDelay(0.5);

					// Mark the backtest as initialized
					this.initialized = true;
				} catch (e) {
					this.fileInput.setValue('');
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
		this.pointsMedianChart = undefined;
		this.pointsLineChart = undefined;
		this.accuracyChart = undefined;
		this.positionsChart = undefined;
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




	/**
	 * Navigates to a model based on its id.
	 * @param modelID 
	 * @returns void
	 */
	 public activateModel(modelID: string): void {
		this.activateSection({id: 'model', name: modelID}, modelID);
	}





	/**
	 * Navigates to a model based on its index.
	 * @param index 
	 * @returns void
	 */
	 private activateModelByIndex(index: number): void {
		// Init the id of the model
		let id: string|undefined;

		// If the Model's index was provided instead of the id, populate it.
		if (typeof index == "number" && index >= 0) id = this._backtest.modelIDs[index]; 

		// Display the dialog if the model was found
		if (id) this.activateSection({id: 'model', name: id}, id);
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

		// Points Median
		else if (this.section.id == 'points_median' && !this.pointsMedianChart) { this.initPointsMedianSection() }

		// Accuracy
		else if (this.section.id == 'accuracy' && !this.accuracyChart) { this.initAccuracySection() }

		// Positions
		else if (this.section.id == 'positions' && !this.positionsChart) { this.initPositionsSection() }

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
		this.pointsDistChart = this._chart.getBarChartOptions({series: dist}, this._backtest.modelIDs, this.getBarChartHeight(), true);
		this.pointsDistChart.chart.events = {click: function(e, cc, c) {setTimeout(() => {self.activateModelByIndex(c.dataPointIndex)}, 100)}}

		// Populate the line chart values
		this.pointsLineChart = this._chart.getLineChartOptions({
			series: lines,
			stroke: {width: 5, curve: "straight"}
		}, this.getLineChartHeight(), true, {
			max: this._backtest.pointsHistoryMD.max.value,
			min: this._backtest.pointsHistoryMD.min.value,
		});
		this.pointsLineChart.chart.events = {click: function(e: any, cc: any, c: any) {setTimeout(() => {self.activateModelByIndex(c.dataPointIndex)}, 100)}}
	}






	// Initializes the points median section.
	private initPointsMedianSection(): void {
		// Init the chart data
		let dist: ApexAxisChartSeries = [{name: 'Points Median',data: []}];

		// Iterate over each model building the data
		for (let i = 0; i < this._backtest.modelIDs.length; i++) {
			dist[0].data.push(<any>this._backtest.performances[this._backtest.modelIDs[i]].points_median || 0);
		}

		// Create a copy of the instance to handle chart click events
		const self = this;

		// Build the dist chart options
		this.pointsMedianChart = this._chart.getBarChartOptions({series: dist}, this._backtest.modelIDs, this.getBarChartHeight(), true);
		this.pointsMedianChart.chart.events = {click: function(e, cc, c) {setTimeout(() => {self.activateModelByIndex(c.dataPointIndex)}, 100)}}
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
			this._backtest.modelIDs, this.getBarChartHeight(3)
		);
		this.accuracyChart.chart.events = {click: function(e, cc, c) {setTimeout(() => { self.activateModelByIndex(c.dataPointIndex) }, 100)}}
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
			this._backtest.modelIDs, this.getBarChartHeight(3)
		);
		this.positionsChart.chart.events = {click: function(e, cc, c) {setTimeout(() => { self.activateModelByIndex(c.dataPointIndex) }, 100)}}
	}




	// Initializes the charts for a model
	private initModelCharts(): void {
		// Build the meta data
		this.modelPointsRange[this.modelID!] = { 
			max: this._utils.getMax(this._backtest.performances[this.modelID!].points_hist),
			min: this._utils.getMin(this._backtest.performances[this.modelID!].points_hist)
		}

		// Retrieve the points charts data
		const {colors, values} = this._chart.getModelPointsValues(this._backtest.performances[this.modelID!].positions);

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
			}, [this.modelID!], 150),
			positions: this._chart.getPieChartOptions({
				series: [
					this._backtest.performances[this.modelID!].long_num || 0, 
					this._backtest.performances[this.modelID!].short_num || 0
				],
				colors: [this._chart.upwardColor, this._chart.downwardColor],
				legend: {show: false}
			}, ["Longs", "Shorts"], 280),
			outcomes: this._chart.getPieChartOptions({
				series: [
					this._backtest.performances[this.modelID!].long_outcome_num || 0, 
					this._backtest.performances[this.modelID!].short_outcome_num || 0
				],
				colors: [this._chart.upwardColor, this._chart.downwardColor],
				legend: {show: false}
			}, ["Longs", "Shorts"], 280)
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
		sum += `Points Median: ${this._backtest.performances[model.id].points_median}\n`;
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
	 * Returns the optimal bar chart height based on the number of models.
	 * @returns number
	 */
	private getBarChartHeight(itemsPerCategory?: number): number {
		return this._chart.calculateChartHeight(110, 20, this._backtest.modelIDs.length, itemsPerCategory);
	}





	/**
	 * Returns the optimal line chart height based on the number of models.
	 * @returns number
	 */
	 private getLineChartHeight(): number {
		return this._chart.calculateChartHeight(400, 10, this._backtest.modelIDs.length, undefined, 800);
	}
}
