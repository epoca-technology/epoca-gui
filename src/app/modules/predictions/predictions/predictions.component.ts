import { Component, OnInit, OnDestroy } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import {Title} from "@angular/platform-browser";
import { MatBottomSheetRef } from "@angular/material/bottom-sheet";
import { MatDialog } from "@angular/material/dialog";
import { Subscription } from "rxjs";
import { ApexAnnotations } from "ng-apexcharts";
import * as moment from "moment";
import { 
    IEpochSummary, 
    IPrediction, 
    IPredictionCandlestick, 
    IPredictionState, 
    LocalDatabaseService, 
    PredictionService
} from "../../../core";
import { 
    AppService, 
    ChartService, 
    ICandlestickChartOptions, 
    ILayout, 
    ILineChartOptions, 
    NavService, 
    ValidationsService 
} from "../../../services";
import { IPredictionsComponent, IView } from "./interfaces";
import { EpochPredictionCandlestickDialogComponent, IPredictionCandlestickDialogData } from "./epoch-prediction-candlestick-dialog";

@Component({
  selector: "app-predictions",
  templateUrl: "./predictions.component.html",
  styleUrls: ["./predictions.component.scss"]
})
export class PredictionsComponent implements OnInit, OnDestroy, IPredictionsComponent {
    // Layout
	public layout: ILayout = this._app.layout.value;
	private layoutSub?: Subscription;

    // View
    public view: IView = "line"; 

    // Active Prediction
    public epoch: IEpochSummary|null = null;
    public active: IPrediction|null = null;
    private predictionSub?: Subscription;
    private epochSub?: Subscription;

    // Prediction Lists
    public predictions: IPrediction[] = [];
    public predictionsHistPayload: IPrediction[] = [];
    public hasMore: boolean = true;

    // Predictions History
    public predictionsHist?: ILineChartOptions;

    // Prediction Candlesticks
    public candlesticks: IPredictionCandlestick[] = [];
    public candlesticksChart?: ICandlestickChartOptions;

    // Predictions Grid
    public visibleTilesIncrement: number = 41;
    public visibleTiles: number = this.visibleTilesIncrement;
    public gridCols: number = 6;

    // Starred Predictions
    public starred: {[predTimestamp: string]: IPrediction} = {};
    public starredList: IPrediction[] = [];

