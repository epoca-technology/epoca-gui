import { Component, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup } from '@angular/forms';
import { ApexAxisChartSeries } from 'ng-apexcharts';
import { Subscription } from 'rxjs';
import { 
	IModel, 
	PredictionService, 
	UtilsService, 
	ClassificationTrainingDataService,
} from '../../../core';
import { 
	AppService, 
	ChartService, 
	ClipboardService, 
	IBarChartOptions, 
	ILayout, 
	IPieChartOptions, 
	NavService, 
	SnackbarService,
} from '../../../services';
import { IClassificationTrainingDataComponent } from './interfaces';

@Component({
  selector: 'app-classification-training-data',
  templateUrl: './classification-training-data.component.html',
  styleUrls: ['./classification-training-data.component.scss']
})
export class ClassificationTrainingDataComponent implements OnInit, OnDestroy, IClassificationTrainingDataComponent {
	// Layout
	public layout: ILayout = this._app.layout.value;
	private layoutSub?: Subscription;

	// File Input Form
    public fileInputForm: FormGroup = new FormGroup({ fileInput: new FormControl('', [ ]) });

	// Training Data Initialization
	public initialized: boolean = false;
	public initializing: boolean = false;

	// Tab Navigation
	public activeIndex: number = 0;

	// Price Actions Insight Chart
	public priceActions!: IPieChartOptions;

	// List of Technical Analysis Features included
	public incudedTA: string[] = [];

	// Predictions Insight Chart
	public predictions!: IBarChartOptions;

	// Visible Data Rows
	public rowsPerPage: number = this.layout == 'desktop' ? 8: 5;
	public rowsStart: number = 0;
	public rowsEnd: number = 0;
	public visibleRows: Array<number[]> = [];

	constructor(
		public _nav: NavService,
		private _snackbar: SnackbarService,
		private _app: AppService,
		private _chart: ChartService,
		private _utils: UtilsService,
		private _prediction: PredictionService,
		public _td: ClassificationTrainingDataService,
		public _clipboard: ClipboardService
	) { }





	ngOnInit(): void {
		this.layoutSub = this._app.layout.subscribe((nl: ILayout) => { this.layout = nl });
	}

	ngOnDestroy(): void {
		if (this.layoutSub) this.layoutSub.unsubscribe();
	}



    /* Form Getters */
	get fileInput(): AbstractControl { return <AbstractControl>this.fileInputForm.get('fileInput') }






	/* Initialization */




	/**
	 * Whenever there is a file change, it will attempt to initialize the Training Data.
	 * @param event 
	 * @returns Promise<void>
	 */
	 public async fileChanged(event: any): Promise<void> {
		// Set the state
		this.initializing = true;

		// Abort the bottom sheet if there are no files
		if (!event || !event.target || !event.target.files || !event.target.files.length) return;

		// Attempt to initiaze the backtests
		try {
			// Pass the files to the service
			await this._td.init(event);

			// Activate default tab
			this.activeIndex = 0;

			// Build the component
			this.build();

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
	 * Builds the component based on the extracted data.
	 * @returns void
	 */
	private build(): void {
		/* TA Features List */
		this.incudedTA = [];
		if (this._td.include_rsi) this.incudedTA.push("RSI");
		if (this._td.include_stoch) this.incudedTA.push("STOCH");
		if (this._td.include_aroon) this.incudedTA.push("AROON");
		if (this._td.include_stc) this.incudedTA.push("STC");
		if (this._td.include_mfi) this.incudedTA.push("MFI");
		
		/* Init Price Actions Chart */
		this.priceActions = this._chart.getPieChartOptions({
			series: [this._td.price_actions_insight.up, this._td.price_actions_insight.down],
			colors: [this._chart.upwardColor, this._chart.downwardColor]
		}, ["Up", "Down"], 300);


		/* Init Positions Chart */

		// Init the chart data
		let series: ApexAxisChartSeries = [{name:'Longs',data:[]},{name:'Shorts',data:[]},{name:'Neutral',data:[]}];

		// Iterate over each model building the data
		for (let id of this._td.modelIDs) {
			series[0].data.push(<any>this._td.predictions_insight[id].long);
			series[1].data.push(<any>this._td.predictions_insight[id].short);
			series[2].data.push(<any>this._td.predictions_insight[id].neutral);
		}

		// Build the positions chart options
		const self = this;
		this.predictions = this._chart.getBarChartOptions(
			{
				series: series, 
				colors: [this._chart.upwardColor, this._chart.downwardColor, this._chart.neutralColor]
			}, 
			this._td.modelIDs, 
			this._chart.calculateChartHeight(110, 20, this._td.modelIDs.length, 3)
		);
		this.predictions.chart.events = {click: function(e, cc, c) {self.displayModel(c.dataPointIndex)}}


		/* Init Training Data */
		this.gotoStart();
	}







	/**
	 * Resets the components values in order to view a different file.
	 * @returns void
	 */
	public reset(): void {
		this.initialized = false;
		this.initializing = false;
		this.visibleRows = [];
		this.rowsStart = 0;
		this.rowsEnd = 0;
		this.fileInput.setValue('');
	}













	/* Data Pagination */



	public gotoStart(): void {
		// Init the page range
		this.rowsStart = 0;
		this.rowsEnd = this.rowsPerPage;

		// Slice the rows
		this.visibleRows = this._td.training_data.rows.slice(this.rowsStart, this.rowsEnd);
	}



	public goForward(): void {
		// Init the page range
		this.rowsStart = this.rowsStart + this.rowsPerPage;
		this.rowsEnd = this.rowsEnd + this.rowsPerPage;

		// Slice the rows
		if (this.rowsEnd < this._td.training_data.rows.length) {
			this.visibleRows = this._td.training_data.rows.slice(this.rowsStart, this.rowsEnd);
		} else {
			this.gotoEnd();
		}
	}



	public goBackward(): void {
		// Init the page range
		this.rowsStart = this.rowsStart - this.rowsPerPage;
		this.rowsEnd = this.rowsEnd - this.rowsPerPage;

		// If the rowsStart is a negative number, gotoStart instead
		if (this.rowsStart > 0) {
			// Slice the rows
			this.visibleRows = this._td.training_data.rows.slice(this.rowsStart, this.rowsEnd);
		} else {
			this.gotoStart();
		}
	}





	public gotoEnd(): void {
		// Init the page range
		this.rowsEnd = this._td.training_data.rows.length;
		this.rowsStart = this.rowsEnd - this.rowsPerPage;

		// Slice the rows
		this.visibleRows = this._td.training_data.rows.slice(this.rowsStart, this.rowsEnd);
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
		if (typeof id == "number" && id >= 0) id = this._td.modelIDs[id]; 

		// Init the model
		const model: IModel = this._td.models[id];

		// Display the dialog if the model was found
		if (model) this._nav.displayModelDialog(model);
	}












	/* Misc Helpers */


}
