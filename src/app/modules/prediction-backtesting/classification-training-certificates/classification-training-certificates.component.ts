import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormControl, FormGroup } from '@angular/forms';
import { MatSidenav } from '@angular/material/sidenav';
import { ApexAxisChartSeries } from 'ng-apexcharts';
import { Subscription } from 'rxjs';
import { 
	ClassificationTrainingService, 
	PredictionService, 
	UtilsService, 
	IClassificationTrainingCertificate 
} from '../../../core';
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
import { IClassificationTrainingCertificatesComponent, ISection, ISectionID, IAccuracyChartData } from './interfaces';

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

	// Navigation
	public readonly generalSections: ISection[] = [
		{id: 'evaluations', name: 'Evaluations', icon: 'rule'},
		{id: 'epochs', name: 'Epochs', icon: 'format_list_numbered'}
	]
	public section: ISection = this.generalSections[0];
	public cert?: IClassificationTrainingCertificate;
	public activeTabIndex: number = 0;

	// Summary Charts
	public evaluations?: IBarChartOptions;
	public epochs?: IBarChartOptions;

	// Certificates Charts
	public loss?: ILineChartOptions;
	public accuracy?: ILineChartOptions;

	// Loading state - Just for certificates
	public loaded: boolean = false;


	constructor(
		public _nav: NavService,
		private _snackbar: SnackbarService,
		public _clipboard: ClipboardService,
		private _app: AppService,
		private _chart: ChartService,
		private _utils: UtilsService,
		public _training: ClassificationTrainingService
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
			await this._training.init(event);

			// Build the summary charts
			this.buildSummaryCharts();

			// Activate the proper section based on the number of certificates
			if (this._training.certificates.length == 1) {
				// Navigate to the certificate
				await this.navigate('certificate', 0);
			} else { 
				// Navigate to evaluations
				await this.navigate('evaluations');
			}

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
	 * @param certIndex?
	 * @returns Promise<void>
	 */
	public async navigate(sectionID: ISectionID, certIndex?: number): Promise<void> {
		// Close the sidenav if opened
		if (this.classTrainingCertificatesSidenavOpened) this.classTrainingCertificatesSidenav?.close();

		// Scroll top
		this._nav.scrollTop('#content-header')

		// Navigate to the evaluations section
		if (sectionID == 'evaluations') {
			this.section = this.generalSections[0];
			this.cert = undefined;
			this.activeTabIndex = 0;
		}

		// Navigate to the epochs section
		else if (sectionID == 'epochs') {
			this.section = this.generalSections[1];
			this.cert = undefined;
			this.activeTabIndex = 0;
		}

		// Navigate to a certificate
		else if (sectionID == 'certificate' && typeof certIndex == "number") {
			this.loaded = false;
			this.cert = this._training.certificates[certIndex];
			this.buildCertificateCharts();
			this.section = {id: "certificate", name: this.cert.id};
			await this._utils.asyncDelay(0.5);
			this.loaded = true;
		}

		// Otherwise, throw an error
		else { throw new Error("Invalid navigation parameters.") }
	}







	/* Chart Builders */





	
	/**
	 * Builds the summary charts data.
	 * @returns void
	 */
	 private buildSummaryCharts(): void {
		// Get the Epochs chart height
		const epochsHeight: number = this.getEpochsChartHeight();

		/* Build the Evaluations Chart */
		
		// Init the chart data
		let series: ApexAxisChartSeries = [{name:'Loss',data:[]},{name:'Accuracy',data:[]}];

		// Iterate over each model building the data
		for (let evaluation of this._training.evals) {
			series[0].data.push(<any>evaluation.loss);
			series[1].data.push(<any>evaluation.accuracy);
		}

		// Build the positions chart options
		this.evaluations = this._chart.getBarChartOptions(
			{
				series: series, 
				colors: [this._chart.downwardColor, this._chart.upwardColor]
			}, 
			this._training.ids, 
			Math.round(epochsHeight*1.5)
		);


		/* Build the Epochs Chart */

		// Build the positions chart options
		this.epochs = this._chart.getBarChartOptions(
			{
				series: [{name: "Epochs", data: this._training.epochs}], 
				colors: ["#000000"],
			}, 
			this._training.ids, 
			epochsHeight
		);
	}







	/**
	 * Builds the charts for a certificate.
	 * @returns void
	 */
	public buildCertificateCharts(): void {
		// Build the Loss Chart
		this.loss = this._chart.getLineChartOptions(
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
		this.accuracy = this._chart.getLineChartOptions(
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
	 * for the epochs chart.
	 * @returns number
	 */
	 private getEpochsChartHeight(): number {
		if (this._training.certificates.length <= 5) 		{ return 300 }
		if (this._training.certificates.length <= 7) 		{ return 350 }
		if (this._training.certificates.length <= 10) 		{ return 400 }
		if (this._training.certificates.length <= 13) 		{ return 450 }
		if (this._training.certificates.length <= 15) 		{ return 500 }
		if (this._training.certificates.length <= 17) 		{ return 550 }
		if (this._training.certificates.length <= 20) 		{ return 600 }
		if (this._training.certificates.length <= 23) 		{ return 650 }
		if (this._training.certificates.length <= 25) 		{ return 700 }
		if (this._training.certificates.length <= 27) 		{ return 750 }
		if (this._training.certificates.length <= 30) 		{ return 800 }
		if (this._training.certificates.length <= 33) 		{ return 850 }
		if (this._training.certificates.length <= 35) 		{ return 900 }
		if (this._training.certificates.length <= 37) 		{ return 950 }
		if (this._training.certificates.length <= 40) 		{ return 1000 }
		if (this._training.certificates.length <= 43) 		{ return 1050 }
		if (this._training.certificates.length <= 45) 		{ return 1100 }
		if (this._training.certificates.length <= 47) 		{ return 1150 }
		if (this._training.certificates.length <= 50) 		{ return 1200 }
		if (this._training.certificates.length <= 53) 		{ return 1250 }
		if (this._training.certificates.length <= 55) 		{ return 1300 }
		if (this._training.certificates.length <= 57) 		{ return 1350 }
		if (this._training.certificates.length <= 60) 		{ return 1400 }
		if (this._training.certificates.length <= 63) 		{ return 1450 }
		if (this._training.certificates.length <= 65) 		{ return 1500 }
		if (this._training.certificates.length <= 67) 		{ return 1550 }
		if (this._training.certificates.length <= 70) 		{ return 1600 }
		if (this._training.certificates.length <= 75) 		{ return 1700 }
		if (this._training.certificates.length <= 80) 		{ return 1800 }
		if (this._training.certificates.length <= 90) 		{ return 1900 }
		else 												{ return 2000 }
	}
}
