import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormControl, FormGroup } from '@angular/forms';
import { MatSidenav } from '@angular/material/sidenav';
import {MatDialog} from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { 
	UtilsService, 
	PredictionModelService,
	IPredictionModelCertificate,
	IPredictionModelsOrder,
	IBacktestPosition
} from '../../../core';
import { 
	AppService, 
	ChartService, 
	IBarChartOptions, 
	ILayout, 
	ILineChartOptions, 
	IPieChartOptions, 
	IScatterChartOptions, 
	ModelSelectionService, 
	NavService, 
} from '../../../services';
import { 
	EpochBuilderConfigDialogComponent, 
	IDiscoveryRecord, 
	IEpochBuilderConfigDialog, 
	IEpochBuilderConfigDialogResponse, 
} from "../shared";
import { IPredictionModelsComponent, IViewID, IView } from "./interfaces";
import { ApexAxisChartSeries } from 'ng-apexcharts';
import { BigNumber} from "bignumber.js";
import { PredictionModelBacktestPositionDialogComponent, IBacktestPositionDialogData } from './prediction-model-backtest-position-dialog';


@Component({
  selector: 'app-prediction-models',
  templateUrl: './prediction-models.component.html',
  styleUrls: ['./prediction-models.component.scss']
})
export class PredictionModelsComponent implements OnInit, OnDestroy, IPredictionModelsComponent {
	// Sidenav Element
	@ViewChild('pmSidenav') pmSidenav: MatSidenav|undefined;
	public pmSidenavOpened: boolean = false;

	// Layout
	public layout: ILayout = this._app.layout.value;
	private layoutSub?: Subscription;

	// File Input Form
    public fileInputForm: FormGroup = new FormGroup({ fileInput: new FormControl('', [ ]) });

	// Initialization
	public initialized: boolean = false;
	public initializing: boolean = false;

	// Order
	public order: IPredictionModelsOrder = "ebe_points";

	// Views
	public readonly views: IView[] = [
		{id: "ebe_points", name: "EBE Points", icon: "query_stats"},
		{id: "backtest", name: "Backtest", icon: "price_check"},
		{id: "discovery", name: "Discovery", icon: "tune"},
	]
	public readonly viewNames = {
		ebe_points: "EBE Points",
		backtest: "Backtest",
		discovery: "Discovery"
	}
	public activeView: IViewID = "ebe_points";

	// Backtest View
	public backtestView?: {
		profit?: IBarChartOptions,
		balanceHist?: ILineChartOptions,
		accuracy?: IBarChartOptions,
		position?: IBarChartOptions,
		fee?: IBarChartOptions,
	};
	public activeBacktestTabIndex: number = 0;
	public activeBacktestBadge: number = 0;

	// Discovery View
	public discoveryPayloadRecords?: IDiscoveryRecord[];

	// Certificate View
	public certificateView?: {
		accuracy: IBarChartOptions,
		predictionInsight: IScatterChartOptions,
		balanceHist: IBarChartOptions,
		positions: IPieChartOptions,
		outcomes: IPieChartOptions,
	};
	public cert?: IPredictionModelCertificate;
	public activeCertTabIndex: number = 0;
	public insightsVisible: boolean = false;
	public visiblePositions: number = 15;

	// Loading state - Just for certificates
	public loaded: boolean = false;

	constructor(
		public _nav: NavService,
		public _app: AppService,
		private _chart: ChartService,
		private _utils: UtilsService,
		public _pm: PredictionModelService,
		public _selection: ModelSelectionService,
		private dialog: MatDialog,
	) { }



	ngOnInit(): void {
		this.layoutSub = this._app.layout.subscribe((nl: ILayout) => this.layout = nl);
	}

