import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormControl, FormGroup } from '@angular/forms';
import { MatSidenav } from '@angular/material/sidenav';
import {MatDialog} from '@angular/material/dialog';
import { ApexAxisChartSeries } from 'ng-apexcharts';
import { Subscription } from 'rxjs';
import { 
	UtilsService, 
	IModel,
	IKerasRegressionsOrder,
	KerasRegressionService,
	IKerasRegressionTrainingCertificate
} from '../../../core';
import { 
	AppService, 
	ChartService, 
	IBarChartOptions, 
	ILayout, 
	ILineChartOptions, 
	IPieChartOptions, 
	ModelSelectionService, 
	NavService, 
} from '../../../services';
import { 
	EpochBuilderConfigDialogComponent, 
	IDiscoveryPayloadRecord, 
	IEpochBuilderConfigDialog, 
	IEpochBuilderConfigDialogResponse 
} from "../shared";
import { IKerasRegressionsComponent, IViewID, IView } from "./interfaces";

@Component({
  selector: "app-keras-regressions",
  templateUrl: "./keras-regressions.component.html",
  styleUrls: ["./keras-regressions.component.scss"]
})
export class KerasRegressionsComponent implements OnInit, OnDestroy, IKerasRegressionsComponent {
	// Sidenav Element
	@ViewChild('krSidenav') krSidenav: MatSidenav|undefined;
	public krSidenavOpened: boolean = false;

	// Layout
	public layout: ILayout = this._app.layout.value;
	private layoutSub?: Subscription;

	// File Input Form
    public fileInputForm: FormGroup = new FormGroup({ fileInput: new FormControl('', [ ]) });

	// Initialization
	public initialized: boolean = false;
	public initializing: boolean = false;

	// Order
	public order: IKerasRegressionsOrder = "ebe_points";

	// Views
	public readonly views: IView[] = [
		{id: "ebe_points", name: "EBE Points", icon: "query_stats"},
		{id: "single_shot_test_datasets", name: "Single Shot Test Datasets", icon: "playlist_add_check"},
		{id: "autoregressive_test_datasets", name: "Autoregressive Test Datasets", icon: "playlist_add_check"},
		{id: "discovery", name: "Discovery", icon: "tune"},
		{id: "hyperparams", name: "Hyperparams", icon: "settings_suggest"},
		{id: "epochs", name: "Epochs", icon: "format_list_numbered"},
	]
	public readonly viewNames = {
		ebe_points: "EBE Points",
		single_shot_test_datasets: "Single Shot Test Datasets",
		autoregressive_test_datasets: "Autoregressive Test Datasets",
		discovery: "Discovery",
		hyperparams: "Hyperparams",
		epochs: "Epochs",
	}
	public activeView: IViewID = "ebe_points";

	// Single Shot Test Datasets View
	public singleShotTestDatasetsView?: {
		mean_absolute_error?: IBarChartOptions,
		mean_squared_error?: IBarChartOptions
	};

	// Single Shot Test Datasets View
	public autoregressiveTestDatasetsView?: {
		mean_absolute_error?: IBarChartOptions,
		mean_squared_error?: IBarChartOptions
	};

	// Discovery View
	public discoveryPayloadRecords?: IDiscoveryPayloadRecord[];

	// Certificate View
	public certificateView?: any;
	public cert?: IKerasRegressionTrainingCertificate;


	// Loading state - Just for certificates
	public loaded: boolean = false;

	constructor(
		public _nav: NavService,
		private _app: AppService,
		private _chart: ChartService,
		private _utils: UtilsService,
		public _kr: KerasRegressionService,
		public _selection: ModelSelectionService,
		private dialog: MatDialog,
	) { }



	ngOnInit(): void {
		this.layoutSub = this._app.layout.subscribe((nl: ILayout) => this.layout = nl);
	}

	ngOnDestroy(): void {
		if (this.layoutSub) this.layoutSub.unsubscribe();
		this._kr.reset();
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
		this.dialog.open(EpochBuilderConfigDialogComponent, {
			hasBackdrop: this._app.layout.value != 'mobile', // Mobile optimization
			panelClass: 'small-dialog',
			disableClose: true,
			data: <IEpochBuilderConfigDialog>{
				title: "Keras Regressions",
				items: [
					{
						id: "ebe_points",
						name: "EBE Points",
						description: "Certificates will be ordered by the points scored in the Epoch Builder Evaluation.",
						icon: "query_stats"
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

					// If it is ordered by Discovery Accuracy, activate that section
					else if (this.order == "discovery_accuracy") { await this.navigate("discovery") }
					
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
		this.singleShotTestDatasetsView = undefined;
		this.autoregressiveTestDatasetsView = undefined;
		this.discoveryPayloadRecords = undefined;
		this.certificateView = undefined;
		this.cert = undefined;
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

		// Navigate to the Single Shot Test Datasets View
		else if (this.activeView == "single_shot_test_datasets" && !this.singleShotTestDatasetsView) { this.buildSingleShotTestDatasetsView() }

		// Navigate to the Autoregressive Test Datasets View
		else if (this.activeView == "autoregressive_test_datasets" && !this.autoregressiveTestDatasetsView) { this.buildAutoregressiveTestDatasetsView() }

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
	 * Builds the Single Shot Test Datasets View
	 */
	private buildSingleShotTestDatasetsView(): void { this.singleShotTestDatasetsView = this.buildTestDatasetsView(false) }




	/**
	 * Builds the Autoregressive Test Datasets View
	 */
	 private buildAutoregressiveTestDatasetsView(): void {this.autoregressiveTestDatasetsView = this.buildTestDatasetsView(true) }





	/**
	 * Builds the test dataset view for a specific type of regression.
	 * @param autoregressive 
	 * @returns {mean_absolute_error?: IBarChartOptions, mean_squared_error?: IBarChartOptions}
	 */
	private buildTestDatasetsView(autoregressive: boolean): {mean_absolute_error?: IBarChartOptions, mean_squared_error?: IBarChartOptions} {
		// Init the single shot certificates
		const certs: IKerasRegressionTrainingCertificate[] = this._kr.certificates.slice().filter(c => c.autoregressive == autoregressive);

		// Check if there are single shot regressions
		if (certs.length > 0) {
			// Init the chart values
			let mean_absolute_error: IBarChartOptions;
			let mean_squared_error: IBarChartOptions;

			// Init the errors
			let mae: number[] = [];
			let mse: number[] = [];

			// Iterate over each single shot cert and append the corresponding values
			certs.forEach((c) => {
				mae.push(<number>this._utils.outputNumber(c.loss == "mean_absolute_error" ? c.test_evaluation[0]: c.test_evaluation[1], {dp: 6}));
				mse.push(<number>this._utils.outputNumber(c.loss == "mean_squared_error" ? c.test_evaluation[0]: c.test_evaluation[1], {dp: 6}));
			});

			// Build the view
			const ids: string[] = certs.map((c) => c.id);
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

			// Finally, return the view's data
			return { mean_absolute_error: mean_absolute_error, mean_squared_error: mean_squared_error}
		}

		// Otherwise, there is no data to show
		else {
			return { mean_absolute_error: undefined, mean_squared_error: undefined };
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

		//
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






	/**
	 * Retrieves the click event for a chart that will activate a certificate
	 * based on its index.
	 * @returns any
	 */
	private getActivateCertificateChartClickEvent(): any {
		const self = this;
		return {
			click: function(e: any, cc: any, c: any) {
				if (c.dataPointIndex >= 0) setTimeout(() => {self.navigate("certificate", c.dataPointIndex)}, 300)
			}
		}
	}
}
