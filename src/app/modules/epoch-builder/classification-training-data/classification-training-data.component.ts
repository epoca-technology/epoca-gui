import { Component, OnInit, OnDestroy, ViewChild } from "@angular/core";
import { AbstractControl, FormControl, FormGroup } from '@angular/forms';
import { ApexAxisChartSeries, ChartComponent } from "ng-apexcharts";
import { Subscription } from "rxjs";
import { ClassificationTrainingDataService } from '../../../core';
import { 
	AppService, 
	ChartService, 
	IBarChartOptions, 
	ILayout, 
	ILineChartOptions, 
	NavService, 
} from '../../../services';
import { IClassificationFeaturesConfig } from "../../../shared/components/epoch-builder";
import { IClassificationTrainingDataComponent } from "./interfaces";

@Component({
  selector: "app-classification-training-data",
  templateUrl: "./classification-training-data.component.html",
  styleUrls: ["./classification-training-data.component.scss"]
})
export class ClassificationTrainingDataComponent implements OnInit, OnDestroy, IClassificationTrainingDataComponent {
	@ViewChild("chart", { static: false }) chart?: ChartComponent;

	// Layout
	public layout: ILayout = this._app.layout.value;
	private layoutSub?: Subscription;
	
	// File Input Form
    public fileInputForm: FormGroup = new FormGroup({ fileInput: new FormControl('', [ ]) });

	// Initialization
	public initialized: boolean = false;
	public initializing: boolean = false;

	// Tabs Navigation
	public activeTab: number = 0;

	// Outcomes
	public outcomes!: IBarChartOptions;

	// Features Config
	public featuresConfig!: IClassificationFeaturesConfig;

	// Dataset Visible Rows
	public dsRowsPerPage: number = this.layout == 'desktop' ? 8: 5;
	public dsRowsStart: number = 0;
	public dsRowsEnd: number = 0;
	public dsVisibleRows: Array<number[]> = [];

	// Dataset Insights Visible Rows
	public visibleFeatures: {[featureName: string]: boolean} = {};
	public featureColors: string[] = [];
	public insightRowsPerPage: number = 100;
	public insightRowsStart: number = 0;
	public insightRowsEnd: number = 0;
	public insight!: ILineChartOptions;
	private insightInitialized: boolean = false;
	public chartLoading: boolean = false;


	constructor(
		public _nav: NavService,
		public _app: AppService,
		private _chart: ChartService,
		public _td: ClassificationTrainingDataService
	) { }


	ngOnInit(): void {
		this.layoutSub = this._app.layout.subscribe((nl: ILayout) => { this.layout = nl });
	}


	ngOnDestroy(): void {
		if (this.layoutSub) this.layoutSub.unsubscribe();
		this._td.reset();
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

		// Attempt to initiaze the regression selection
		try {
			// Pass the file to the service
			await this._td.init(event);

			// Build the component
			this.buildComponent();

			// Mark the component as initialized
			this.initialized = true;
		} catch (e) {
			this.fileInput.setValue('');
			this._app.error(e)
		}

		// Update initializing state
		this.initializing = false;
		this.fileInput.setValue(null);
	}






	/**
	 * Resets the components values in order to view a different file.
	 * @returns void
	 */
	 public reset(): void {
		this.initialized = false;
		this.initializing = false;
		this.fileInput.setValue('');
		this.activeTab = 0;
		this.dsRowsStart = 0;
		this.dsRowsEnd = 0;
		this.dsVisibleRows = [];
		this.visibleFeatures = {};
		this.featureColors = [];
		this.insightRowsStart = 0;
		this.insightRowsEnd = 0;
		this.insight = <ILineChartOptions>{};
		this.insightInitialized = false;
		this.chartLoading = false;
	}






	/**
	 * Builds all the data required by the component.
	 */
	private buildComponent(): void {
		// Init the outcomes chart
		this.outcomes = this._chart.getBarChartOptions(
			{
				series: [
					{name: "Increase", data: [this._td.increaseOutcomeNum]},
					{name: "Decrease", data: [this._td.decreaseOutcomeNum]}
				], 
				colors: [this._chart.upwardColor, this._chart.downwardColor],
				xaxis: {categories: [ "Outcomes" ], labels: {show: false}},
				yaxis: {labels: {show: false}},
			}, 
			["Outcomes"], 
			130
		);

		// Init the features config
		this.featuresConfig = {
			features_num: this._td.featuresNum,
			regressions: this._td.regressions,
			include_rsi: this._td.includeRSI,
			include_aroon: this._td.includeAROON
		};

		// Initialize the dataset paginator
		this.dsGotoStart();

		// Initialize the dataset insights
		this.insightGotoStart();
	}