    // Initialization State
    public initializing: boolean = false;
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
        private _chart: ChartService,
        private titleService: Title,
        public _prediction: PredictionService,
        private dialog: MatDialog,
    ) { }

    async ngOnInit(): Promise<void> {
        // Initialize layout
        this.layoutSub = this._app.layout.subscribe((nl: ILayout) => {
            this.layout = nl;
            this.gridCols = this.layout == "desktop" ? 6: 1
        });

        /**
         * Initialize the epoch sub briefly. This subscription is destroyed once the 
         * first epoch value is emmited
         */
         this.epochSub = this._app.epoch.subscribe(async (e: IEpochSummary|undefined|null) => {
            if (e != null && !this.initialized) {
                // Kill the subscription
                if (this.epochSub) this.epochSub.unsubscribe();

                // Set init state
                this.initializing = true;

                // Check if an Epoch ID was provided from the URL. If so, initialize it right away.
                const urlEpochID: string|null = this.route.snapshot.paramMap.get("epochID");
                if (typeof urlEpochID == "string" && this._validations.epochIDValid(urlEpochID)) { 
                    await this.initializeEpochData(urlEpochID);
                }

                // Otherwise, check if an active epoch is available
                else if (e){
                    await this.initializeEpochData(e.record.id);
                }

                // Set the init state
                this.initializing = false;
                this.initialized = true;
            } else if (e == undefined) { this.initialized = true  }
        });
    }


    ngOnDestroy(): void {
        if (this.layoutSub) this.layoutSub.unsubscribe();
        if (this.predictionSub) this.predictionSub.unsubscribe();
        if (this.epochSub) this.epochSub.unsubscribe();
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
        this.predictionsHistPayload = [];
        this.view = "line";
        this.visibleTiles = this.visibleTilesIncrement;
        this.starred = {};
        this.starredList = [];
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
        
        // Initialize the starred predictions
        await this.initializeStarredPredictions();
        
        // Subscribe to the active prediction if the epoch matches
        if (this._app.epoch.value && this._app.epoch.value.record.id == epochID) {
            this.predictionSub = this._app.prediction.subscribe(async (pred: IPrediction|null|undefined) => {
                if (pred) {
                    // If it is an actual new prediction, add it to the list
                    if (this.active && pred.t != this.active.t) this.onNewPrediction(pred);

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




    /* View Management */



    /**
     * Activates a given view. In the case of the candlesticks,
     * it loads the data and initializes the chart.
     * @param view 
     * @returns Promise<void>
     */
    public async activateView(view: IView): Promise<void> {
        if (view == "line" || view == "grid") { this.view = view }
        else { return this.activateCandlesticks(7) }
    }







    /**
     * Activates the candlesticks for a given amount of days. If none 
     * are provided, it will prompt the menu.
     * @param days?
     * @returns Promise<void>
     */
    public async activateCandlesticks(days?: number): Promise<void> {
        // If the days were provided, load the data right away
        if (typeof days == "number") {
            this.loaded = false;
            this.view = "candlesticks";
            await this.loadCandlesticks(days);
            this.loaded = true;
        }
        
        // Otherwise, prompt the menu with the options
        else {
            // Display the bottom sheet and handle the action
            const bs: MatBottomSheetRef = this._nav.displayBottomSheetMenu([
                {icon: "waterfall_chart", title: "Last 7 Days", description: "View 1 week worth of data", response: "7"},
                {icon: "waterfall_chart", title: "Last 14 Days", description: "View 2 weeks worth of data", response: "14"},
                {icon: "waterfall_chart", title: "Last 21 Days", description: "View 3 weeks worth of data", response: "21"},
                {icon: "waterfall_chart", title: "Last Month", description: "View 30 days worth of data", response: "30"},
                {icon: "waterfall_chart", title: "Last 1.5 Months", description: "View 45 days worth of data", response: "45"},
                {icon: "waterfall_chart", title: "Last 2 Months", description: "View 60 days worth of data", response: "60"},
                {icon: "waterfall_chart", title: "Last 3 Months", description: "View 90 days worth of data", response: "90"},
            ]);
            bs.afterDismissed().subscribe(async (response: string|undefined) => {
                if (response) {
                    this.loaded = false;
                    this.view = "candlesticks";
                    await this.loadCandlesticks(Number(response));
                    this.loaded = true;
                }
            });
        }

    }






    /**
     * Loads the candlesticks data based on a given number of days.
     * @param days 
     * @returns Promise<void>
     */
    private async loadCandlesticks(days: number): Promise<void> {
        try {
            // Retrieve the candlesticks
            this.candlesticks = await this._localDB.listPredictionCandlesticks(
                this.epoch!.record.id, 
                moment(this._app.serverTime.value).subtract(days, "days").valueOf(),
                this._app.serverTime.value!,
                this.epoch!.record.installed, 
                this._app.serverTime.value!
            );

            // Build the chart
            const minValue: number = -this.epoch!.record.model.regressions.length;
            const maxValue: number = this.epoch!.record.model.regressions.length;
            const annotations: ApexAnnotations = {
                yaxis: [
                    {
                        y: this.epoch!.record.model.min_increase_sum,
                        y2: maxValue,
                        borderColor: this._chart.upwardColor,
                        fillColor: this._chart.upwardColor,
                        strokeDashArray: 3,
                        borderWidth: 0
                    },
                    {
                        y: 0.000001,
                        y2: this.epoch!.record.model.min_increase_sum,
                        borderColor: "#B2DFDB",
                        fillColor: "#B2DFDB",
                        strokeDashArray: 0
                    },
                    {
                        y: this.epoch!.record.model.min_decrease_sum,
                        y2: minValue,
                        borderColor: this._chart.downwardColor,
                        fillColor: this._chart.downwardColor,
                        strokeDashArray: 0
                    },
                    {
                        y: -0.000001,
                        y2: this.epoch!.record.model.min_decrease_sum,
                        borderColor: "#FFCDD2",
                        fillColor: "#FFCDD2",
                        strokeDashArray: 0
                    }
                ]
            };
            this.candlesticksChart = this._chart.getCandlestickChartOptions(
                this.candlesticks, 
                annotations, 
                false, 
                true, 
                //{min: minValue, max: maxValue}
            );
            this.candlesticksChart.chart!.height = this.layout == "desktop" ? 600: 450;
            this.candlesticksChart.chart!.zoom = {enabled: true, type: "xy"};
            const self = this;
            this.candlesticksChart.chart!.events = {
                click: function(event, chartContext, config) {
                    if (self.candlesticks![config.dataPointIndex]) self.displayPredictionCandlestick(self.candlesticks![config.dataPointIndex]);
                }
            }
        } catch(e) { this._app.error(e) } 
    }












    /* Prediction Data Management */



    /**
     * Increases the number of visible grid tiles and checks
     * if more predictions should be loaded.
     * @returns Promise<void>
     */
    public async viewMore(): Promise<void> {
        // Make sure it has more records
        if (this.hasMore || this.visibleTiles < this.predictions.length) {
            // Calculate the new number of visible tiles
            const newVisibleTiles: number = this.visibleTiles + this.visibleTilesIncrement;

            // If there are enough predictions, just increase the window
            if (this.predictions.length < newVisibleTiles) await this.loadPredictions();

            // Update the visibility window
            this.visibleTiles = newVisibleTiles;
        }
    }








    /**
     * Loads the predictions based on the predictions that are currently loaded.
     * Once the predictions are downloaded, it triggers an onDataChanges event.
     * @returns Promise<void>
     */
    public async loadPredictions(): Promise<void> {
        // Make sure it isn"t already loading predictions
        if (this.submitting) return;

        // Set submission state
        this.submitting = true;

        // Retrieve the predictions safely
        try {
            // Download the predictions
            const { startAt, endAt } = this.getPredictionRange();
            const preds: IPrediction[] = await this._localDB.listPredictions(
                this.epoch!.record.id,
                startAt,
                endAt,
                this.epoch!.record.installed
            );
            
            // Concatenate them with the current list
            this.predictionsHistPayload = preds.concat(this.predictionsHistPayload);

            // Check if there are more records
            this.hasMore = preds.length != 0;

            // Emmite a data change event
            this.onDataChanges();
        } catch (e) { this._app.error(e) }

        // Set submission state
        this.submitting = false;
    }






    /**
     * Calculates the prediction range that will be used to query predictions.
     * @returns {startAt: number, endAt: number}
     */
    private getPredictionRange(): {startAt: number, endAt: number} {
        // Init values
        const serverTime: number = this._app.serverTime.value ? this._app.serverTime.value: moment().valueOf();
        let endAt: number = this.predictionsHistPayload.length ? this.predictionsHistPayload[0].t: serverTime;
        let startAt: number = moment(endAt).subtract(3, "hours").valueOf();

        // Finally, return the range
        return { startAt: startAt, endAt: endAt - 1 }
    }







    /**
     * Triggers whenever a new prediction has been downloaded 
     * and needs to be appended.
     */
    private onNewPrediction(pred: IPrediction): void {
        // Preprend it to the list
        this.predictionsHistPayload.push(pred);

        // Emmit the data change event
        this.onDataChanges();
    }









    /**
     * Triggers whenever there is a change in the data and builds
     * all the required data.
     */
     private onDataChanges(): void {
        // Make sure there are records available
        if (this.predictionsHistPayload.length) {
            // Initialize the predictions grid
            this.predictions = this.predictionsHistPayload.slice();
            this.predictions.reverse();

            // Update the Title
            this.titleService.setTitle(`${this._prediction.resultNames[this.predictions[0].r]}: ${this.predictions[0].s}`);

            // Init the color of the prediction sum line
            let predLineColor: string = this._chart.neutralColor;
            if (this.predictions[0].s >= this.epoch!.record.model.min_increase_sum) {
                predLineColor = this._chart.upwardColor;
            } else if (this.predictions[0].s <= this.epoch!.record.model.min_decrease_sum) {
                predLineColor = this._chart.downwardColor;
            }

            // Init the min and max values
            const minValue: number = -this.epoch!.record.model.regressions.length;
            const maxValue: number = this.epoch!.record.model.regressions.length;

            // Build the annotations
            const { markerSize, markerColor, labelColor } = this.getPointAnnotationData();
            const annotations: ApexAnnotations = {
                yaxis: [
                    {
                        y: this.epoch!.record.model.min_increase_sum,
                        y2: maxValue,
                        borderColor: this._chart.upwardColor,
                        fillColor: this._chart.upwardColor,
                        strokeDashArray: 0
                    },
                    {
                        y: 0.000001,
                        y2: this.epoch!.record.model.min_increase_sum,
                        borderColor: "#B2DFDB",
                        fillColor: "#B2DFDB",
                        strokeDashArray: 0
                    },
                    {
                        y: this.epoch!.record.model.min_decrease_sum,
                        y2: minValue,
                        borderColor: this._chart.downwardColor,
                        fillColor: this._chart.downwardColor,
                        strokeDashArray: 0
                    },
                    {
                        y: -0.000001,
                        y2: this.epoch!.record.model.min_decrease_sum,
                        borderColor: "#FFCDD2",
                        fillColor: "#FFCDD2",
                        strokeDashArray: 0
                    }
                ],
                points: [
                    {
                        x: this.predictions[0].t,
                        y: this.predictions[0].s,
                        marker: {
                          size: markerSize,
                          strokeColor: markerColor,
                          strokeWidth: markerSize,
                          shape: "circle", // circle|square
                          offsetX: -5
                        },
                        label: {
                            borderColor: labelColor,
                            style: { 
                                color: "#fff", 
                                background: labelColor
                            },
                            text: String(this.predictions[0].s),
                            offsetX: -30
                        }
                    }
                ]
            };

            // Build/Update the chart
            if (this.predictionsHist) {
                // Update the series
                this.predictionsHist.series = [
                    {
                        name: "Prediction Sum", 
                        data: this.predictionsHistPayload.map((p) => { return {x: p.t, y: p.s } }), 
                        color: predLineColor
                    }
                ]

                // Update the current point
                this.predictionsHist.annotations = annotations;
            } else {
                // Create the chart from scratch
                this.predictionsHist = this._chart.getLineChartOptions(
                    { 
                        series: [
                            {
                                name: "Prediction Sum", 
                                data: this.predictionsHistPayload.map((p) =>  { return {x: p.t, y: p.s } }), 
                                color: predLineColor
                            }
                        ],
                        stroke: {curve: "straight", width:5},
                        annotations: annotations,
                        xaxis: {type: "datetime",tooltip: {enabled: true}, labels: {datetimeUTC: false}}, 
                    },
                    this.layout == "desktop" ? 600: 450, 
                    true,
                    {min: minValue, max: maxValue}
                );
            }

            // Finally, Attach the click event
            const self = this;
            this.predictionsHist.chart.events = {
                click: function(e: any, cc: any, c: any) {
                    if (c.dataPointIndex >= 0 && self.predictionsHistPayload[c.dataPointIndex]) {
                        self._nav.displayPredictionDialog(
                            self.epoch!.record.model, 
                            self.predictionsHistPayload[c.dataPointIndex], 
                            undefined, 
                            undefined,
                            self.epoch!.record
                        )
                    }
                }
            }
        }
    }






    /**
     * Builds the metadata that will be used to populate the monitor's
     * point annotation.
     * @returns {markerSize: number,markerColor: string,label: string,labelColor: string,labelOffsetX: number}
     */
    private getPointAnnotationData(): {
        markerSize: number,
        markerColor: string,
        labelColor: string,
    } {
        // Init values
        let markerSize: number = 3.5; // Min size
        let markerColor: string = this._chart.neutralColor;
        let labelColor: string = this._chart.neutralColor;

        // Check if the active epoch is the one being visualized
        if (this._app.epoch.value && this._app.epoch.value.record.id == this.epoch!.record.id) {
            // Init the state
            const state: IPredictionState = this._app.predictionState.value!;

            // Init the marker color
            if (state > 0) { markerColor = this._chart.upwardColor }
            else if (state < 0) { markerColor = this._chart.downwardColor }

            // Init the marker size
            markerSize = this.getMarkerSize(state);
        }

        // Populate the label color
        labelColor = this.predictions[0].s > 0 ? this._chart.upwardColor: this._chart.downwardColor;

        // Finally, return the data
        return {
            markerSize: markerSize,
            markerColor: markerColor,
            labelColor: labelColor,
        }
    }




    /**
     * Calculates the suggested marker size based on the absolute state 
     * value.
     * @param state 
     * @returns number
     */
    private getMarkerSize(state: IPredictionState): number {
        const absState: number = state < 0 ? -(state): state;
        if      (absState >= 9)    { return 9 }
        else if (absState == 8)    { return 8 }
        else if (absState == 7)    { return 7 }
        else if (absState == 6)    { return 6.5 }
        else if (absState == 5)    { return 6 }
        else if (absState == 4)    { return 5.5 }
        else if (absState == 3)    { return 5 }
        else if (absState == 2)    { return 4.5 }
        else if (absState == 1)    { return 4 }
        else                       { return 3.5 }
    }













    /* Prediction Starring */





    /**
     * Initializes the starred predictions if the browser is compatible
     */
    private async initializeStarredPredictions(): Promise<void> {
        // Retrieve the starred predictions
        this.starredList = await this._localDB.getStarredPredictions();

        // Build the starred object
        this.starred = this.starredList.reduce((acc: {[predTS: string]: IPrediction}, pred) => {
            acc[pred.t] = pred;
            return acc;
        }, {});
    }






    /**
     * Handles the starring or unstarring of a prediction.
     * @param pred 
     * @returns 
     */
    public async starAction(pred: IPrediction): Promise<void> {
        // Check if the prediction is currently starred. If so, prompt the confirmation dialog
        if (this.starred[pred.t]) {
            // Prompt the confirmation dialog
            this._nav.displayConfirmationDialog({
                title: "Unstar Prediction",
                content: `
                    <p class="align-center">
                        Are you sure that you wish to <strong>unstar</strong> the prediction?
                    </p>
                `
            }).afterClosed().subscribe(
                async (confirmed: boolean) => {
                    if (confirmed) {
                        // Delete the prediction from the starred object
                        delete this.starred[pred.t];

                        // Delete the prediction from the local db
                        await this._localDB.unstarPrediction(pred);

                        // Rebuild the list
                        this.starredList = Object.values(this.starred).map((pred) => pred);

                        // Notify the user
                        this._app.success("The prediction has been unstarred successfully.");
                    }
                }
            );
        }

        // Otherwise, star it
        else {
            // Add it to the starred object
            this.starred[pred.t] = pred;

            // Push it to the list
            this.starredList.push(pred);

            // Save it in the local db
            await this._localDB.starPrediction(pred);

            // Notify the user
            this._app.success("The prediction has been starred successfully.");
        }

        // Finally, sort the list
        this.starredList.sort((a, b) => (a.t > b.t) ? -1 : 1)
    }








    /* Prediction Candlestick */




    /**
     * Displays the prediction candlestick dialog.
     * @param candlestick 
     */
    private displayPredictionCandlestick(candlestick: IPredictionCandlestick): void {
        this.dialog.open(EpochPredictionCandlestickDialogComponent, {
			disableClose: false,
			hasBackdrop: this._app.layout.value != "mobile", // Mobile optimization
			panelClass: "small-dialog",
            data: <IPredictionCandlestickDialogData> {
                candlestick: candlestick,
                epoch: this.epoch!.record
            }
		})
    }
}
