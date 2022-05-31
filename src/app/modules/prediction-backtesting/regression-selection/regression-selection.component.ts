import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormControl, FormGroup } from '@angular/forms';
import { MatSidenav } from '@angular/material/sidenav';
import { ApexAxisChartSeries } from 'ng-apexcharts';
import { Subscription } from 'rxjs';
import { 
	UtilsService, 
	RegressionSelectionService
} from '../../../core';
import { 
	AppService, 
	ChartService, 
	ClipboardService, 
	IBarChartOptions, 
	ILayout, 
	ILineChartOptions, 
	IPieChartOptions, 
	NavService, 
	SnackbarService,
} from '../../../services';
import { IRegressionSelectionComponent, ISectionID, IPointsHistoryItem } from './interfaces';

@Component({
  selector: 'app-regression-selection',
  templateUrl: './regression-selection.component.html',
  styleUrls: ['./regression-selection.component.scss']
})
export class RegressionSelectionComponent implements OnInit, OnDestroy, IRegressionSelectionComponent {
	// Sidenav Element
	@ViewChild('regressionSelectionSidenav') regressionSelectionSidenav: MatSidenav|undefined;
	public regressionSelectionSidenavOpened: boolean = false;

	// Layout
	public layout: ILayout = this._app.layout.value;
	private layoutSub?: Subscription;

	// File Input Form
    public fileInputForm: FormGroup = new FormGroup({ fileInput: new FormControl('', [ ]) });

	// Initialization
	public initialized: boolean = false;
	public initializing: boolean = false;

	// Navigation
	public section: ISectionID = "summary";
	public activeComb: number = 0;
	public activeTabIndex: number = 0;

	// Summary Charts
	public models?: IPieChartOptions;
	public pointsMean?: IBarChartOptions;

	// Combination Charts
	public combPoints?: IBarChartOptions;
	public combPointsHist?: IPointsHistoryItem[];
	public combPositions?: IBarChartOptions;
	public combAccuracy?: IBarChartOptions;

	// Loading state - Just for TP/SL Combinations
	public loaded: boolean = false;




	constructor(
		public _nav: NavService,
		private _snackbar: SnackbarService,
		public _clipboard: ClipboardService,
		private _app: AppService,
		private _chart: ChartService,
		private _utils: UtilsService,
		public _rs: RegressionSelectionService
	) { }



	ngOnInit(): void {
		this.layoutSub = this._app.layout.subscribe((nl: ILayout) => this.layout = nl);
	}

	ngOnDestroy(): void {
		if (this.layoutSub) this.layoutSub.unsubscribe();
	}



    /* Form Getters */
	get fileInput(): AbstractControl { return <AbstractControl>this.fileInputForm.get('fileInput') }




	/* Initialization */





	/**
	 * Whenever there is a file change, it will attempt to initialize the Training Certificates.
	 * @param event 
	 * @returns Promise<void>
	 */
	 public async fileChanged(event: any): Promise<void> {
		// Set the state
		this.initializing = true;

		// Abort the bottom sheet if there are no files
		if (!event || !event.target || !event.target.files || !event.target.files.length) return;

		// Attempt to initiaze the certificates
		try {
			// Pass the files to the service
			await this._rs.init(event);

			// Build the summary charts
			this.buildSummaryCharts();

			// Navigate to the summary section
			await this.navigate('summary');

			// Allow a small delay
			await this._utils.asyncDelay(0.5);

			// Mark the backtest as initialized
			this.initialized = true;
		} catch (e) {
			this.fileInput.setValue('');
			this._snackbar.error(e)
		}

		// Update Initializing State
		this.initializing = false;
	}





	/**
	 * Resets the components values in order to view a different file.
	 * @returns void
	 */
	 public reset(): void {
		this.initialized = false;
		this.initializing = false;
		this.fileInput.setValue('');
	}











	/* Navigation */