	/**
	 * Triggers whenever the tab is changed.
	 * @param newIndex 
	 */
	public tabChanged(newIndex: number): void {
		// Activate the current tab
		this.activeTab = newIndex;

		// Handle the initialization/update of the insight chart if applies
		if (newIndex == 2) {
			// Set the state
			this.chartLoading = true;

			// Initialize the first 3 features in case it hadn't been
			if (!this.insightInitialized) {
				// Only activate the first feature
				for (let i = 0; i < this._td.trainingDataFeatures.length; i++) { 
					if (i == 0) {
						this.visibleFeatures[this._td.trainingDataFeatures[i]] = true;
					} else {
						this.visibleFeatures[this._td.trainingDataFeatures[i]] = false;
					}
				}
				this.insightInitialized = true;
			}

			// Refresh the chart
			setTimeout(() => {
				for (let feature of this._td.trainingDataFeatures) {
					if (this.visibleFeatures[feature]) { this.chart?.showSeries(feature) }
					else { this.chart?.hideSeries(feature) }
				}
				setTimeout(() => {
					this.chartLoading = false;
				}, 500);
			}, 100);
		}
	}










	/* Dataset Pagination */



	public dsGotoStart(): void {
		// Init the page range
		this.dsRowsStart = 0;
		this.dsRowsEnd = this.dsRowsPerPage;

		// Slice the rows
		this.dsVisibleRows = this._td.trainingData.rows.slice(this.dsRowsStart, this.dsRowsEnd);
	}



	public dsGoForward(): void {
		// Init the page range
		this.dsRowsStart = this.dsRowsStart + this.dsRowsPerPage;
		this.dsRowsEnd = this.dsRowsEnd + this.dsRowsPerPage;

		// Slice the rows
		if (this.dsRowsEnd < this._td.trainingData.rows.length) {
			this.dsVisibleRows = this._td.trainingData.rows.slice(this.dsRowsStart, this.dsRowsEnd);
		} else {
			this.dsGotoEnd();
		}
	}



	public dsGoBackward(): void {
		// Init the page range
		this.dsRowsStart = this.dsRowsStart - this.dsRowsPerPage;
		this.dsRowsEnd = this.dsRowsEnd - this.dsRowsPerPage;

		// If the dsRowsStart is a negative number, gotoStart instead
		if (this.dsRowsStart > 0) {
			// Slice the rows
			this.dsVisibleRows = this._td.trainingData.rows.slice(this.dsRowsStart, this.dsRowsEnd);
		} else {
			this.dsGotoStart();
		}
	}





	public dsGotoEnd(): void {
		// Init the page range
		this.dsRowsEnd = this._td.trainingData.rows.length;
		this.dsRowsStart = this.dsRowsEnd - this.dsRowsPerPage;

		// Slice the rows
		this.dsVisibleRows = this._td.trainingData.rows.slice(this.dsRowsStart, this.dsRowsEnd);
	}











	/* Dataset Insight */







	public insightGotoStart(): void {
		// Init the page range
		this.insightRowsStart = 0;
		this.insightRowsEnd = this.insightRowsPerPage;

		// Slice the rows and build the chart
		this.buildInsightChart();
	}



	public insightGoForward(): void {
		// Init the page range
		this.insightRowsStart = this.insightRowsStart + this.insightRowsPerPage;
		this.insightRowsEnd = this.insightRowsEnd + this.insightRowsPerPage;

		// Slice the rows and build the chart
		if (this.insightRowsEnd < this._td.trainingData.rows.length) {
			this.buildInsightChart();
		} else {
			this.insightGotoEnd();
		}
	}



