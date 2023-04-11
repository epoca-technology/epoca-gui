import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AbstractControl, FormControl, FormGroup } from '@angular/forms';
import { MatSidenav } from '@angular/material/sidenav';
import {MatDialog} from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { ApexAnnotations, ApexAxisChartSeries, PointAnnotations, XAxisAnnotations, YAxisAnnotations } from 'ng-apexcharts';
import { BigNumber} from "bignumber.js";
import * as moment from "moment";
import { 
	UtilsService, 
	PredictionModelService,
	IPredictionModelCertificate,
	IPredictionModelsOrder,
	IBacktestPosition,
	LocalDatabaseService,
	ICandlestick,
	PredictionService,
	CandlestickService
} from '../../../core';
import { 
	AppService, 
	ChartService, 
	IBarChartOptions, 
	ICandlestickChartOptions, 
	ILayout, 
	ILineChartOptions, 
	IPieChartOptions, 
	NavService,
	ValidationsService, 
} from '../../../services';
import { 
	EpochBuilderConfigDialogComponent, 
	IDiscoveryRecord, 
	IEpochBuilderConfigDialog, 
	IEpochBuilderConfigDialogResponse, 
} from "../shared";
import { 
	PredictionModelBacktestPositionDialogComponent, 
	IBacktestPositionDialogData
} from './prediction-model-backtest-position-dialog';
import { IPredictionModelsComponent, IViewID, IView, IHistoryPage } from "./interfaces";


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
	public loadingFromDB: boolean = false;
	public initialized: boolean = false;
	public initializing: boolean = false;

	// Order
	public order: IPredictionModelsOrder = "ebe_points";

	// Views
	public readonly views: IView[] = [
		{id: "ebe_points", name: "EBE Points", icon: "query_stats"},
		{id: "backtest", name: "Backtest", icon: "price_check"},
		{id: "discovery", name: "Discovery", icon: "tune"},
		{id: "hyperparams", name: "Hyperparams", icon: "settings_suggest"}
	]
	public readonly viewNames = {
		ebe_points: "EBE Points",
		backtest: "Backtest",
		discovery: "Discovery",
		hyperparams: "Hyperparams"
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

	// Hyperparams View
	public hyperparamsView?: {
		priceChangeRequirement: IBarChartOptions,
		minSumFunction: IBarChartOptions,
		minSumAdjustmentFactor: IBarChartOptions,
		regressionsPerModel: IBarChartOptions
	}
	private readonly gridChartHeight: number = 230;

	// Certificate View
	public certificateView?: {
		accuracy: IBarChartOptions,
		predictionInsight: IBarChartOptions,
		balanceHist: IBarChartOptions,
		positions: IPieChartOptions,
		outcomes: IPieChartOptions,
	};
	public cert?: IPredictionModelCertificate;
	public activeCertTabIndex: number = 0;
	public visiblePositions: number = 15;

	// Position Hist specifics
	public histChart?: ICandlestickChartOptions;
	public histPages: Array<IHistoryPage> = [];
	public activePage: number = 0;
	public loadingPage: boolean = false;

	// Loading state - Just for certificates
	public loaded: boolean = false;

	constructor(
		public _nav: NavService,
		public _app: AppService,
		private _chart: ChartService,
		private _utils: UtilsService,
		public _pm: PredictionModelService,
		private dialog: MatDialog,
        private route: ActivatedRoute,
		private _validations: ValidationsService,
		private _localDB: LocalDatabaseService,
		private _prediction: PredictionService,
		private _candlestick: CandlestickService
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
		this._pm.reset();
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
	public async initWithID(id: string): Promise<void> {
		// Attempt to initiaze the certificate
		try {
			// Set loading state
			this.loadingFromDB = true;

			// Pass the files to the service
			await this._pm.init(id, this.order, 1);

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
		this.hyperparamsView = undefined;
		this.certificateView = undefined;
		this.cert = undefined;
		this.activeCertTabIndex = 0;
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

		// Navigate to the Hyperparams View
		else if (this.activeView == "hyperparams" && !this.hyperparamsView) { this.buildHyperparamsView() }

		// Navigate to a certificate
		else if (this.activeView == "certificate" && (typeof certIndexOrID == "number" || typeof certIndexOrID == "string")) { this.buildCertificatesView(certIndexOrID) }

		// Allow a small delay
		await this._utils.asyncDelay(0.5);

		// Update loading state
		this.loaded = true;
	}





	/**
	 * Triggers whenever the certificate tab changes. If the 
	 * history is activated, it will be
	 * @param newIndex 
	 */
	public certTabChanged(newIndex: number): void {
		// Check if the hist needs to be initialized
		if (newIndex == 3) { this.loadFirstHistPage() }

		// Activate the new index
		this.activeCertTabIndex = newIndex;
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
				{series: [{name: "Profit", data: profit, color: "#000000"}]}, 
				this._pm.ids, 
				this._chart.calculateChartHeight(110, 20, this._pm.ids.length, 1)
			),
			balanceHist: this._chart.getLineChartOptions(
				{ series: balanceHist, stroke: {width: 3, curve: "straight"} }, 
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
	  * Builds the Hyperparams View.
	  */
	private buildHyperparamsView(): void {
		// Init the counters
		let priceChangeRequirementCount: {[paramKey: string]: number} = { "2.5": 0, "3": 0, "3.5": 0,"4": 0, "Unknown": 0};
		let minSumFunctionCount: {[paramKey: string]: number} = { "mean": 0, "median": 0, "Unknown": 0 };
		let minSumAdjustmentFactorCount: {[paramKey: string]: number} = { "1": 0, "1.5": 0, "2": 0, "2.5": 0, "Unknown": 0 };
		let regressionsPerModelCount: {[paramKey: string]: number} = { "4": 0, "8": 0, "16": 0, "Unknown": 0 };

		// Iterate over each certificate and populate the counters
		for (let cert of this._pm.certificates) {
			// Update the price change requirement
			if (typeof priceChangeRequirementCount[String(cert.model.price_change_requirement)] == "number") {
				priceChangeRequirementCount[String(cert.model.price_change_requirement)] += 1
			}
			else { priceChangeRequirementCount["Unknown"] += 1 }

			// Update the min sum function
			if (typeof minSumFunctionCount[cert.model.min_sum_function] == "number") { 
				minSumFunctionCount[cert.model.min_sum_function] += 1 
			}
			else { minSumFunctionCount["Unknown"] += 1 }

			// Update the min sum adjustment factor
			if (typeof minSumAdjustmentFactorCount[String(cert.model.min_sum_adjustment_factor)] == "number") {
				minSumAdjustmentFactorCount[String(cert.model.min_sum_adjustment_factor)] += 1
			}
			else { minSumAdjustmentFactorCount["Unknown"] += 1 }

			// Update the regressions per model
			if (typeof regressionsPerModelCount[String(cert.model.regressions.length)] == "number") {
				regressionsPerModelCount[String(cert.model.regressions.length)] += 1
			}
			else { minSumAdjustmentFactorCount["Unknown"] += 1 }
		}

		// Finally, build the hyperparam charts
		this.hyperparamsView = {
			priceChangeRequirement: this._chart.getBarChartOptions(
				{
					series: [
						{ name: "2.5%", data: [ priceChangeRequirementCount["2.5"] ] },
						{ name: "3%", data: [ priceChangeRequirementCount["3"] ] },
						{ name: "3.5%", data: [ priceChangeRequirementCount["3.5"] ] },
						{ name: "4%", data: [ priceChangeRequirementCount["4"] ] },
						{ name: "Unknown", data: [ priceChangeRequirementCount["Unknown"] ] }
					], 
					colors: [ "#045724", "#388a58", "#5fde90", "#0cf79d", "#9E9E9E" ],
					xaxis: {categories: [ "Price Change Requirement" ], labels: {show: false}},
					yaxis: {labels: {show: false}},
					plotOptions: { bar: { horizontal: false, borderRadius: 4, columnWidth: "25%"}},
				}, 
				[ "Price Change Requirement" ], 
				this.gridChartHeight
			),
			minSumFunction: this._chart.getBarChartOptions(
				{
					series: [
						{ name: "mean", data: [ minSumFunctionCount["mean"] ] },
						{ name: "median", data: [ minSumFunctionCount["median"] ] },
						{ name: "Unknown", data: [ minSumFunctionCount["Unknown"] ] }
					], 
					colors: [ "#880E4F", "#E91E63", "#9E9E9E" ],
					xaxis: {categories: [ "Min Sum Function" ], labels: {show: false}},
					yaxis: {labels: {show: false}},
					plotOptions: { bar: { horizontal: false, borderRadius: 4, columnWidth: "15%"}},
				}, 
				[ "Min Sum Function" ], 
				this.gridChartHeight
			),
			minSumAdjustmentFactor: this._chart.getBarChartOptions(
				{
					series: [
						{ name: "x1", data: [ minSumAdjustmentFactorCount["1"] ] },
						{ name: "x1.5", data: [ minSumAdjustmentFactorCount["1.5"] ] },
						{ name: "x2", data: [ minSumAdjustmentFactorCount["2"] ] },
						{ name: "x2.5", data: [ minSumAdjustmentFactorCount["2.5"] ] },
						{ name: "Unknown", data: [ minSumAdjustmentFactorCount["Unknown"] ] }
					], 
					colors: [ "#041f59", "#2b608a", "#01579B", "#03A9F4", "#9E9E9E" ],
					xaxis: {categories: [ "Min Sum Adjustment Factor" ], labels: {show: false}},
					yaxis: {labels: {show: false}},
					plotOptions: { bar: { horizontal: false, borderRadius: 4, columnWidth: "25%"}},
				}, 
				[ "Min Sum Adjustment Factor" ], 
				this.gridChartHeight
			),
			regressionsPerModel: this._chart.getBarChartOptions(
				{
					series: [
						{ name: "4", data: [ regressionsPerModelCount["4"] ] },
						{ name: "8", data: [ regressionsPerModelCount["8"] ] },
						{ name: "16", data: [ regressionsPerModelCount["16"] ] },
						{ name: "Unknown", data: [ regressionsPerModelCount["Unknown"] ] }
					], 
					colors: [ "#2a0652", "#6a4196", "#9434fa", "#9E9E9E" ],
					xaxis: {categories: [ "Regressions per Model" ], labels: {show: false}},
					yaxis: {labels: {show: false}},
					plotOptions: { bar: { horizontal: false, borderRadius: 4, columnWidth: "20%"}},
				}, 
				[ "Regressions per Model" ], 
				this.gridChartHeight
			)
		}
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
		const balanceValues: number[] = values.map(v => v.y);
		const minBalance: number = <number>this._utils.getMin(balanceValues);
		const maxBalance: number = <number>this._utils.getMax(balanceValues);
 
		 // Build the view
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
					xaxis: {tooltip: {enabled: false}, labels: { show: false } }
				}, 
				[], 
				undefined, 
				false,
				true,
				{min: minBalance, max: maxBalance}
			),
			predictionInsight: this._chart.getBarChartOptions(
				{
					series: [{name: this.cert.id, data: this.getPredictionInsightsData()}],
					chart: {height: 220, type: 'bar',animations: { enabled: false}, toolbar: {show: false,tools: {download: false}}},
					plotOptions: {bar: {borderRadius: 0, horizontal: false, distributed: true,}},
					colors: colors,
					grid: {show: true},
					xaxis: {tooltip: {enabled: false}, labels: { show: false } }
				}, 
				[], 
				undefined, 
				false,
				true,
				{min: -this.cert.model.regressions.length, max: this.cert.model.regressions.length}
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

		// Tether the balance hist and the predictions
		this.certificateView.balanceHist!.chart!.id = "bars";
		this.certificateView.balanceHist!.chart!.group = "positions";
		this.certificateView.predictionInsight!.chart!.id = "dots";
		this.certificateView.predictionInsight!.chart!.group = "positions";

		// Attach the click events
		const self = this;
		this.certificateView.balanceHist!.chart.events = {
			click: function(e: any, cc: any, c: any) {
				if (c.dataPointIndex >= 0 && self.cert!.backtest.positions[c.dataPointIndex]) {
					self.displayPosition(self.cert!.backtest.positions[c.dataPointIndex])
				}
			}
		}
		this.certificateView.predictionInsight!.chart.events = {
			click: function(e: any, cc: any, c: any) {
				if (c.dataPointIndex >= 0 && self.cert!.backtest.positions[c.dataPointIndex]) {
					self._nav.displayPredictionDialog(
						self.cert!.model, 
						self.cert!.backtest.positions[c.dataPointIndex].p!
					)
				}
			}
		}

		// Finally, build the history pages
		this.buildHistPages();
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
			const predSum: number = <number>this._utils.outputNumber(BigNumber.sum.apply(null, this.cert!.backtest.positions[i].p.f), {dp: 6})
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






	/* Positions History */



	/**
	 * Builds the history pages based on the positions executed
	 * in the backtest.
	 */
	private buildHistPages(): void {
		// Calculate the start of the first page
		const realStart: number = moment(this.cert!.backtest.positions[0].ot).subtract(6, "hours").valueOf();

		// Calculate the end of the last page
		const realEnd: number = moment(this.cert!.backtest.positions[this.cert!.backtest.positions.length - 1].ct).add(6, "hours").valueOf();

		// Calculate the number of milliseconds in 4 days
		const pageSize: number = 1000 * 60 * 60 * 24 * 4;

		// Init the pages and build them
		this.histPages = [];
		for (let i = realStart; i < realEnd; i = i + pageSize) {
			this.histPages.push({start: i, end: i + pageSize });
		}
	}



	// First Page
	public async loadFirstHistPage(): Promise<void> {
		// Set loading state
		this.loadingPage = true;

		// Load the data
		try {
			// Calculate the new page
			const newPage: number = 0;
			
			// Load the page
			await this.buildHistoryCandlesticks(newPage);

			// Set the active page
			this.activePage = newPage;
		} catch (e) { this._app.error(e) }

		// Set loading state
		this.loadingPage = false;
	}


	// Previous Page
	public async loadPreviousHistPage(): Promise<void> {
		// Load the first page if applies
		if (this.activePage == 2) {
			await this.loadFirstHistPage();
		}

		// Otherwise, load the correct page
		else {
			// Set loading state
			this.loadingPage = true;

			// Load the data
			try {
				// Calculate the new page
				const newPage: number = this.activePage - 1;

				// Load the page
				await this.buildHistoryCandlesticks(newPage);

				// Set the active page
				this.activePage = newPage;
			} catch (e) { this._app.error(e) }

			// Set loading state
			this.loadingPage = false;
		}
	}


	// Next Page
	public async loadNextHistPage(): Promise<void> {
		// Load the last page if applies
		if (this.activePage == this.histPages.length - 2) {
			await this.loadLastHistPage();
		}

		// Otherwise, load the correct page
		else {
			// Set loading state
			this.loadingPage = true;

			// Load the data
			try {
				// Calculate the new page
				const newPage: number = this.activePage + 1;

				// Load the page
				await this.buildHistoryCandlesticks(newPage);

				// Set the active page
				this.activePage = newPage;
			} catch (e) { this._app.error(e) }

			// Set loading state
			this.loadingPage = false;
		}
	}


	// Last Page
	public async loadLastHistPage(): Promise<void> {
		// Set loading state
		this.loadingPage = true;

		// Load the data
		try {
			// Calculate the new page
			const newPage: number = this.histPages.length - 1;

			// Load the page
			await this.buildHistoryCandlesticks(newPage);

			// Set the active page
			this.activePage = newPage;
		} catch (e) { this._app.error(e) }

		// Set loading state
		this.loadingPage = false;
	}




	/**
	 * Downloads and builds the history's candlesticks
	 * based on a provided page index.
	 * @param pageIndex 
	 * @returns Promise<void>
	 */
	private async buildHistoryCandlesticks(pageIndex: number): Promise<void> {
		// Retrieve the candlesticks
		const candlesticks: ICandlestick[] = await this._candlestick.getForPeriod(
			this.histPages[pageIndex].start,
			this.histPages[pageIndex].end
		);

		// If there are no candlesticks, don't build the chart
		if (!candlesticks.length) throw new Error("The chart could not be built because no candlesticks were retrieved.");

		// Build the annotations
		const annotations: ApexAnnotations = this.buildHistoryCandlesticksAnnotations(pageIndex);

		// Build the chart
		this.histChart = this._chart.getCandlestickChartOptions(candlesticks, annotations, false, false);
		this.histChart.chart!.toolbar = {show: true,tools: {selection: true,zoom: true,zoomin: true,zoomout: true,download: false}};
		this.histChart.chart!.zoom = {enabled: true, type: "xy"};
		this.histChart.chart!.height = this._app.layout.value == "desktop" ? 550: 370;

		// Add the click events
		/*const self = this;
		this.histChart.chart.events = {
			click: function(e: any, cc: any, c: any) {
				if (c.dataPointIndex >= 0 && self.cert!.backtest.positions[c.dataPointIndex]) {
					self.displayPosition(self.cert!.backtest.positions[c.dataPointIndex])
				}
			}
		}*/
	}



	/**
	 * Builds the annotations based on a provided list of candlesticks.
	 * @returns ApexAnnotations
	 */
	private buildHistoryCandlesticksAnnotations(pageIndex: number): ApexAnnotations {
		// Init values
		const pageStart: number = this.histPages[pageIndex].start;
		const pageEnd: number = this.histPages[pageIndex].end;
		let yaxis: YAxisAnnotations[] = [];
		let xaxis: XAxisAnnotations[] = [];
		let points: PointAnnotations[] = [];

		// Retrieve the positions that were opened within the candlestick's range
		const open: IBacktestPosition[] = this.cert!.backtest.positions.filter(p => p.ot >= pageStart  && p.ot <= pageEnd);

		// Check if any position opening was found
		if (open.length) {
			for (let oPosition of open) {
				const color: string = this.getPositionColor(oPosition);
				xaxis.push(
					{
						x: oPosition.ot,
						label: {
							text: `OPEN: ${this._utils.getSum(oPosition.p.f, {dp: 1, of: "s"})}`,
							borderColor: color,
							style: { color: '#fff', background: color}
						}
					}
				);
			}
		}

		// Retrieve the positions that were closed within the candlestick's range
		const close: IBacktestPosition[] = this.cert!.backtest.positions.filter(p => p.ct >= pageStart  && p.ct <= pageEnd);

		// Check if any position opening was found
		if (close.length) {
			for (let cPosition of close) {
				const color: string = this.getPositionColor(cPosition);
				xaxis.push(
					{
						x: cPosition.ct,
						label: {
							position: "bottom",
							text: `CLOSE: ${this._utils.getSum(cPosition.p.f, {dp: 1, of: "s"})}`,
							borderColor: color,
							style: { color: '#fff', background: color}
						}
					}
				);
			}
		}

		// Finally, return the annotations
		return {
			yaxis: yaxis,
			xaxis: xaxis,
			points: points
		}
	}




	private getPositionColor(pos: IBacktestPosition): string {
		if (pos.t == 1 && !pos.o) { return "#26A69A" }			
		else if (pos.t == 1 && pos.o) { return "#004D40" }
		else if (pos.t == -1 && !pos.o) { return "#EF5350" }
		else { return "#B71C1C" }
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