	/**
	 * Navigates to any section of the component
	 * @param sectionID 
	 * @param combIndex?
	 * @returns Promise<void>
	 */
	 public async navigate(sectionID: ISectionID, combIndex?: number): Promise<void> {
		// Close the sidenav if opened
		if (this.regressionSelectionSidenavOpened) this.regressionSelectionSidenav?.close();

		// Scroll top
		this._nav.scrollTop('#content-header');

		// Set Loading State
		this.loaded = false;

		// Navigate to the summary section
		if (sectionID != 'combination') {
			this.section = sectionID;
			this.activeComb = 0;
			this.activeTabIndex = 0;
		}

		// Navigate to a combination section
		else if (sectionID == 'combination' && typeof combIndex == "number") {
			this.section = 'combination';
			this.activeComb = combIndex;
			this.buildCombinationCharts();
		}

		// Otherwise, throw an error
		else { throw new Error("Invalid navigation parameters.") }

		// Allow a small delay
		await this._utils.asyncDelay(0.5);

		// Set Loading State
		this.loaded = true;
	}







	/* Summary Charts */




	/**
	 * Builds the models number and the points mean charts.
	 * @returns void
	 */
	private buildSummaryCharts(): void {
		// Create a copy of the instance to handle chart click events
		const self = this;

		// Build the models chart
		this.models = this._chart.getPieChartOptions(
			{
				series: this._rs.results.map((r) => { return r.models_num }),
				colors: this._chart.colors.slice(0, this._rs.results.length),
				legend: { position: "bottom" }
			}, 
			this._rs.combinations, 
			450
		);


		// Build the Points Mean Chart
		this.pointsMean = this._chart.getBarChartOptions(
			{
				series: [{
					name: "Points Mean",
					data: this._rs.results.map((r) => { return <number>this._utils.outputNumber(r.points_mean, {dp: 2}) }),
				}]
			}, 
			this._rs.combinations, 
			this.getBarChartHeight(this._rs.results.length),
			true
		);
		this.pointsMean.chart.events = {click: function(e, cc, c) {
			if (c.dataPointIndex >= 0) setTimeout(() => {self.navigate("combination", c.dataPointIndex)}, 100)
		}}
	}









	/* Combination Charts */





	/**
	 * Builds all the combination charts.
	 * @returns void
	 */
	private buildCombinationCharts(): void {
		// Init helper values
		const modelIDs: string[] = this._rs.results[this.activeComb].model_results.map((mr) => { return mr.model.id });
		const baseBarHeight: number = this.getBarChartHeight(modelIDs.length)

		// Init Combination Points
		this.initCombinationPoints(modelIDs, baseBarHeight);


		// Build the Combination Points History Charts
		this.initCombinationPointsHistory();


		// Build the Combination Positions Chart
		this.initCombinationPositions(modelIDs, baseBarHeight);


		// Build the Combination Accuracy Chart
		this.initCombinationAccuracy(modelIDs, baseBarHeight);
	}




	// Combination Points
	private initCombinationPoints(modelIDs: string[], baseBarHeight: number): void {
		// Create a copy of the instance to handle chart click events
		const self = this;

		// Build the Combination Points Chart
		this.combPoints = this._chart.getBarChartOptions(
			{
				series: [{
					name: "Points Median",
					data: this._rs.results[this.activeComb].model_results.map((mr) => { 
						return <number>this._utils.outputNumber(mr.points_median, {dp: 2}) 
					})
				}]
			}, 
			modelIDs, 
			baseBarHeight,
			true
		);
		this.combPoints.chart.events = {click: function(e, cc, c) { self.displayActiveCombinationModel(c.dataPointIndex) }}
	}




	// Combination Points History
	private initCombinationPointsHistory(): void {
		// Init the items
		this.combPointsHist = [];

		// Iterate over each model result and build the hist items
		for (let r of this._rs.results[this.activeComb].model_results) {
			this.combPointsHist.push({
				modelID: r.model.id,
				pointsMedian: r.points_median,
				chart: this._chart.getLineChartOptions(
					{
						series: [
							{
								name: "Median", 
								data: r.points_median_hist.map((h) => { return <number>this._utils.outputNumber(h, {dp:2}) }), 
								color: "#000000"
							}
						],
						xaxis: {categories: ["10%", "20%", "30%", "40%", "50%", "60%", "70%", "80%", "90%", "100%"]}
					},
					250,
					true,
					undefined,
				)
			});
		}
	}





