import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormControl, FormGroup } from '@angular/forms';
import { MatSidenav } from '@angular/material/sidenav';
import {MatDialog} from '@angular/material/dialog';
import { ApexAxisChartSeries } from 'ng-apexcharts';
import { Subscription } from 'rxjs';
import { 
	UtilsService, 
	IBacktestPosition,
	IModel,
	IRegressionCertificatesOrder,
	RegressionTrainingService,
	IRegressionTrainingCertificate
} from '../../../core';
import { 
	AppService, 
	ChartService, 
	ClipboardService, 
	IBarChartOptions, 
	ILayout, 
	ILineChartOptions, 
	IPieChartOptions, 
	ModelSelectionService, 
	NavService, 
	SnackbarService,
} from '../../../services';
import { 
	RegressionTrainingCertificatesConfigDialogComponent, 
	IConfigResponse 
} from './regression-training-certificates-config-dialog'
import { BacktestPositionDialogComponent } from '../backtests/backtest-position-dialog';
import { 
	IRegressionTrainingCertificatesComponent, 
	ISection, 
	ISectionID
} from './interfaces';

@Component({
  selector: 'app-regression-training-certificates',
  templateUrl: './regression-training-certificates.component.html',
  styleUrls: ['./regression-training-certificates.component.scss']
})
export class RegressionTrainingCertificatesComponent implements OnInit, OnDestroy, IRegressionTrainingCertificatesComponent {
	// Sidenav Element
	@ViewChild('regTrainingCertificatesSidenav') regTrainingCertificatesSidenav: MatSidenav|undefined;
	public regTrainingCertificatesSidenavOpened: boolean = false;

	// Layout
	public layout: ILayout = this._app.layout.value;
	private layoutSub?: Subscription;

	// File Input Form
    public fileInputForm: FormGroup = new FormGroup({ fileInput: new FormControl('', [ ]) });

	// Initialization
	public initialized: boolean = false;
	public initializing: boolean = false;

	// Certificates Order
	public order: IRegressionCertificatesOrder = "general_points";

	// Navigation
	public readonly generalSections: ISection[] = [
		{id: 'general_evaluations', name: 'General Evaluations', icon: 'query_stats'},
		{id: 'reg_evaluations', name: 'Regression Evaluations', icon: 'rule'},
		{id: 'epochs', name: 'Epochs', icon: 'format_list_numbered'}
	]
	private readonly generalSectionIndex: {[sectionID: string]: number} = {
		'general_evaluations': 0,
		'reg_evaluations': 1,
		'epochs': 2,
	}
	public section: ISection = this.generalSections[0];
	public cert?: IRegressionTrainingCertificate;
	public activeRegTabIndex: number = 0;
	public activeTabIndex: number = 0;

	// General Charts
	public points?: IBarChartOptions;
	public regAccuracies?: IBarChartOptions;
	public regGeneralPoints?: IBarChartOptions;
	public regPredictions?: IBarChartOptions;
	public epochs?: IBarChartOptions;

	// Certificates Charts
	public activeGeneralEvaluationCategory?: number;
	public trainLoss?: ILineChartOptions;
	public regAccuracy?: IBarChartOptions;
	public regPoints?: IBarChartOptions;
	public regPrediction?: IPieChartOptions;
	public regOutcome?: IPieChartOptions;
	public visiblePositions: number = 15;


	// Loading state - Just for certificates
	public loaded: boolean = false;


	constructor(
		public _nav: NavService,
		private _snackbar: SnackbarService,
		public _clipboard: ClipboardService,
		private _app: AppService,
		private _chart: ChartService,
		private _utils: UtilsService,
		public _training: RegressionTrainingService,
		public _selection: ModelSelectionService,
		private dialog: MatDialog,
	) { }



	ngOnInit(): void {
		this.layoutSub = this._app.layout.subscribe((nl: ILayout) => this.layout = nl);
	}

