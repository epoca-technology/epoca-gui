import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AbstractControl, FormControl, FormGroup } from '@angular/forms';
import { MatSidenav } from '@angular/material/sidenav';
import {MatDialog} from '@angular/material/dialog';
import { MatBottomSheetRef } from "@angular/material/bottom-sheet";
import { Subscription } from 'rxjs';
import { 
	UtilsService, 
	IRegressionsOrder,
	RegressionService,
	IRegressionTrainingCertificate,
	IRegressionConfig
} from '../../../core';
import { 
	AppService, 
	ChartService, 
	IBarChartOptions, 
	ILayout, 
	ModelSelectionService, 
	NavService,
	ValidationsService, 
} from '../../../services';
import { 
	EpochBuilderConfigDialogComponent, 
	IDiscoveryRecord, 
	IEpochBuilderConfigDialog, 
	IEpochBuilderConfigDialogResponse, 
	ILearningCurve
} from "../shared";
import { IRegressionsComponent, IViewID, IView } from "./interfaces";

@Component({
  selector: 'app-regressions',
  templateUrl: './regressions.component.html',
  styleUrls: ['./regressions.component.scss']
})
export class RegressionsComponent implements OnInit, OnDestroy, IRegressionsComponent {
	// Sidenav Element
	@ViewChild('krSidenav') krSidenav: MatSidenav|undefined;
	public krSidenavOpened: boolean = false;

	// Layout
	public layout: ILayout = this._app.layout.value;
	private layoutSub?: Subscription;

	// File Input Form
    public fileInputForm: FormGroup = new FormGroup({ fileInput: new FormControl('', [ ]) });

	// Initialization
	public loadingFromDB: boolean = false;
	public initialized: boolean = false;
	public initializing: boolean = false;

	// Order
	public order: IRegressionsOrder = "ebe_points";

	// Views
	public readonly views: IView[] = [
		{id: "ebe_points", name: "EBE Points", icon: "query_stats"},
		{id: "test_ds_evaluation", name: "Test Dataset Evaluations", icon: "playlist_add_check"},
		{id: "discovery", name: "Discovery", icon: "tune"},
		{id: "hyperparams", name: "Hyperparams", icon: "settings_suggest"},
		{id: "epochs", name: "Epochs", icon: "format_list_numbered"},
	]
	public readonly viewNames = {
		ebe_points: "EBE Points",
		test_ds_evaluation: "Test Dataset Evaluations",
		discovery: "Discovery",
		hyperparams: "Hyperparams",
		epochs: "Epochs",
	}
	public activeView: IViewID = "ebe_points";

	// Test Dataset Evaluations View
	public testDatasetEvaluationsView?: {
		mean_absolute_error?: IBarChartOptions,
		mean_squared_error?: IBarChartOptions
	};

	// Discovery View
	public discoveryPayloadRecords?: IDiscoveryRecord[];

	// Certificate View
	public certificateView?: {
		// Training
		lossCurve: ILearningCurve,
		lossMetricCurve: ILearningCurve,
	};
	public cert?: IRegressionTrainingCertificate;
	public activeCertTabIndex: number = 0;
	public learningCurveTab: number = 0;

	// Loading state - Just for certificates
	public loaded: boolean = false;

	constructor(
		public _nav: NavService,
		public _app: AppService,
		private _chart: ChartService,
		private _utils: UtilsService,
		public _kr: RegressionService,
		public _selection: ModelSelectionService,
		private dialog: MatDialog,
        private route: ActivatedRoute,
		private _validations: ValidationsService
	) { }



	ngOnInit(): void {
		// Init the layout
		this.layoutSub = this._app.layout.subscribe((nl: ILayout) => this.layout = nl);

        // Check if a Certificate ID was provided from the URL. If so, initialize it right away.
        const certID: string|null = this.route.snapshot.paramMap.get("certID");
        if (typeof certID == "string" && this._validations.modelIDValid(certID)) { 
            this.initWithID(certID);
        }
	}
	

	ngOnDestroy(): void {
		if (this.layoutSub) this.layoutSub.unsubscribe();
		this._kr.reset();
	}



    /* Form Getters */
	get fileInput(): AbstractControl { return <AbstractControl>this.fileInputForm.get('fileInput') }







	/* Initialization */



