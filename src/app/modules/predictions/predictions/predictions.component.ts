import { Component, OnInit, OnDestroy } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { ActivatedRoute } from "@angular/router";
import {Title} from "@angular/platform-browser";
import { Subscription } from "rxjs";
import { ApexAnnotations } from "ng-apexcharts";
import { 
    EpochService, 
    IEpochSummary, 
    IPrediction, 
    LocalDatabaseService, 
    PredictionService, 
    UtilsService 
} from "../../../core";
import { 
    AppService, 
    ChartService, 
    ILayout, 
    ILineChartOptions, 
    NavService, 
    ValidationsService 
} from "../../../services";
import { IPredictionsComponent } from "./interfaces";

@Component({
  selector: 'app-predictions',
  templateUrl: './predictions.component.html',
  styleUrls: ['./predictions.component.scss']
})
export class PredictionsComponent implements OnInit, OnDestroy, IPredictionsComponent {
    // Layout
	public layout: ILayout = this._app.layout.value;
	private layoutSub?: Subscription;

    // View
    public chartView: boolean = true; 

    // Active Prediction
    public epoch: IEpochSummary|null = null;
    public active: IPrediction|null = null;
    private predictionSub?: Subscription;

    // Prediction Lists
    public predictions: IPrediction[] = [];
    public predictionsHistPayload: IPrediction[] = [];
    private limit: number = 300;
    public hasMore: boolean = true;

    // Predictions History
    public predictionsHist?: ILineChartOptions;

    // Predictions Grid
    public gridCols: number = 6;

    // Initialization State
    public initialized: boolean = false;

    // Epoch Data Loading State
    public loaded: boolean = false;

    // Submission State
    public submitting: boolean = false;
    
    constructor(
        public _nav: NavService,
        public _app: AppService,
        private _validations: ValidationsService,
        private route: ActivatedRoute,
        private _localDB: LocalDatabaseService,
        private _epoch: EpochService,
        private dialog: MatDialog,
        private _chart: ChartService,
        private _utils: UtilsService,
        private titleService: Title,
        public _prediction: PredictionService
    ) { }

    async ngOnInit(): Promise<void> {
        // Initialize layout
        this.layoutSub = this._app.layout.subscribe((nl: ILayout) => {
            this.layout = nl;
            this.gridCols = this.layout == "desktop" ? 6: 1
        });

        // Check if an Epoch ID was provided from the URL. If so, initialize it right away.
        const urlEpochID: string|null = this.route.snapshot.paramMap.get("epochID");
        if (typeof urlEpochID == "string" && this._validations.epochIDValid(urlEpochID)) { 
            await this.initializeEpochData(urlEpochID);
        }

        // Otherwise, check if an active epoch is available
        else if (this._app.epoch.value){
            await this.initializeEpochData(this._app.epoch.value.record.id);
        }

        // Set the init state
        this.initialized = true;
    }


    ngOnDestroy(): void {
        if (this.layoutSub) this.layoutSub.unsubscribe();
        if (this.predictionSub) this.predictionSub.unsubscribe();
        this.titleService.setTitle("Epoca");
    }





    /* Initializer */



    /**
     * Initializes the component based on a provided Epoch ID.
     * @param epochID?
     * @returns Promise<void>
     */
    public async initializeEpochData(epochID?: string): Promise<void> {
        // Set the loading state
        this.loaded = false;

        // Reset the epoch values
        this.epoch = null;
        this.active = null;
        this.predictions = [];
        if (this.predictionSub) this.predictionSub.unsubscribe();

        // Make sure the provided ID is valid
        if (!this._validations.epochIDValid(epochID || "")) {
            this.loaded = true;
            return;
        }

        // Initialize the epoch summary
        let epochSummary: IEpochSummary|null = null;

        // Check if the epoch matches the active one
        if (this._app.epoch.value && this._app.epoch.value.record.id == epochID) {
            // Set the epoch summary
            epochSummary = this._app.epoch.value;
        }

        // If it isn"t the active epoch, retrieve the summary from the API
        else {
            try {
                epochSummary = await this._localDB.getEpochSummary(<string>epochID);
            } catch (e) { this._app.error(e) }
        }

        // Make sure an epoch summary was found
        if (!epochSummary) {
            this._app.error("Could not extract the Epoch Summary.");
            this.loaded = true;
            return;
        }

        // Populate the epoch
        this.epoch = epochSummary;

        // Load the initial predictions
        await this.loadPredictions();

        // Subscribe to the active prediction if the epoch matches
        if (epochSummary.record.id == epochID) {
            this.predictionSub = this._app.prediction.subscribe(async (pred: IPrediction|null|undefined) => {
                if (pred) {
                    // If it is an actual new prediction, add it to the list
                    if (this.active && pred.t > this.active.t) this.onNewPrediction(pred);

                    // Populate the prediction
                    this.active = pred;
                    
                    // Set loaded state
                    this.loaded = true;
                }
            });
        }

        // Otherwise, just set the load state
        else { this.loaded = true }
    }