	ngOnDestroy(): void {
		if (this.layoutSub) this.layoutSub.unsubscribe();
		this._pm.reset();
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
				title: "Prediction Models",
				items: [
					{
						id: "ebe_points",
						name: "EBE Points",
						description: "Certificates will be ordered by the points scored in the Epoch Builder Evaluation.",
						icon: "query_stats"
					},
					{
						id: "backtest_profit",
						name: "Backtest Profit",
						description: "Certificates will be ordered by the profit generated in the backtest process.",
						icon: "price_check"
					},
					{
						id: "backtest_accuracy",
						name: "Backtest Accuracy",
						description: "Certificates will be ordered by the accuracy obtained during the backtest process.",
						icon: "ads_click"
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
					await this._pm.init(event, response.id, response.limit);
					
					// Set the order
					this.order = response.id;

					// If there is only 1 certificate, navigate straight to it
					if (this._pm.certificates.length == 1) { await this.navigate("certificate", 0) } 
					
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
		this.backtestView = undefined;
		this.activeBacktestTabIndex = 0;
		this.activeBacktestBadge = 0;
		this.discoveryPayloadRecords = undefined;
		this.certificateView = undefined;
		this.cert = undefined;
		this.activeCertTabIndex = 0;
		this.insightsVisible = false;
		this.visiblePositions = 15;
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
		if (this.pmSidenavOpened) this.pmSidenav?.close();

		// Scroll top
		this._nav.scrollTop('#content-header');

		// Set Loading State
		this.loaded = false;

		// Populate the active view
		this.activeView = viewID;

		// Navigate to the EBE Points View
		if (this.activeView == "ebe_points") { this.buildEBEPointsView() }

		// Navigate to the Backtest View
		else if (this.activeView == "backtest" && !this.backtestView) { this.buildBacktestView() }

		// Navigate to the Discovery View
		else if (this.activeView == "discovery" && !this.discoveryPayloadRecords) { this.buildDiscoveryView() }

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
	  * Builds the backtest evaluations view
	  */
	 private buildBacktestView(): void {
		// Init values
		let profit: number[] = [];
		let balanceHist: ApexAxisChartSeries = [];
		let increaseAccuracy: number[] = [];
		let decreaseAccuracy: number[] = [];
		let accuracy: number[] = [];
		let increasePositions: number[] = [];
		let decreasePositions: number[] = [];
		let positions: number[] = [];
		let fees: number[] = [];

		// Iterate over each certificate and populate the values
		for (let i = 0; i < this._pm.certificates.length; i++) {
			// Append the profits
			profit.push(this._pm.certificates[i].backtest.profit);

			// Append the profit histories
			balanceHist.push({
				name: this._pm.certificates[i].id.slice(0, 12) + "...", 
				data: this._pm.certificates[i].backtest.positions.map((p) => <number>this._utils.outputNumber(p.b)), 
				color: this._chart.colors[i]
			});

			// Append the accuracies
			increaseAccuracy.push(this._pm.certificates[i].backtest.increase_accuracy);
			decreaseAccuracy.push(this._pm.certificates[i].backtest.decrease_accuracy);
			accuracy.push(this._pm.certificates[i].backtest.accuracy);

			// Append the positions
			increasePositions.push(this._pm.certificates[i].backtest.increase_num);
			decreasePositions.push(this._pm.certificates[i].backtest.decrease_num);
			positions.push(this._pm.certificates[i].backtest.increase_num + this._pm.certificates[i].backtest.decrease_num);

			// Append the fee
			fees.push(this._pm.certificates[i].backtest.fees)
		}


		// Populate the view
		this.backtestView = {
			profit: this._chart.getBarChartOptions(
				{series: [{name: "Profit", data: profit,}]}, 
				this._pm.ids, 
				this._chart.calculateChartHeight(110, 20, this._pm.ids.length, 1),
				true
			),
			balanceHist: this._chart.getLineChartOptions(
				{ series: balanceHist, stroke: {width: 5, curve: "straight"} }, 
				600, 
				true,
				undefined,
				this._chart.colors.slice(0, this._pm.certificates.length)
			),
			accuracy: this._chart.getBarChartOptions(
				{
					series: [
						{name:'Increase Acc.%', data: increaseAccuracy},
						{name:'Decrease Acc.%', data: decreaseAccuracy},
						{name:'General Acc.%', data: accuracy}
					], 
					colors: [this._chart.upwardColor, this._chart.downwardColor, "#000000"],
				}, 
				this._pm.ids, 
				this._chart.calculateChartHeight(110, 20, this._pm.certificates.length, 3)
			),
			position: this._chart.getBarChartOptions(
				{
					series: [
						{name:'Longs.', data: increasePositions},
						{name:'Shorts', data: decreasePositions},
						{name:'Total', data: positions}
					], 
					colors: [this._chart.upwardColor, this._chart.downwardColor, "#000000"],
				}, 
				this._pm.ids, 
				this._chart.calculateChartHeight(110, 20, this._pm.ids.length, 3)
			),
			fee: this._chart.getBarChartOptions(
				{series: [{name: "Fee", data: fees, color: "#000000"}]}, 
				this._pm.ids, 
				this._chart.calculateChartHeight(110, 20, this._pm.ids.length, 1)
			),
		}

		// Finally, Attach the click events
		const self = this;
		this.backtestView.profit!.chart.events = {
			click: function(e: any, cc: any, c: any) {
				if (c.dataPointIndex >= 0) setTimeout(() => {self.navigate("certificate", self._pm.ids[c.dataPointIndex])}, 300)
			}
		}
		this.backtestView.balanceHist!.chart.events = {
			click: function(e: any, cc: any, c: any) {
				if (c.dataPointIndex >= 0) setTimeout(() => {self.navigate("certificate", self._pm.ids[c.dataPointIndex])}, 300)
			}
		}
		this.backtestView.accuracy!.chart.events = {
			click: function(e: any, cc: any, c: any) {
				if (c.dataPointIndex >= 0) setTimeout(() => {self.navigate("certificate", self._pm.ids[c.dataPointIndex])}, 300)
			}
		}
		this.backtestView.position!.chart.events = {
			click: function(e: any, cc: any, c: any) {
				if (c.dataPointIndex >= 0) setTimeout(() => {self.navigate("certificate", self._pm.ids[c.dataPointIndex])}, 300)
			}
		}
		this.backtestView.fee!.chart.events = {
			click: function(e: any, cc: any, c: any) {
				if (c.dataPointIndex >= 0) setTimeout(() => {self.navigate("certificate", self._pm.ids[c.dataPointIndex])}, 300)
			}
		}
	 }
 
 
 
 
 
 
 
	 /**
	  * Builds the Discovery View as well as all the sub views.
	  */
	 private buildDiscoveryView(): void {
		 // Build the discovery payload records
		 this.discoveryPayloadRecords = this._pm.certificates.map((c) => { return { id: c.id, discovery: c.discovery } })
 
		 /* The view itself is built in the subcomponent */
	 }
 
 
 
 
 
 
	 /**
	  * Builds the Certificate View as well as the sub views.
	  */
	 private buildCertificatesView(certIndexOrID: number|string): void {
		 // Init the certificate index
		 const certIndex: number = typeof certIndexOrID == "number" ? certIndexOrID: this._pm.ids.indexOf(certIndexOrID);
 
		 // Populate the active certificate
		 this.cert = this._pm.certificates[certIndex];

		 // Retrieve the balance history data
		 const { colors, values } = this._chart.getModelBalanceHistoryData(this.cert.backtest.positions);
		 const minBalance: number = this._utils.getMin(values);
		 const maxBalance: number = this._utils.getMax(values);
 
		 // Finally, build the view
		 this.certificateView = {
			accuracy: this._chart.getBarChartOptions(
				{
					series: [
						{name: "Increase Acc.%", data: [this.cert.backtest.increase_accuracy]},
						{name: "Decrease Acc.%", data: [this.cert.backtest.decrease_accuracy]},
						{name: "General Acc.%", data: [this.cert.backtest.accuracy]}
					], 
					colors: [this._chart.upwardColor, this._chart.downwardColor, "#000000"],
					xaxis: {categories: [this.cert.id], labels: {show: false}},
					yaxis: {labels: {show: false}},
				}, 
				[this.cert.id], 
				130
			),
			balanceHist: this._chart.getBarChartOptions(
				{
					series: [{name: this.cert.id, data: values}],
					chart: {height: 350, type: 'bar',animations: { enabled: false}, toolbar: {show: true,tools: {download: false}}},
					plotOptions: {bar: {borderRadius: 0, horizontal: false, distributed: true,}},
					colors: colors,
					grid: {show: true},
					xaxis: {labels: { show: false } }
				}, 
				[], 
				undefined, 
				false,
				true,
				{min: minBalance, max: maxBalance}
			),
			predictionInsight: this._chart.getScatterChartOptions(
				{ 
					series: [{name: "Prediction", data: this.getPredictionInsightsData()}],
				},
				350,
			),
			positions: this._chart.getPieChartOptions(
				{
					series: [ this.cert.backtest.increase_num, this.cert.backtest.decrease_num],
					colors: [this._chart.upwardColor, this._chart.downwardColor],
					legend: {show: false}
				}, 
				["Longs", "Shorts"], 
				280
			),
			outcomes: this._chart.getPieChartOptions(
				{
					series: [this.cert.backtest.increase_outcome_num, this.cert.backtest.decrease_outcome_num],
					colors: [this._chart.upwardColor, this._chart.downwardColor],
					legend: {show: false}
				}, 
				["Increase", "Decrease"], 
				280
			),
		};
	 }





	/**
	 * Retrievs the prediction list for the active insight.
	 * @returns number[]
	 */
	private getPredictionInsightsData(): {x: number, y: number, fillColor: string}[] {
		// Init the preds
		let items: {x: number, y: number, fillColor: string}[] = [];

		// Iterate over each position
		for (let i = 0; i < this.cert!.backtest.positions.length; i++) {
			const predSum: number = <number>this._utils.outputNumber(BigNumber.sum.apply(null, this.cert!.backtest.positions[i].p.f))
			let predColor: string = "";
			if (this.cert!.backtest.positions[i].t == 1 && !this.cert!.backtest.positions[i].o) { predColor = "#4DB6AC" }			
			else if (this.cert!.backtest.positions[i].t == 1 && this.cert!.backtest.positions[i].o) { predColor = "#004D40" }
			else if (this.cert!.backtest.positions[i].t == -1 && !this.cert!.backtest.positions[i].o) { predColor = "#E57373" }
			else if (this.cert!.backtest.positions[i].t == -1 && this.cert!.backtest.positions[i].o) { predColor = "#B71C1C" }
			items.push({ x: i, y: predSum, fillColor: predColor })
		}

		// Finally, return the list of predictions
		return items;
	}










	/* Misc Helpers */





	/**
	 * Opens the backtest position dialog.
	 * @param position 
	 * @returns void
	 */
	 public displayPosition(position: IBacktestPosition): void {
		this.dialog.open(PredictionModelBacktestPositionDialogComponent, {
			hasBackdrop: this._app.layout.value != 'mobile', // Mobile optimization
			panelClass: 'small-dialog',
				data: <IBacktestPositionDialogData>{
					model: this.cert!.model,
					position: position
				}
		})
	}
}