	/**
	 * Initializes the certificate from an ID that was passed 
	 * through the URL.
	 * @param id 
	 * @returns Promise<void>
	 */
	 private async initWithID(id: string): Promise<void> {
		// Attempt to initiaze the certificate
		try {
			// Set loading state
			this.loadingFromDB = true;

			// Pass the files to the service
			await this._kr.init(id, this.order, 1);

			// Navigate straight to the certificate
			await this.navigate("certificate", 0)

			// Mark the component as initialized
			this.initialized = true;
		} catch (e) {
			this.fileInput.setValue('');
			this._app.error(e)
		}

		// Set loading state
		this.loadingFromDB = false;
	}





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
		this.dialog.open(EpochBuilderConfigDialogComponent, {
			hasBackdrop: this._app.layout.value != 'mobile', // Mobile optimization
			panelClass: 'small-dialog',
			disableClose: true,
			data: <IEpochBuilderConfigDialog>{
				title: "Regressions",
				items: [
					{
						id: "ebe_points",
						name: "EBE Points",
						description: "Certificates will be ordered by the points scored in the Epoch Builder Evaluation.",
						icon: "query_stats"
					},
					{
						id: "mae",
						name: "Mean Absolute Error",
						description: "Certificates will be ordered by the mean absolute error received in the test dataset evaluation.",
						icon: "trending_down"
					},
					{
						id: "mse",
						name: "Mean Squared Error",
						description: "Certificates will be ordered by the mean squared error received in the test dataset evaluation.",
						icon: "trending_down"
					},
					{
						id: "discovery_points",
						name: "Discovery Points",
						description: "Certificates will be ordered by the points obtained during the regression discovery process.",
						icon: "timeline"
					},
					{
						id: "discovery_accuracy",
						name: "Discovery Accuracy",
						description: "Certificates will be ordered by the accuracy obtained during the regression discovery process.",
						icon: "ads_click"
					}
				]
			}
		}).afterClosed().subscribe(async (response: IEpochBuilderConfigDialogResponse|undefined) => {
			if (response) {
				// Attempt to initiaze the certificates
				try {
					// Pass the files to the service
					await this._kr.init(event, response.id, response.limit);
					
					// Set the order
					this.order = response.id;

					// If there is only 1 certificate, navigate straight to it
					if (this._kr.certificates.length == 1) { await this.navigate("certificate", 0) } 
					
					// Otherwise, navigate to the ebe points
					else { await this.navigate("ebe_points") }

					// Mark the backtest as initialized
					this.initialized = true;
				} catch (e) {
					this.fileInput.setValue('');
					this._app.error(e)
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
		this.testDatasetEvaluationsView = undefined;
		this.discoveryPayloadRecords = undefined;
		this.certificateView = undefined;
		this.cert = undefined;
		this.activeCertTabIndex = 0;
		this.learningCurveTab = 0;
	}






	/**
	 * Builds a list of all the active regressions and
	 * displays them in a menu. Once a selection is made,
	 * the certificate is retrieved from the db
	 */
	public activateActiveRegression(): void {
		// Display the bottom sheet and handle the action
		const bs: MatBottomSheetRef = this._nav.displayBottomSheetMenu(
			this._app.epoch.value!.model.regressions.map((r: IRegressionConfig) => {
				return {
					icon: "show_chart",
					title: "Regression Model",
					description: r.id,
					response: r.id
				}
			})
		);
		bs.afterDismissed().subscribe(async (response: string|undefined) => {
			if (typeof response == "string") { this.initWithID(response) }
		});
	}










	/* Navigation */





	/**
	 * Navigates to any section of the component
	 * @param viewID 
	 * @param certIndexOrID?
	 * @returns Promise<void>
	 */
	public async navigate(viewID: IViewID, certIndexOrID?: number|string): Promise<void> {
		// Close the sidenav if opened
		if (this.krSidenavOpened) this.krSidenav?.close();

		// Scroll top
		this._nav.scrollTop('#content-header');

		// Set Loading State
		this.loaded = false;

		// Populate the active view
		this.activeView = viewID;

		// Navigate to the EBE Points View
		if (this.activeView == "ebe_points") { this.buildEBEPointsView() }

		// Navigate to the Test Datasets Evaluations View
		else if (this.activeView == "test_ds_evaluation" && !this.testDatasetEvaluationsView) { this.buildTestDatasetEvaluationsView() }

		// Navigate to the Discovery View
		else if (this.activeView == "discovery" && !this.discoveryPayloadRecords) { this.buildDiscoveryView() }

		// Navigate to the Hyperparams View
		else if (this.activeView == "hyperparams") { this.buildHyperparamsView() }

		// Navigate to the Epochs View
		else if (this.activeView == "epochs") { this.buildEpochsView() }

		// Navigate to a certificate
		else if (this.activeView == "certificate" && (typeof certIndexOrID == "number" || typeof certIndexOrID == "string")) { this.buildCertificatesView(certIndexOrID) }

		// Allow a small delay
		await this._utils.asyncDelay(0.5);

		// Update loading state
		this.loaded = true;
	}






	/* Views Building */




	/**
	 * Builds the EBE Points View.
	 */
	private buildEBEPointsView(): void { /* Builds in the subcomponent */ }





	/**
	 * Builds the test dataset evaluations view
	 */
	private buildTestDatasetEvaluationsView(): void {
		// Init the chart values
		let mean_absolute_error: IBarChartOptions;
		let mean_squared_error: IBarChartOptions;

		// Init the errors
		let mae: number[] = [];
		let mse: number[] = [];

		// Iterate over each single shot cert and append the corresponding values
		this._kr.certificates.forEach((c) => {
			mae.push(<number>this._utils.outputNumber(c.test_ds_evaluation.mean_absolute_error, {dp: 6}));
			mse.push(<number>this._utils.outputNumber(c.test_ds_evaluation.mean_squared_error, {dp: 6}));
		});

		// Build the view
		const ids: string[] = this._kr.certificates.map((c) => c.id);
		mean_absolute_error = this._chart.getBarChartOptions(
			{series: [{name: "Mean Absolute Error", data: mae, color: this._chart.downwardColor}]}, 
			ids, 
			this.getBarChartHeight(ids.length),
		);
		mean_squared_error = this._chart.getBarChartOptions(
			{series: [{name: "Mean Squared Error", data: mse, color: this._chart.downwardColor}]}, 
			ids, 
			this.getBarChartHeight(ids.length)
		);

		// Add the click events
		const self = this;
		mean_absolute_error.chart.events = {
			click: function(e: any, cc: any, c: any) {
				if (c.dataPointIndex >= 0) setTimeout(() => {self.navigate("certificate", ids[c.dataPointIndex])}, 300)
			}
		};
		mean_squared_error.chart.events = {
			click: function(e: any, cc: any, c: any) {
				if (c.dataPointIndex >= 0) setTimeout(() => {self.navigate("certificate", ids[c.dataPointIndex])}, 300)
			}
		};

		// Finally, populate the view's variable
		this.testDatasetEvaluationsView = { 
			mean_absolute_error: mean_absolute_error, 
			mean_squared_error: mean_squared_error
		}
	}







	/**
	 * Builds the Discovery View as well as all the sub views.
	 */
	private buildDiscoveryView(): void {
		// Build the discovery payload records
		this.discoveryPayloadRecords = this._kr.certificates.map((c) => { return { id: c.id, discovery: c.discovery } })

		/* The view itself is built in the subcomponent */
	}





	/**
	 * Builds the Hyperparams View.
	 */
	private buildHyperparamsView(): void { /* Builds in the subcomponent */ }





	/**
	 * Builds the Epochs View
	 */
	private buildEpochsView(): void { /* Builds in the subcomponent */ }





	/**
	 * Builds the Certificate View as well as the sub views.
	 */
	private buildCertificatesView(certIndexOrID: number|string): void {
		// Init the certificate index
		const certIndex: number = typeof certIndexOrID == "number" ? certIndexOrID: this._kr.ids.indexOf(certIndexOrID);

		// Populate the active certificate
		this.cert = this._kr.certificates[certIndex];

		// Finally, build the view
		this.certificateView = {
			lossCurve: {
				name: this.cert.loss == "mean_absolute_error" ? "Mean Absolute Error": "Mean Squared Error",
				type: "loss",
				train: this.cert.training_history.loss,
				val: this.cert.training_history.val_loss
			},
			lossMetricCurve: {
				name: this.cert.loss == "mean_absolute_error" ? "Mean Squared Error": "Mean Absolute Error",
				type: "loss",
				train: <number[]>this.cert.training_history.mean_absolute_error || <number[]>this.cert.training_history.mean_squared_error,
				val: <number[]>this.cert.training_history.val_mean_absolute_error || <number[]>this.cert.training_history.val_mean_squared_error,
			},
		};
	}













	/* Misc Helpers */





	/**
	 * Returns the optimal bar chart height based on the number of models.
	 * @returns number
	 */
	private getBarChartHeight(certificatesLength?: number, itemsPerCategory?: number): number {
		return this._chart.calculateChartHeight(
			110, 
			20, 
			typeof certificatesLength == "number" ? certificatesLength: this._kr.certificates.length, 
			itemsPerCategory
		);
	}

}