    /**
     * Loads the predictions based on the predictions that are currently loaded.
     * Once the predictions are downloaded, it triggers an onDataChanges event.
     * @returns Promise<void>
     */
    public async loadPredictions(): Promise<void> {
        // Make sure it isn't already loading predictions
        if (this.submitting) return;

        // Set submission state
        this.submitting = true;

        // Retrieve the predictions safely
        try {
            // Download the predictions
            const preds: IPrediction[] = await this._prediction.listPredictions(
                this.epoch!.record.id,
                this.limit,
                this.predictions.length ? this.predictions[this.predictions.length - 1].t: 0,
                0
            );

            // Concatenate them with the current list
            this.predictions = this.predictions.concat(preds);

            // Check if there are more records
            this.hasMore = preds.length == this.limit;

            // Emmite a data change event
            this.onDataChanges();
        } catch (e) { this._app.error(e) }

        // Set submission state
        this.submitting = false;
    }










    /**
     * Triggers whenever a new prediction has been downloaded 
     * and needs to be appended.
     */
    private onNewPrediction(pred: IPrediction): void {
        // Preprend it to the list
        this.predictions = [pred].concat(this.predictions);

        // Emmit the data change event
        this.onDataChanges();
    }









    /**
     * Triggers whenever there is a change in the data and builds
     * all the required data.
     */
     private onDataChanges(): void {
        // Set the chart list
        this.predictionsHistPayload = this.predictions.slice();

        // Reverse the items
        this.predictionsHistPayload.reverse();

        // Init the min and max values
        const minValue: number = -this.epoch!.record.model.regressions.length;
        const maxValue: number = this.epoch!.record.model.regressions.length;

        // Build the annotations
		const annotations: ApexAnnotations = {
			yaxis: [
				{
					y: this.epoch!.record.model.min_increase_sum,
                    y2: maxValue,
					borderColor: this._chart.upwardColor,
                    fillColor: this._chart.upwardColor,
					strokeDashArray: 3,
					borderWidth: 3,
					label: {
						borderColor: this._chart.upwardColor,
						style: { color: "#FFFFFF", background: this._chart.upwardColor,}
					}
				},					
				{
					y: this.epoch!.record.model.min_decrease_sum,
                    y2: minValue,
					borderColor: this._chart.downwardColor,
                    fillColor: this._chart.downwardColor,
					strokeDashArray: 3,
					borderWidth: 3,
					label: {
						borderColor: this._chart.downwardColor,
						style: { color: '#fff', background: this._chart.downwardColor,}
					}
				}
			]
		};

        // Build/Update the chart
        if (this.predictionsHist) {
            this.predictionsHist.series = [
                {
                    name: "Prediction Sum", 
                    data: this.predictionsHistPayload.map((p) => <number>this._utils.outputNumber(p.s, {dp: 2})), 
                    color: "#000000"
                }
            ]
        } else {
            this.predictionsHist = this._chart.getLineChartOptions(
                { 
                    series: [
                        {
                            name: "Prediction Sum", 
                            data: this.predictionsHistPayload.map((p) => <number>this._utils.outputNumber(p.s, {dp: 2})), 
                            color: "#000000"
                        }
                    ],
                    stroke: {curve: "smooth", width:3},
                    annotations: annotations
                },
                this.layout == "desktop" ? 600: 400, 
                true,
                {min: minValue, max: maxValue}
            );
        }

		// Finally, Attach the click event
		const self = this;
		this.predictionsHist.chart.events = {
			click: function(e: any, cc: any, c: any) {
				if (c.dataPointIndex >= 0 && self.predictionsHistPayload[c.dataPointIndex]) {
                    self._nav.displayPredictionDialog(self.epoch!.record.model, self.predictionsHistPayload[c.dataPointIndex])
				}
			}
		}
    }
}
