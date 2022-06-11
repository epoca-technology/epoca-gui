import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormControl, FormGroup } from '@angular/forms';
import { MatSidenav } from '@angular/material/sidenav';
import {MatDialog} from '@angular/material/dialog';
import { ApexAxisChartSeries } from 'ng-apexcharts';
import { Subscription } from 'rxjs';
import { 
	ClassificationTrainingService, 
	UtilsService, 
	IClassificationTrainingCertificate, 
	IClassificationCertificatesOrder
} from '../../../core';
import { 
	AppService, 
	ChartService, 
	ClipboardService, 
	IBarChartOptions, 
	ILayout, 
	ILineChartOptions, 
	IPieChartOptions, 
	IScatterChartOptions, 
	NavService, 
	SnackbarService,
} from '../../../services';
import { 
	ClassificationTrainingCertificatesConfigDialogComponent, 
	IConfigResponse 
} from './classification-training-certificates-config-dialog';
import { 
	IClassificationTrainingCertificatesComponent, 
	ISection, 
	ISectionID, 
	IAccuracyChartData,
} from './interfaces';

@Component({
  selector: 'app-classification-training-certificates',
  templateUrl: './classification-training-certificates.component.html',
  styleUrls: ['./classification-training-certificates.component.scss']
})
export class ClassificationTrainingCertificatesComponent implements OnInit, OnDestroy, IClassificationTrainingCertificatesComponent {
	// Sidenav Element
	@ViewChild('classTrainingCertificatesSidenav') classTrainingCertificatesSidenav: MatSidenav|undefined;
	public classTrainingCertificatesSidenavOpened: boolean = false;

	// Layout
	public layout: ILayout = this._app.layout.value;
	private layoutSub?: Subscription;

	// File Input Form
    public fileInputForm: FormGroup = new FormGroup({ fileInput: new FormControl('', [ ]) });

	// Initialization
	public initialized: boolean = false;
	public initializing: boolean = false;

	// Certificates Order
	public order: IClassificationCertificatesOrder = "general_points";

	// Navigation
	public readonly generalSections: ISection[] = [
		{id: 'general_evaluations', name: 'General Evaluations', icon: 'query_stats'},
		{id: 'class_evaluations', name: 'Classification Evaluations', icon: 'rule'},
		{id: 'evaluations', name: 'Test Dataset Evaluations', icon: 'playlist_add_check'},
		{id: 'epochs', name: 'Epochs', icon: 'format_list_numbered'}
	]
	private readonly generalSectionIndex: {[sectionID: string]: number} = {
		'general_evaluations': 0,
		'class_evaluations': 1,
		'evaluations': 2,
		'epochs': 3,
	}
	public section: ISection = this.generalSections[0];
	public cert?: IClassificationTrainingCertificate;
	public activeClassTabIndex: number = 0;
	public activeTabIndex: number = 0;

	// General Charts
	public points?: IBarChartOptions;
	public classAccuracies?: IBarChartOptions;
	public classPredictions?: IBarChartOptions;
	public classIncreaseProbs?: IBarChartOptions;
	public classSuccessfulIncreaseProbs?: IBarChartOptions;
	public classDecreaseProbs?: IBarChartOptions;
	public classSuccessfulDecreaseProbs?: IBarChartOptions;
	public testDSEvaluations?: IBarChartOptions;
	public epochs?: IBarChartOptions;

	// Certificates Charts
	public activeGeneralEvaluationCategory?: number;
	public testDSEvaluation?: IBarChartOptions;
	public testDSLoss?: ILineChartOptions;
	public testDSAccuracy?: ILineChartOptions;
	public classAccuracy?: IBarChartOptions;
	public classPrediction?: IPieChartOptions;
	public classOutcome?: IPieChartOptions;
	public classProbs?: IScatterChartOptions;
	public activeProb: number = 0;



	// Loading state - Just for certificates
	public loaded: boolean = false;