	// Combination Positions
	private initCombinationPositions(modelIDs: string[], baseBarHeight: number): void {
		// Init the chart data
		let series: ApexAxisChartSeries = [{name:'Longs',data:[]},{name:'Shorts',data:[]},{name:'Total',data:[]}];

		// Iterate over each model building the data
		for (let mr of this._rs.results[this.activeComb].model_results) {
			// Add the distribution
			series[0].data.push(<any>mr.long_num);
			series[1].data.push(<any>mr.short_num);
			series[2].data.push(<any>mr.long_num + mr.short_num);
		}

		// Build the chart options
		const self = this;
		this.combPositions = this._chart.getBarChartOptions(
			{series: series, colors: [this._chart.upwardColor, this._chart.downwardColor, '#000000']}, 
			modelIDs, 
			baseBarHeight*1.5
		);
		this.combPositions.chart.events = {click: function(e, cc, c) { self.displayActiveCombinationModel(c.dataPointIndex) }}
	}





	// Combination Accuracy
	private initCombinationAccuracy(modelIDs: string[], baseBarHeight: number): void {
		// Init the chart data
		let series: ApexAxisChartSeries = [{name:'Long Accuracy',data:[]},{name:'Short Accuracy',data:[]},{name:'General Accuracy',data:[]}];

		// Iterate over each model building the data
		for (let mr of this._rs.results[this.activeComb].model_results) {
			// Add the distribution
			series[0].data.push(<any>mr.long_acc);
			series[1].data.push(<any>mr.short_acc);
			series[2].data.push(<any>mr.general_acc);
		}

		// Build the chart options
		const self = this;
		this.combAccuracy = this._chart.getBarChartOptions(
			{series: series, colors: [this._chart.upwardColor, this._chart.downwardColor, '#000000']}, 
			modelIDs, 
			baseBarHeight*1.5
		);
		this.combAccuracy.chart.events = {click: function(e, cc, c) { self.displayActiveCombinationModel(c.dataPointIndex) }}
	}







	/* Dialogs */




	/**
	 * Displays a model by index based on the active combination.
	 * @param modelIndex 
	 * @returns void
	 */
	public displayActiveCombinationModel(modelIndex: number): void {
		if (modelIndex >= 0) {
			this._nav.displayModelDialog(this._rs.getModelFromCombinationIDAndIndex(this.activeComb, modelIndex));
		}
	}







	/* Misc Helpers */


	/**
	 * Returns the height for a bar chart based on a number of items.
	 * If it is a multi-bar, make sure to multiply this number by 1.5-2 
	 * according to the number of bars.
	 * @returns number
	 */
	 private getBarChartHeight(items: number): number {
		if (items <= 5) 		{ return 400 }
		if (items <= 7) 		{ return 450 }
		if (items <= 10) 		{ return 500 }
		if (items <= 13) 		{ return 550 }
		if (items <= 15) 		{ return 600 }
		if (items <= 17) 		{ return 650 }
		if (items <= 20) 		{ return 700 }
		if (items <= 23) 		{ return 750 }
		if (items <= 25) 		{ return 800 }
		if (items <= 27) 		{ return 850 }
		if (items <= 30) 		{ return 900 }
		if (items <= 33) 		{ return 950 }
		if (items <= 35) 		{ return 1000 }
		if (items <= 37) 		{ return 1050 }
		if (items <= 40) 		{ return 1100 }
		if (items <= 43) 		{ return 1150 }
		if (items <= 45) 		{ return 1200 }
		if (items <= 47) 		{ return 1250 }
		if (items <= 50) 		{ return 1300 }
		if (items <= 53) 		{ return 1350 }
		if (items <= 55) 		{ return 1400 }
		if (items <= 57) 		{ return 1450 }
		if (items <= 60) 		{ return 1500 }
		if (items <= 63) 		{ return 1550 }
		if (items <= 65) 		{ return 1600 }
		if (items <= 67) 		{ return 1650 }
		if (items <= 70) 		{ return 1700 }
		if (items <= 75) 		{ return 1800 }
		if (items <= 80) 		{ return 1900 }
		if (items <= 90) 		{ return 2000 }
		else 					{ return 2100 }
	}
}