	public insightGoBackward(): void {
		// Init the page range
		this.insightRowsStart = this.insightRowsStart - this.insightRowsPerPage;
		this.insightRowsEnd = this.insightRowsEnd - this.insightRowsPerPage;

		// If the insightRowsStart is a negative number, gotoStart instead
		if (this.insightRowsStart > 0) {
			// Slice the rows and build the chart
			this.buildInsightChart();
		} else {
			this.insightGotoStart();
		}
	}





	public insightGotoEnd(): void {
		// Init the page range
		this.insightRowsEnd = this._td.trainingData.rows.length;
		this.insightRowsStart = this.insightRowsEnd - this.insightRowsPerPage;

		// Slice the rows and build the chart
		this.buildInsightChart();
	}





	
	/**
	 * Toggles a given insight feature.
	 * @param feature 
	 */
	public toggleInsightFeature(feature: string): void {
		if (this.visibleFeatures[feature]) {
			this.visibleFeatures[feature] = false;
			this.chart?.hideSeries(feature);
		} else {
			this.visibleFeatures[feature] = true;
			this.chart?.showSeries(feature);
		}
	}



	/**
	 * Toggles all insight features.
	 */
	 public toggleAllInsightFeatures(): void {
		for (let feature of this._td.trainingDataFeatures) { this.toggleInsightFeature(feature) }
	}




	/**
	 * Based on a freshly set start and end, it will slice the rows
	 * and build the chart.
	 * @returns void
	 */
	private buildInsightChart(): void {
		// Initialize the chart colors if they havent been
		if (!this.featureColors.length) this.featureColors = this._chart.colors.slice(0, this._td.featuresNum);

		// Retrieve the series
		const series: ApexAxisChartSeries = this.buildInsightChartSeries(this.insight?.series);

		// If the chart exists, just update the series
		if (this.insight && this.insight.series && this.chart) { 
			// Update the series
			this.chart.updateSeries(series);

			// Update the visible features
			for (let feature of this._td.trainingDataFeatures) {
				if (!this.visibleFeatures[feature]) { this.chart?.hideSeries(feature) }
				else { this.chart?.showSeries(feature) }
			}
		}

		// Otherwise, build the chart from scratch
		else {
			// Initialize the chart
			this.insight = this._chart.getLineChartOptions({ 
				series: series, 
				stroke: {curve: "straight", width: 5} 
			}, 500, true);
		}
	}




	/**
	 * Builds the series based on the current slice.
	 * @returns ApexAxisChartSeries
	 */
	private buildInsightChartSeries(currentSeries?: ApexAxisChartSeries): ApexAxisChartSeries {
		// Init the series
		let series: ApexAxisChartSeries = currentSeries ? currentSeries: this.getInsightSeriesTemplate();

		// Reset the data lists if a series was provided
		if (currentSeries) { for (let i = 0; i < series.length; i++) { series[i].data = [] } };
		
		// Slice the rows
		const visibleRows: Array<number[]> = this._td.trainingData.rows.slice(this.insightRowsStart, this.insightRowsEnd);

		// Iterate over the visible rows
		for (let row of visibleRows) {
			// Iterate over each column in the row
			for (let i = 0; i < row.length; i++) {
				// Check if it is a feature. If so, add the data to the series
				if (this._td.trainingData.columns[i] != "up" && this._td.trainingData.columns[i] != "down") {
					series[i].data.push(<any>row[i]);
				}

				// Check if it is a label. Since the label is grouped, deduce the data based on the up outcome
				else if (this._td.trainingData.columns[i] == "up") {
					// Handle a price increase
					if (row[i] == 1) { series[i].data.push(<any>1) }
					else { series[i].data.push(<any>-1) }
				}
			}
		}

		// Finally, return the series
		return series;
	}




	/**
	 * Returns the series template for a chart that will be built from
	 * scratch.
	 * @returns ApexAxisChartSeries
	 */
	private getInsightSeriesTemplate(): ApexAxisChartSeries {
		// Init the series
		let series: ApexAxisChartSeries = [];

		// Iterate over each feature and push it to the series
		for (let i = 0; i < this._td.trainingDataFeatures.length; i++) {
			series.push({
				name: this._td.trainingDataFeatures[i],
				type: "line",
				data: [],
				color: this.featureColors[i]
			});
		}

		// Push the label series
		series.push({ name: "Label", type: "column", data: [], color: "#B0BEC5" });

		// Finally, return the template
		return series;
	}
}