	constructor(
		public _nav: NavService,
		private _snackbar: SnackbarService,
		public _clipboard: ClipboardService,
		private _app: AppService,
		private _chart: ChartService,
		private _utils: UtilsService,
		public _training: ClassificationTrainingService,
		private dialog: MatDialog,
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

		// Abort the dialog if there are no files
		if (!event || !event.target || !event.target.files || !event.target.files.length) return;

		// Open the configuration dialog
		this.dialog.open(ClassificationTrainingCertificatesConfigDialogComponent, {
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
						} else if (this.order == "acc") {
							await this.navigate('class_evaluations');
						} else {
							await this.navigate('evaluations');
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
		if (this.classTrainingCertificatesSidenavOpened) this.classTrainingCertificatesSidenav?.close();

		// Scroll top
		this._nav.scrollTop('#content-header');

		// Set Loading State
		this.loaded = false;

		// Navigate to the a general section
		if (sectionID != 'certificate') {
			this.section = this.generalSections[this.generalSectionIndex[sectionID]];
			this.cert = undefined;
			this.activeClassTabIndex = 0;
			this.activeTabIndex = 0;
			this.activeGeneralEvaluationCategory = undefined;
			this.activeProb = 0;
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
		// Get the Epochs chart height
		const baseHeight: number = this.getBarChartBaseHeight(this._training.certificates.length);

		// Build the classification evaluation charts
		this.buildGeneralClassificationEvaluationCharts(baseHeight);

		// Build the geenral training charts
		this.buildGeneralTrainingCharts(baseHeight);
	}





	/**
	 * Builds all the charts related to the classification evaluation.
	 * @param baseHeight 
	 * @returns void
	 */
	private buildGeneralClassificationEvaluationCharts(baseHeight: number): void {
		// Create a copy of the instance to handle chart click events
		const self = this;


		/* Build the Points Chart */
		this.points = this._chart.getBarChartOptions(
			{series: [{name: "General Points",data: this._training.certificates.map((c) => { return c.general.points }),color: "#000000"}]}, 
			this._training.ids, 
			baseHeight
		);
		this.points.chart.events = {click: function(e, cc, c) {if (c.dataPointIndex >= 0) setTimeout(() => {self.navigate("certificate", c.dataPointIndex)}, 100)}}


		/* Build the Accuracies Chart */
		
		// Init the chart data
		let series: ApexAxisChartSeries = [{name:'Increase Acc.%',data:[]},{name:'Decrease Acc.%',data:[]},{name:'General Acc.%',data:[]}];

		// Iterate over each model building the data
		for (let cert of this._training.certificates) {
			series[0].data.push(<any>cert.classification_evaluation.increase_acc);
			series[1].data.push(<any>cert.classification_evaluation.decrease_acc);
			series[2].data.push(<any>cert.classification_evaluation.acc);
		}

		// Build the test ds chart options
		this.classAccuracies = this._chart.getBarChartOptions(
			{
				series: series, 
				colors: [this._chart.upwardColor, this._chart.downwardColor, "#000000"],
			}, 
			this._training.ids, 
			Math.round(baseHeight*1.8)
		);
		this.classAccuracies.chart.events = {click: function(e, cc, c) {
			if (c.dataPointIndex >= 0) setTimeout(() => {self.navigate("certificate", c.dataPointIndex)}, 100)
		}}



		/* Build the Predictions Chart */
		
		// Init the chart data
		let predsSeries: ApexAxisChartSeries = [{name:'Increase Preds.',data:[]},{name:'Decrease Preds.',data:[]},{name:'Total Preds.',data:[]}];

		// Iterate over each model building the data
		for (let cert of this._training.certificates) {
			predsSeries[0].data.push(<any>cert.classification_evaluation.increase_num);
			predsSeries[1].data.push(<any>cert.classification_evaluation.decrease_num);
			predsSeries[2].data.push(<any>cert.classification_evaluation.evaluations);
		}

		// Build the class. preds. chart options
		this.classPredictions = this._chart.getBarChartOptions(
			{
				series: predsSeries, 
				colors: [this._chart.upwardColor, this._chart.downwardColor, "#000000"],
			}, 
			this._training.ids, 
			Math.round(baseHeight*1.8)
		);
		this.classPredictions.chart.events = {click: function(e, cc, c) {
			if (c.dataPointIndex >= 0) setTimeout(() => {self.navigate("certificate", c.dataPointIndex)}, 100)
		}}


		/* Build the Increase Probs Chart */
		this.classIncreaseProbs = this._chart.getBarChartOptions(
			{series: [{name: "Probabilities Mean",data: this._training.certificates.map((c) => { return c.classification_evaluation.increase_mean }),color: this._chart.upwardColor}]}, 
			this._training.ids, 
			baseHeight
		);
		this.classIncreaseProbs.chart.events = {click: function(e, cc, c) {if (c.dataPointIndex >= 0) setTimeout(() => {self.navigate("certificate", c.dataPointIndex)}, 100)}}

		/* Build the Successful Increase Probs Chart */
		this.classSuccessfulIncreaseProbs = this._chart.getBarChartOptions(
			{series: [{name: "Successful Probabilities Mean",data: this._training.certificates.map((c) => { return c.classification_evaluation.increase_successful_mean }),color: this._chart.upwardColor}], }, 
			this._training.ids, 
			baseHeight
		);
		this.classSuccessfulIncreaseProbs.chart.events = {click: function(e, cc, c) {if (c.dataPointIndex >= 0) setTimeout(() => {self.navigate("certificate", c.dataPointIndex)}, 100)}}


		/* Build the Decrease Probs Chart */
		this.classDecreaseProbs = this._chart.getBarChartOptions(
			{series: [{name: "Probabilities Mean",data: this._training.certificates.map((c) => { return c.classification_evaluation.decrease_mean }),color: this._chart.downwardColor}]}, 
			this._training.ids, 
			baseHeight
		);
		this.classDecreaseProbs.chart.events = {click: function(e, cc, c) {if (c.dataPointIndex >= 0) setTimeout(() => {self.navigate("certificate", c.dataPointIndex)}, 100)}}

		/* Build the Successful Decrease Probs Chart */
		this.classSuccessfulDecreaseProbs = this._chart.getBarChartOptions(
			{series: [{name: "Successful Probabilities Mean",data: this._training.certificates.map((c) => { return c.classification_evaluation.decrease_successful_mean }),color: this._chart.downwardColor}], }, 
			this._training.ids, 
			baseHeight
		);
		this.classSuccessfulDecreaseProbs.chart.events = {click: function(e, cc, c) {if (c.dataPointIndex >= 0) setTimeout(() => {self.navigate("certificate", c.dataPointIndex)}, 100)}}
	}




	/**
	 * Builds the general training charts such as the test ds evaluation and the epochs.
	 * @param baseHeight
	 * @returns void
	 */
	private buildGeneralTrainingCharts(baseHeight: number): void {
		// Create a copy of the instance to handle chart click events
		const self = this;

		/* Build the Evaluations Chart */
		
		// Init the chart data
		let series: ApexAxisChartSeries = [{name:'Loss',data:[]},{name:'Accuracy',data:[]}];

		// Iterate over each model building the data
		for (let evaluation of this._training.evals) {
			series[0].data.push(<any>evaluation.loss);
			series[1].data.push(<any>evaluation.accuracy);
		}

		// Build the test ds chart options
		this.testDSEvaluations = this._chart.getBarChartOptions(
			{
				series: series, 
				colors: [this._chart.downwardColor, this._chart.upwardColor],
			}, 
			this._training.ids, 
			Math.round(baseHeight*1.5)
		);
		this.testDSEvaluations.chart.events = {click: function(e, cc, c) {
			if (c.dataPointIndex >= 0) setTimeout(() => {self.navigate("certificate", c.dataPointIndex)}, 100)
		}}


		/* Build the Epochs Chart */

		// Build the epochs chart options
		this.epochs = this._chart.getBarChartOptions(
			{
				series: [{name: "Epochs", data: this._training.epochs}], 
				colors: ["#000000"],
			}, 
			this._training.ids, 
			baseHeight
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
	 * Builds the certificate's Classification Evaluation Charts.
	 * @returns void
	 */
	private buildCertificateClassificationEvaluationCharts(): void {
		// Build the accuracy chart
		this.classAccuracy = this._chart.getBarChartOptions(
			{
				series: [
					{name:'Increase Acc.%',data:[this.cert!.classification_evaluation.increase_acc]},
					{name:'Decrease Acc.%',data:[this.cert!.classification_evaluation.decrease_acc]},
					{name:'General Acc.%',data:[this.cert!.classification_evaluation.acc]}
				], 
				colors: [this._chart.upwardColor, this._chart.downwardColor, "#000000"],
				xaxis: {categories: [this.cert!.id], labels: {show: false}},
				yaxis: {labels: {show: false}},
				plotOptions: { bar: { horizontal: false, borderRadius: 4, columnWidth: "25%",}}
			}, 
			[this.cert!.id], 
			295
		);


		// Build the predictions chart
		this.classPrediction = this._chart.getPieChartOptions({
			series: [
				this.cert!.classification_evaluation.increase_num, 
				this.cert!.classification_evaluation.decrease_num, 
				this.cert!.classification_evaluation.max_evaluations - this.cert!.classification_evaluation.evaluations
			],
			colors: [this._chart.upwardColor, this._chart.downwardColor, this._chart.neutralColor],
			legend: {position: "bottom"}
		}, ["Increase", "Decrease", "Neutral"], 345);


		// Build the outcomes chart
		this.classOutcome = this._chart.getPieChartOptions({
			series: [
				this.cert!.classification_evaluation.increase_outcomes || 0, 
				this.cert!.classification_evaluation.decrease_outcomes || 0
			],
			colors: [this._chart.upwardColor, this._chart.downwardColor],
			legend: {position: "bottom"}
		}, ["Increase", "Decrease"], 345);

		
		// Build the class. prediction probabilities
		let series: ApexAxisChartSeries = [
			{name:'Gen. Increase',data:[], color: "#009688"},
			{name:'Gen. Decrease',data:[], color: "#F44336"},
			{name:'Succ. Increase',data:[], color: "#004D40"},
			{name:'Succ. Decrease',data:[], color: "#B71C1C"},
		];
		const maxLength: number = 
			this.cert!.classification_evaluation.increase_num > this.cert!.classification_evaluation.decrease_num ?
				this.cert!.classification_evaluation.increase_num: this.cert!.classification_evaluation.decrease_num;
		for (let i = 0; i < maxLength; i++) {
			if (i < this.cert!.classification_evaluation.increase_list.length) {
				series[0].data.push(<any>[i, this._utils.outputNumber(this.cert!.classification_evaluation.increase_list[i], {dp: 3})]);
			}
			if (i < this.cert!.classification_evaluation.decrease_list.length) {
				series[1].data.push(<any>[i, this._utils.outputNumber(this.cert!.classification_evaluation.decrease_list[i], {dp: 3})]);
			}
			if (i < this.cert!.classification_evaluation.increase_successful_list.length) {
				series[2].data.push(<any>[i, this._utils.outputNumber(this.cert!.classification_evaluation.increase_successful_list[i], {dp: 3})]);
			}
			if (i < this.cert!.classification_evaluation.decrease_successful_list.length) {
				series[3].data.push(<any>[i, this._utils.outputNumber(this.cert!.classification_evaluation.decrease_successful_list[i], {dp: 3})]);
			}
		}
		this.classProbs = this._chart.getScatterChartOptions(
			{
				chart: {
					height: 600, 
					type: 'scatter',
					animations: { enabled: false}, 
					toolbar: {show: true, tools: {download: false}}, 
					zoom: {enabled: true, type: 'xy'},
				},
				series: series,
			},600,true,{min: 0.5, max: 1}
		);
	}







	/**
	 * Builds the certificate's Test Dataset Charts.
	 * @returns void
	 */
	private buildCertificateTestDatasetCharts(): void {
		// Build the Test DS Evaluation
		this.testDSEvaluation = this._chart.getBarChartOptions(
			{
				series: [{name:'Loss',data:[this.cert!.test_evaluation[0]]},{name:'Accuracy',data:[this.cert!.test_evaluation[1]]}], 
				colors: [this._chart.downwardColor, this._chart.upwardColor],
				xaxis: {categories: [this.cert!.id], labels: {show: false}},
				yaxis: {labels: {show: false}},
				plotOptions: { bar: { horizontal: false, borderRadius: 4, columnWidth: "20%",}},
			}, 
			[this.cert!.id], 
			300
		);

		// Build the Loss Chart
		this.testDSLoss = this._chart.getLineChartOptions(
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
			}, 300, true
		);


		// Build the Accuracy Chart
		const accData: IAccuracyChartData = this.getAccuracyChartData();
		this.testDSAccuracy = this._chart.getLineChartOptions(
			{
				series: [
					{name: accData.accuracy.name, data: accData.accuracy.data, color: "#4DB6AC"},
					{name: accData.val_accuracy.name, data: accData.val_accuracy.data, color: "#004D40"}
				],
				stroke: {curve: "straight", dashArray: [0, 5]}
			}, 300, true
		);
	}








	/**
	 * Returns the accuracy data that will be charted in the certificate section.
	 * @returns IAccuracyChartData
	 */
	private getAccuracyChartData(): IAccuracyChartData {
		if (this.cert!.training_history.categorical_accuracy) {
			return {
				accuracy: {
					name: 'categorical_accuracy',
					data: this.cert!.training_history.categorical_accuracy!.map(val => { return <number>this._utils.outputNumber(val, {dp: 5})})
				},
				val_accuracy: {
					name: 'val_categorical_accuracy',
					data: this.cert!.training_history.val_categorical_accuracy!.map(val => { return <number>this._utils.outputNumber(val, {dp: 5})})
				}
			}
		} else {
			return {
				accuracy: {
					name: 'binary_accuracy',
					data: this.cert!.training_history.binary_accuracy!.map(val => { return <number>this._utils.outputNumber(val, {dp: 5})})
				},
				val_accuracy: {
					name: 'val_binary_accuracy',
					data: this.cert!.training_history.val_binary_accuracy!.map(val => { return <number>this._utils.outputNumber(val, {dp: 5})})
				}
			}
		}
	}




















	/* Misc Helpers */




	/**
	 * Based on the total number of certificates, it determines the best height
	 * for bar charts.
	 * @param certificates
	 * @returns number
	 */
	 private getBarChartBaseHeight(certificates: number): number {
		if (certificates <= 1) 			{ return 100 }
		if (certificates <= 5) 			{ return 300 }
		if (certificates <= 7) 			{ return 350 }
		if (certificates <= 10) 		{ return 400 }
		if (certificates <= 13) 		{ return 450 }
		if (certificates <= 15) 		{ return 500 }
		if (certificates <= 17) 		{ return 550 }
		if (certificates <= 20) 		{ return 600 }
		if (certificates <= 23) 		{ return 650 }
		if (certificates <= 25) 		{ return 700 }
		if (certificates <= 27) 		{ return 750 }
		if (certificates <= 30) 		{ return 800 }
		if (certificates <= 33) 		{ return 850 }
		if (certificates <= 35) 		{ return 900 }
		if (certificates <= 37) 		{ return 950 }
		if (certificates <= 40) 		{ return 1000 }
		if (certificates <= 43) 		{ return 1050 }
		if (certificates <= 45) 		{ return 1100 }
		if (certificates <= 47) 		{ return 1150 }
		if (certificates <= 50) 		{ return 1200 }
		if (certificates <= 53) 		{ return 1250 }
		if (certificates <= 55) 		{ return 1300 }
		if (certificates <= 57) 		{ return 1350 }
		if (certificates <= 60) 		{ return 1400 }
		if (certificates <= 63) 		{ return 1450 }
		if (certificates <= 65) 		{ return 1500 }
		if (certificates <= 67) 		{ return 1550 }
		if (certificates <= 70) 		{ return 1600 }
		if (certificates <= 75) 		{ return 1700 }
		if (certificates <= 80) 		{ return 1800 }
		if (certificates <= 90) 		{ return 1900 }
		if (certificates <= 100) 		{ return 2100 }
		if (certificates <= 110) 		{ return 2300 }
		if (certificates <= 120) 		{ return 2500 }
		if (certificates <= 130) 		{ return 2700 }
		if (certificates <= 140) 		{ return 2900 }
		if (certificates <= 150) 		{ return 3100 }
		if (certificates <= 160) 		{ return 3300 }
		if (certificates <= 170) 		{ return 3500 }
		if (certificates <= 180) 		{ return 3700 }
		if (certificates <= 190) 		{ return 3900 }
		else 							{ return 4100 }
	}
}