	ngOnDestroy(): void {
		if (this.layoutSub) this.layoutSub.unsubscribe();
		this._selection.reset();
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

		// Abort the dialog if there are no files
		if (!event || !event.target || !event.target.files || !event.target.files.length) return;

		// Open the configuration dialog
		this.dialog.open(RegressionTrainingCertificatesConfigDialogComponent, {
			hasBackdrop: this._app.layout.value != 'mobile', // Mobile optimization
			panelClass: 'small-dialog',
			disableClose: true
		}).afterClosed().subscribe(async (response: IConfigResponse|undefined) => {
			if (response) {
				// Attempt to initiaze the certificates
				try {
					// Pass the files to the service
					await this._training.init(event, response.order, response.limit);

					// Set the order
					this.order = response.order;
					
					// Build the general charts
					this.buildGeneralCharts();

					// Activate the proper section based on the number of certificates
					if (this._training.certificates.length == 1) {
						// Navigate to the certificate
						await this.navigate('certificate', 0);
					} else { 
						// Navigate to the selected evaluation
						if (this.order == "general_points") {
							await this.navigate('general_evaluations');
						} else if (this.order == "reg_eval_acc" || this.order == "reg_eval_points") {
							await this.navigate('reg_evaluations');
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
	 * Resets the components values in order to view a different file.
	 * @returns void
	 */
	 public reset(): void {
		this.initialized = false;
		this.initializing = false;
		this.fileInput.setValue('');
		this._selection.reset();
	}










	/* Navigation */





	/**
	 * Navigates to any section of the component
	 * @param sectionID 
	 * @param certIndex?
	 * @returns Promise<void>
	 */
	public async navigate(sectionID: ISectionID, certIndex?: number): Promise<void> {
		// Close the sidenav if opened
		if (this.regTrainingCertificatesSidenavOpened) this.regTrainingCertificatesSidenav?.close();

		// Scroll top
		this._nav.scrollTop('#content-header');

		// Set Loading State
		this.loaded = false;

		// Navigate to the a general section
		if (sectionID != 'certificate') {
			this.section = this.generalSections[this.generalSectionIndex[sectionID]];
			this.cert = undefined;
			this.activeRegTabIndex = 0;
			this.activeTabIndex = 0;
			this.activeGeneralEvaluationCategory = undefined;
			this.visiblePositions = 15;
		}

		// Navigate to a certificate
		else if (sectionID == 'certificate' && typeof certIndex == "number") {
			this.cert = this._training.certificates[certIndex];
			this.buildCertificateCharts();
			this.section = {id: "certificate", name: this.cert.id};
		}

		// Otherwise, throw an error
		else { throw new Error("Invalid navigation parameters.") }

		// Allow a small delay
		await this._utils.asyncDelay(0.5);

		// Update loading state
		this.loaded = true;
	}










	/* General Charts */





	
	/**
	 * Builds the general charts data.
	 * @returns void
	 */
	 private buildGeneralCharts(): void {
		// Build the classification evaluation charts
		this.buildGeneralClassificationEvaluationCharts();

		// Build the geenral training charts
		this.buildGeneralTrainingCharts();
	}





	/**
	 * Builds all the charts related to the classification evaluation.
	 * @returns void
	 */
	private buildGeneralClassificationEvaluationCharts(): void {
		// Create a copy of the instance to handle chart click events
		const self = this;


		/* Build the Points Chart */
		this.points = this._chart.getBarChartOptions(
			{series: [{name: "General Points",data: this._training.certificates.map((c) => { return c.general.points }),color: "#000000"}]}, 
			this._training.ids, 
			this.getBarChartHeight()
		);
		this.points.chart.events = {click: function(e, cc, c) {if (c.dataPointIndex >= 0) setTimeout(() => {self.navigate("certificate", c.dataPointIndex)}, 100)}}


		/* Build the Accuracies Chart */
		
		// Init the chart data
		let series: ApexAxisChartSeries = [{name:'Increase Acc.%',data:[]},{name:'Decrease Acc.%',data:[]},{name:'General Acc.%',data:[]}];

		// Iterate over each model building the data
		for (let cert of this._training.certificates) {
			series[0].data.push(<any>cert.regression_evaluation.increase_acc);
			series[1].data.push(<any>cert.regression_evaluation.decrease_acc);
			series[2].data.push(<any>cert.regression_evaluation.acc);
		}



		/* Build the Regression Points Chart */
		this.regGeneralPoints = this._chart.getBarChartOptions(
			{series: [{name: "Points Median",data: this._training.certificates.map((c) => { 
				return c.regression_evaluation.points_median
			}),color: "#000000"}]}, 
			this._training.ids, 
			this.getBarChartHeight()
		);
		this.regGeneralPoints.chart.events = {click: function(e, cc, c) {if (c.dataPointIndex >= 0) setTimeout(() => {self.navigate("certificate", c.dataPointIndex)}, 100)}}



		// Build the test ds chart options
		this.regAccuracies = this._chart.getBarChartOptions(
			{
				series: series, 
				colors: [this._chart.upwardColor, this._chart.downwardColor, "#000000"],
			}, 
			this._training.ids, 
			this.getBarChartHeight(3)
		);
		this.regAccuracies.chart.events = {click: function(e, cc, c) {
			if (c.dataPointIndex >= 0) setTimeout(() => {self.navigate("certificate", c.dataPointIndex)}, 100)
		}}



		/* Build the Predictions Chart */
		
		// Init the chart data
		let predsSeries: ApexAxisChartSeries = [{name:'Increase Preds.',data:[]},{name:'Decrease Preds.',data:[]},{name:'Total Preds.',data:[]}];

		// Iterate over each model building the data
		for (let cert of this._training.certificates) {
			predsSeries[0].data.push(<any>cert.regression_evaluation.increase_num);
			predsSeries[1].data.push(<any>cert.regression_evaluation.decrease_num);
			predsSeries[2].data.push(<any>cert.regression_evaluation.positions.length);
		}

		// Build the class. preds. chart options
		this.regPredictions = this._chart.getBarChartOptions(
			{
				series: predsSeries, 
				colors: [this._chart.upwardColor, this._chart.downwardColor, "#000000"],
			}, 
			this._training.ids, 
			this.getBarChartHeight(3)
		);
		this.regPredictions.chart.events = {click: function(e, cc, c) {
			if (c.dataPointIndex >= 0) setTimeout(() => {self.navigate("certificate", c.dataPointIndex)}, 100)
		}}
	}




	/**
	 * Builds the general training charts such as the test ds evaluation and the epochs.
	 * @returns void
	 */
	private buildGeneralTrainingCharts(): void {
		// Create a copy of the instance to handle chart click events
		const self = this;


		/* Build the Epochs Chart */

		// Build the epochs chart options
		this.epochs = this._chart.getBarChartOptions(
			{
				series: [{name: "Epochs", data: this._training.epochs}], 
				colors: ["#000000"],
			}, 
			this._training.ids, 
			this.getBarChartHeight()
		);
		this.epochs.chart.events = {click: function(e, cc, c) {
			if (c.dataPointIndex >= 0) setTimeout(() => {self.navigate("certificate", c.dataPointIndex)}, 100)
		}}
	}














	/* Certifiate Charts */




	/**
	 * Builds the charts for a certificate.
	 * @returns void
	 */
	public buildCertificateCharts(): void {
		// Build the test ds charts
		this.buildCertificateTestDatasetCharts();

		// Build the classification eval charts
		this.buildCertificateClassificationEvaluationCharts();
	}







	/**
	 * Builds the certificate's Test Dataset Charts.
	 * @returns void
	 */
	 private buildCertificateTestDatasetCharts(): void {
		// Build the Loss Chart
		this.trainLoss = this._chart.getLineChartOptions(
			{
				series: [
					{
						name: "loss", 
						data: <any>this.cert!.training_history.loss.map(val => { return this._utils.outputNumber(val, {dp: 5})}), 
						color: "#E57373"
					},
					{
						name: "val_loss", 
						data: this.cert!.training_history.val_loss.map(val => { return this._utils.outputNumber(val, {dp: 5})}),  
						color: "#B71C1C"
					}
				],
				stroke: {curve: "straight", dashArray: [0, 5]}
			}, 305, true
		);
	}












	/**
	 * Builds the certificate's Regression Evaluation Charts.
	 * @returns void
	 */
	private buildCertificateClassificationEvaluationCharts(): void {
		// Build the accuracy chart
		this.regAccuracy = this._chart.getBarChartOptions(
			{
				series: [
					{name:'Increase Acc.%',data:[this.cert!.regression_evaluation.increase_acc]},
					{name:'Decrease Acc.%',data:[this.cert!.regression_evaluation.decrease_acc]},
					{name:'General Acc.%',data:[this.cert!.regression_evaluation.acc]}
				], 
				colors: [this._chart.upwardColor, this._chart.downwardColor, "#000000"],
				xaxis: {categories: [this.cert!.id], labels: {show: false}},
				yaxis: {labels: {show: false}},
			}, 
			[this.cert!.id], 
			130
		);


		// Build the points chart
		const {colors, values} = this._chart.getModelPointsValues(this.cert!.regression_evaluation.positions)
		this.regPoints = this._chart.getBarChartOptions({
			series: [{name: this.cert!.id,data: values}],
			chart: {height: 290, type: 'bar',animations: { enabled: false}, toolbar: {show: true,tools: {download: false}}},
			plotOptions: {bar: {borderRadius: 0, horizontal: false, distributed: true,}},
			colors: colors,
			grid: {show: true},
			xaxis: {labels: { show: false } }
		}, undefined, undefined, undefined, true);



		// Build the predictions chart
		this.regPrediction = this._chart.getPieChartOptions({
			series: [
				this.cert!.regression_evaluation.increase_num || 0, 
				this.cert!.regression_evaluation.decrease_num || 0
			],
			colors: [this._chart.upwardColor, this._chart.downwardColor],
			legend: {show: false}
		}, ["Increase", "Decrease"], 280);


		// Build the outcomes chart
		this.regOutcome = this._chart.getPieChartOptions({
			series: [
				this.cert!.regression_evaluation.increase_outcomes || 0, 
				this.cert!.regression_evaluation.decrease_outcomes || 0
			],
			colors: [this._chart.upwardColor, this._chart.downwardColor],
			legend: {show: false}
		}, ["Increase", "Decrease"], 280);
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
					model: <IModel>{
						id: this.cert!.id,
						regression_models: [{
							regression_id: this.cert!.id,
							interpreter: { long: 0.5, short: 0.5},
							regression: this.cert!.regression_config
						}]
					},
					position: position
				}
		})
	}










	/* Misc Helpers */





	/**
	 * Returns the optimal bar chart height based on the number of models.
	 * @returns number
	 */
	 private getBarChartHeight(itemsPerCategory?: number): number {
		return this._chart.calculateChartHeight(110, 20, this._training.certificates.length, itemsPerCategory);
	}
}
