import {Component, OnInit, OnDestroy, ViewChild} from "@angular/core";
import {MatSidenav} from "@angular/material/sidenav";
import { MatDialog } from "@angular/material/dialog";
import {Title} from "@angular/platform-browser";
import { Subscription } from "rxjs";
import * as moment from "moment";
import { BigNumber } from "bignumber.js";
import { ApexAnnotations, ApexAxisChartSeries } from "ng-apexcharts";
import { 
    IEpochRecord, 
    IMarketState, 
    IPrediction, 
    IPredictionState, 
    LocalDatabaseService, 
    PredictionService, 
    UtilsService,
    AuthService,
    IUserPreferences,
    IPositionSummary,
    IActivePosition,
    PositionService,
    IBinancePositionSide,
    IPositionStrategy,
    IPositionPriceRange,
    ITAIntervalID,
    IPredictionResult,
    MarketStateService,
    IPredictionCandlestick
} from "../../core";
import { 
    AppService, 
    ChartService, 
    ICandlestickChartOptions, 
    IChartRange, 
    ILayout, 
    ILineChartOptions, 
    NavService 
} from "../../services";
import { FeaturesSumDialogComponent, IFeaturesSumDialogData } from "../../shared/components/epoch-builder";
import { BalanceDialogComponent } from "./balance-dialog";
import { ActivePositionDialogComponent, IActivePositionDialogData } from "./active-position-dialog";
import { StrategyFormDialogComponent } from "./strategy-form-dialog";
import { ITechnicalAnalysisDialogData, TechnicalAnalysisDialogComponent } from "./technical-analysis-dialog";
import { SignalPoliciesDialogComponent } from "./signal-policies-dialog";
import { IDashboardComponent, IPositionCloseChunkSize } from "./interfaces";

@Component({
  selector: "app-dashboard",
  templateUrl: "./dashboard.component.html",
  styleUrls: ["./dashboard.component.scss"]
})
export class DashboardComponent implements OnInit, OnDestroy, IDashboardComponent {
	// Sidenav Element
	@ViewChild("homeSidenav") sidenav: MatSidenav|undefined;
	public sidenavOpened: boolean = false;
	
	// Layout
	public layout: ILayout = this._app.layout.value;
	private layoutSub?: Subscription;

    // User Preferences
    public userPreferences: IUserPreferences = this._localDB.getDefaultUserPreferences();

    // Submenus
    public builderExpanded: boolean = false;

    // New Version Available
    public newVersionAvailable: string|undefined;
    private guiVersionSub?: Subscription;

    // Position
    public position!: IPositionSummary;
    public canOpenLong: boolean = false;
    public longChunkSize?: IPositionCloseChunkSize;
    public canOpenShort: boolean = false;
    public shortChunkSize?: IPositionCloseChunkSize;
    private positionSub?: Subscription;
    private positionLoaded: boolean = false;

    // Prediction Lists
    public epoch?: IEpochRecord;
    public activePrediction?: IPrediction;
    public activeSum?: number;
    public activePredictionState?: IPredictionState;
    public predictions: IPrediction[] = [];
    private predictionSub!: Subscription;
    private predictionsLoaded: boolean = false;

    // Signal
    public signal: IPredictionResult = 0;
    private signalSub?: Subscription;

    // Prediction Charts
    public predictionsChart?: ILineChartOptions;
    public splitPredictionsChart?: ILineChartOptions;
    public displayPredictionCandlesticks: boolean = false;
    public predictionCandlesticksChart?: ICandlestickChartOptions;

    // State
    public state!: IMarketState;
    private stateSub!: Subscription;
    private stateLoaded: boolean = false;

    // Window Chart
    public windowChart?: ICandlestickChartOptions;

    // Volume State Chart
    public volumeChart?: ILineChartOptions;

    // Network Fees State Chart
    public networkFeeChart?: ILineChartOptions;

    // Open Interest State Chart
    public openInterestChart?: ILineChartOptions;

    // Long/Short Ratio State Chart
    public longShortRatioChart?: ILineChartOptions;

    // Desktop Chart height helpers
    public readonly predictionChartDesktopHeight: number = 305;
    private readonly marketStateChartDesktopHeight: number = 110;

    // Loading State
    public loaded: boolean = false;

    // Submission State
    public submitting: boolean = false;
    public submittingText: string = "";

    constructor(
        public _nav: NavService,
        private _localDB: LocalDatabaseService,
        public _app: AppService,
        private dialog: MatDialog,
        private _chart: ChartService,
        private titleService: Title,
        public _prediction: PredictionService,
        private _utils: UtilsService,
        private _auth: AuthService,
        private _position: PositionService,
        public _ms: MarketStateService
    ) { }

    async ngOnInit(): Promise<void> {
        // Initialize layout
        this.layoutSub = this._app.layout.subscribe((nl: ILayout) => this.layout = nl);

        // Initialize the user preferences
        this.userPreferences = await this._localDB.getUserPreferences();

        // Subscribe to be position summary
        this.positionSub = this._app.position.subscribe((pos) => {
            if (pos) {
                this.onActivePositionsUpdate(pos);
                this.positionLoaded = true;
                this.checkLoadState();
            } 
        });

        // Subscribe to the active prediction
        this.predictionSub = this._app.prediction.subscribe(
            async (pred: IPrediction|null|undefined) => {
                // Make sure the predictions have been initialized
                if (pred !== null) {
                    if (pred) { 
                        // Populate the active epoch
                        this.epoch = this._app.epoch.value!;

                        // Load the predictions in case they haven't been
                        if (!this.predictions.length) {
                            try {
                                let endAt: number = this._app.serverTime.value!;
                                let startAt: number = moment(endAt).subtract(15, "minutes").valueOf();
                                const preds: IPrediction[] = await this._localDB.listPredictions(
                                    this.epoch!.id,
                                    startAt,
                                    endAt,
                                    this.epoch!.installed
                                );
                                if (preds.length) {
                                    this.predictions = preds;
                                    this.onNewPrediction(this.predictions[this.predictions.length - 1]);
                                }
                            } catch (e) { this._app.error(e) }
                        }

                        // If it is an actual new prediction, add it to the list
                        if (this.activePrediction && pred.t != this.activePrediction.t) this.onNewPrediction(pred);
                    }

                    // Set loading state
                    this.predictionsLoaded = true;
                    this.checkLoadState();
                }
            }
        )

        // Subscribe to the market state
        this.stateSub = this._app.marketState.subscribe((state: IMarketState|undefined|null) => {
            if (state) {
                // Update the local state
                const prevState: IMarketState|undefined = this.state;
                this.state = state;

                // Update charts
                if (
                    !prevState || 
                    (
                        prevState.window.window.length && 
                        prevState.window.window[prevState.window.window.length - 1].c != this.state.window.window[this.state.window.window.length - 1].c
                    )
                ) {
                    this.onStateUpdate();
                }

                // Set loading state
                this.stateLoaded = true;
                this.checkLoadState();
            }
        });

        // Subscribe to the signal
        this.signalSub = this._app.signal.subscribe((s: IPredictionResult|undefined|null) => {
            if (typeof s == "number") this.signal = s; 
        });

        // Subscribe to the current version
        this.guiVersionSub = this._app.guiVersion.subscribe((newVersion: string|undefined|null) => {
            if (typeof newVersion == "string" && this._app.version != newVersion) {
                this.newVersionAvailable = newVersion;
            } else {
                this.newVersionAvailable = undefined;
            }
        });
    }

    ngOnDestroy(): void {
        if (this.layoutSub) this.layoutSub.unsubscribe();
        if (this.positionSub) this.positionSub.unsubscribe();
        if (this.predictionSub) this.predictionSub.unsubscribe();
        if (this.stateSub) this.stateSub.unsubscribe();
        if (this.signalSub) this.signalSub.unsubscribe();
        if (this.guiVersionSub) this.guiVersionSub.unsubscribe();
        this.titleService.setTitle("Epoca");
    }





    /* Position Update Event Handler */




    /**
     * Populates all the position values adjusted to the current
     * state.
     * @param summary 
     */
    private onActivePositionsUpdate(summary: IPositionSummary): void {
        // Update the local value
        this.position = summary;

        // Check if a long position can be opened
        this.canOpenLong = 
            !this.position.long && 
            this.position.balance.available >= this.position.strategy.position_size && 
            this.position.strategy.long_status;
            //this._app.serverTime.value! >= this.position.strategy.long_idle_until;

        // Check if a short position can be opened
        this.canOpenShort = 
            !this.position.short && 
            this.position.balance.available >= this.position.strategy.position_size && 
            this.position.strategy.short_status;
            //this._app.serverTime.value! >= this.position.strategy.short_idle_until;

        // Reset the close chunk sizes
        this.longChunkSize = undefined;
        this.shortChunkSize = undefined;
        
        // Calculate the Long Close Chunk Sizes (if any)
        if (this.position.long) {
            this.longChunkSize = this.calculateChunkSizes(this.position.long.isolated_margin);
        }

        // Calculate the Short Chunk Sizes (if any)
        if (this.position.short) {
            this.shortChunkSize = this.calculateChunkSizes(this.position.short.isolated_margin);
        }
    }





    /**
     * Calculates the chunk sizes for a position side based on the
     * isolated margin balance.
     * @param isolatedMargin 
     * @returns IPositionCloseChunkSize
     */
    private calculateChunkSizes(isolatedMargin: number): IPositionCloseChunkSize {
        // Initialize the bignumber instance of the margin
        const margin: BigNumber = new BigNumber(isolatedMargin);

        // Finally, return the build
        return {
            1: <number>this._utils.outputNumber(margin),
            0.75: <number>this._utils.outputNumber(margin.times(0.75)),
            0.66: <number>this._utils.outputNumber(margin.times(0.66)),
            0.5: <number>this._utils.outputNumber(margin.times(0.5)),
            0.33: <number>this._utils.outputNumber(margin.times(0.33)),
            0.25: <number>this._utils.outputNumber(margin.times(0.25))
        }
    }











    /* New Prediction Event Handler */





    /**
     * Triggers whenever there is a change in the data and builds
     * all the required data.
     */
     private onNewPrediction(pred: IPrediction): void {
        // Calculate the active sum
        this.activeSum = <number>this._utils.getSum(pred.f, {dp: 8});

        // Add the new prediction
        this.predictions.push(pred);
        if (this.predictions.length > 500) this.predictions = this.predictions.slice(-500);
        this.activePrediction = pred;
        this.activePredictionState = this._app.predictionState.value!;

        // Update the prediction chart
        this.updatePredictionChart();

        // Update the split prediction chart
        this.updateSplitPredictionChart();
    }




    /**
     * Triggers whenever a new prediction comes into existance. Builds or
     * updates the chart accordingly.
     */
    private updatePredictionChart(): void {
        // Init the color of the prediction sum line
        let predLineColor: string = this._chart.neutralColor;
        if (this.predictions[this.predictions.length - 1].r == 1) {
            predLineColor = this._chart.upwardColor;
        } else if (this.predictions[this.predictions.length - 1].r == -1) {
            predLineColor = this._chart.downwardColor;
        }

        // Init the min and max values
        const minValue: number = -this.epoch!.model.regressions.length;
        const maxValue: number = this.epoch!.model.regressions.length;

        // Build the annotations
        const { markerSize, markerColor } = this.getPointAnnotationData();
        const annotations: ApexAnnotations = {
            yaxis: [
                {
                    y: this.epoch!.model.min_increase_sum,
                    y2: maxValue,
                    borderColor: this._chart.upwardColor,
                    fillColor: this._chart.upwardColor,
                    strokeDashArray: 0
                },
                {
                    y: 0.000001,
                    y2: this.epoch!.model.min_increase_sum,
                    borderColor: "#B2DFDB",
                    fillColor: "#B2DFDB",
                    strokeDashArray: 0
                },
                {
                    y: this.epoch!.model.min_decrease_sum,
                    y2: minValue,
                    borderColor: this._chart.downwardColor,
                    fillColor: this._chart.downwardColor,
                    strokeDashArray: 0
                },
                {
                    y: -0.000001,
                    y2: this.epoch!.model.min_decrease_sum,
                    borderColor: "#FFCDD2",
                    fillColor: "#FFCDD2",
                    strokeDashArray: 0
                }
            ],
            points: [
                {
                    x: this.predictions[this.predictions.length - 1].t,
                    y: this.predictions[this.predictions.length - 1].s,
                    marker: {
                        size: markerSize,
                        strokeColor: markerColor,
                        strokeWidth: markerSize,
                        shape: "circle", // circle|square
                        offsetX: -5
                    }
                }
            ]
        };

        // Build/Update the chart
        if (this.predictionsChart) {
            // Update the series
            this.predictionsChart.series = [
                {
                    name: "Prediction Sum", 
                    data: this.predictions.map((p) => { return {x: p.t, y: this._utils.outputNumber(p.s, {dp: 6}) } }), 
                    color: predLineColor
                }
            ]

            // Update the current point
            this.predictionsChart.annotations = annotations;
        } else {
            // Create the chart from scratch
            this.predictionsChart = this._chart.getLineChartOptions(
                { 
                    series: [
                        {
                            name: "Prediction Sum", 
                            data: this.predictions.map((p) =>  { return {x: p.t, y: this._utils.outputNumber(p.s, {dp: 6}) } }), 
                            color: predLineColor
                        }
                    ],
                    stroke: {curve: "straight", width:5},
                    annotations: annotations,
                    xaxis: {
                        type: "datetime",
                        tooltip: {enabled: true, }, 
                        labels: {datetimeUTC: false, formatter: function(value, opts): string {
                            return moment(value).format("h:mm a")
                        }}
                    }, 
                    yaxis: { tooltip: {enabled: true}}
                },
                this.layout == "desktop" ? this.predictionChartDesktopHeight: 330, 
                true,
                {min: minValue, max: maxValue}
            );
        }
    }




    /**
     * Builds the metadata that will be used to populate the monitor's
     * point annotation.
     * @returns {markerSize: number,markerColor: string}
     */
    private getPointAnnotationData(): {markerSize: number, markerColor: string} {
        // Init values
        let markerSize: number = 3.5; // Min size
        let markerColor: string = this._chart.neutralColor;

        // Check if the active epoch is the one being visualized
        if (this._app.epoch.value && this._app.epoch.value.id == this.epoch!.id) {
            // Init the state
            const state: IPredictionState = this._app.predictionState.value!;

            // Init the marker color
            if (state > 0) { markerColor = this._chart.upwardColor }
            else if (state < 0) { markerColor = this._chart.downwardColor }

            // Init the marker size
            markerSize = this.getMarkerSize(state);
        }

        // Finally, return the data
        return { markerSize: markerSize, markerColor: markerColor }
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





    /**
     * Triggers whenever a new prediction comes into existance. Builds or
     * updates the chart accordingly.
     */
     private updateSplitPredictionChart(): void {
        // Init the series
        let series: ApexAxisChartSeries = [];

        // Build the list of features
        const features: Array<{x: number, y: number[]}> = this.predictions.map((p) => { return { x: p.t, y: p.f} });

        // Build the color list based on their active predictions
        const colors: string[] = this.activePrediction!.f.map((f) => {
            if (f >= 0.5) { return this._chart.upwardColor }
            else if (f >= 0.000001 && f < 0.5) { return "#4DB6AC" }
            else if (f > -0.5 && f <= -0.000001) { return "#E57373" }
            else if (f <= -0.5) { return this._chart.downwardColor }
            else { return this._chart.neutralColor}
        });

        // Iterate over each regression and populate the values
        for (let i = 0; i < this.epoch!.model.regressions.length; i++) {
            series.push({
                name: this.epoch!.model.regressions[i].id.slice(0, 12) + "...",
                data: features.map((f) => { return {x: f.x, y: f.y[i]}}),
                color: colors[i]
            });
        }

        // Build/Update the chart
        if (this.splitPredictionsChart) {
            // Update the series
            this.splitPredictionsChart.series = series;
        } else {
            // Build the annotations
            const annotations: ApexAnnotations = {
                yaxis: [
                    {
                        y: 0.500000,
                        y2: 1.000000,
                        borderColor: this._chart.upwardColor,
                        fillColor: this._chart.upwardColor,
                        strokeDashArray: 0
                    },
                    {
                        y: 0.000001,
                        y2: 0.499999,
                        borderColor: "#B2DFDB",
                        fillColor: "#B2DFDB",
                        strokeDashArray: 0
                    },
                    {
                        y: -0.500000,
                        y2: -1.000000,
                        borderColor: this._chart.downwardColor,
                        fillColor: this._chart.downwardColor,
                        strokeDashArray: 0
                    },
                    {
                        y: -0.000001,
                        y2: -0.499999,
                        borderColor: "#FFCDD2",
                        fillColor: "#FFCDD2",
                        strokeDashArray: 0
                    }
                ]
            };

            // Create the chart from scratch
            this.splitPredictionsChart = this._chart.getLineChartOptions(
                { 
                    series: series,
                    stroke: {curve: "straight", width:3},
                    annotations: annotations,
                    xaxis: {
                        type: "datetime",
                        tooltip: {enabled: true, }, 
                        labels: {datetimeUTC: false, formatter: function(value, opts): string {
                            return moment(value).format("h:mm a")
                        }}
                    },
                    yaxis: { tooltip: {enabled: true}}
                },
                this.layout == "desktop" ? this.predictionChartDesktopHeight: 330, 
                true,
                {min: -1, max: 1}
            );
        }
    }





    /**
     * Activates the prediction candlesticks chart once the data is
     * loaded.
     * @returns Promise<void>
     */
    public async activatePredictionCandlesticks(): Promise<void> {
        try {
            // Init the section
            this.displayPredictionCandlesticks = true;
            this.predictionCandlesticksChart = undefined;
            
            // Retrieve the candlesticks
            const candlesticks: IPredictionCandlestick[] = await this._localDB.listPredictionCandlesticks(
                this.epoch!.id, 
                moment(this._app.serverTime.value!).subtract(5, "days").valueOf(),
                this._app.serverTime.value!,
                this.epoch!.installed, 
                this._app.serverTime.value!
            );

            // Build the chart
            const minValue: number = -this.epoch!.model.regressions.length;
            const maxValue: number = this.epoch!.model.regressions.length;
            const annotations: ApexAnnotations = {
                yaxis: [
                    {
                        y: this.epoch!.model.min_increase_sum,
                        y2: maxValue,
                        borderColor: this._chart.upwardColor,
                        fillColor: this._chart.upwardColor,
                        strokeDashArray: 3,
                        borderWidth: 0
                    },
                    {
                        y: 0.000001,
                        y2: this.epoch!.model.min_increase_sum,
                        borderColor: "#B2DFDB",
                        fillColor: "#B2DFDB",
                        strokeDashArray: 0
                    },
                    {
                        y: this.epoch!.model.min_decrease_sum,
                        y2: minValue,
                        borderColor: this._chart.downwardColor,
                        fillColor: this._chart.downwardColor,
                        strokeDashArray: 0
                    },
                    {
                        y: -0.000001,
                        y2: this.epoch!.model.min_decrease_sum,
                        borderColor: "#FFCDD2",
                        fillColor: "#FFCDD2",
                        strokeDashArray: 0
                    }
                ]
            };
            this.predictionCandlesticksChart = this._chart.getCandlestickChartOptions(
                candlesticks, 
                annotations, 
                false, 
                true, 
                {min: minValue, max: maxValue}
            );
            this.predictionCandlesticksChart.chart!.height = this.layout == "desktop" ? this.predictionChartDesktopHeight: 330;
            this.predictionCandlesticksChart.chart!.zoom = {enabled: false};
            this.predictionCandlesticksChart.title = {text: ""};
        } catch(e) { this._app.error(e) } 
    }



    /**
     * Deactivates the prediction candlesticks chart and retores
     * the active trend chart.
     */
    public deactivatePredictionCandlesticks(): void {
        this.displayPredictionCandlesticks = false;
        this.predictionCandlesticksChart = undefined;
    }









    /* State Update Event Handler */



    /**
     * Whenever a new state is retrieved, it builds all the required charts.
     */
    private onStateUpdate(): void {
        // Update the window state chart
        this.updateWindowState();

        // Update the volume state chart
        this.updateVolumeState();

        // Update the network fee state chart
        this.updateNetworkFeeState();

        // Update the open interest state chart
        this.updateOpenInterestState();

        // Update the long short state chart
        this.updateLongShortRatioState();

        // Update the title
        const price: string = <string>this._utils.outputNumber(
            this.state.window.window[this.state.window.window.length - 1].c, 
            {dp: 0, of: "s"}
        );
        let newTitle: string = `$${price}`;
        if (this.activeSum) {
            newTitle += `: ${this._utils.outputNumber(this.activeSum, {dp: 1})}`;
            if (this.activePredictionState) {
                newTitle += ` ${this.activePredictionState > 0 ? '+':''}${this.activePredictionState}`;
            }
            this.titleService.setTitle(newTitle);
        } else {
            this.titleService.setTitle(newTitle);
        }
    }




    /**
     * Triggers whenever a new state is downloaded and builds the window chart.
     */
    private updateWindowState(): void {
        // Calculate the chart's range
        const { min, max } = this.getWindowStateRange();

        // Build/update the chart
        if (this.windowChart) {
            // Update the range
            this.windowChart.yaxis = { tooltip: { enabled: true }, forceNiceScale: false, min: min, max: max};

            // Update the series
            this.windowChart.series = [
                {
                    name: "candle",
                    data: this._chart.getApexCandlesticks(this.state.window.window)
                }
            ];

            // Update the annotations
            this.windowChart.annotations = this.buildWindowAnnotations();
        } else {
            this.windowChart = this._chart.getCandlestickChartOptions(
                this.state.window.window, 
                this.buildWindowAnnotations(), 
                false, 
                true,
                { min:  min, max: max }
            );
            this.windowChart.chart!.height = this.layout == "desktop" ? 630: 400;
            this.windowChart.chart!.zoom = {enabled: false};
            this.windowChart.chart!.toolbar!.show = false;
        }
    }



    /**
     * Calculates the price range the chart should be built on.
     * @returns IChartRange
     */
    private getWindowStateRange(): IChartRange {
        // Init the values
        let min: number = <number>this._utils.alterNumberByPercentage(this.state.window.lower_band.end, -0.5);
        let max: number = <number>this._utils.alterNumberByPercentage(this.state.window.upper_band.end, 0.5);

        // Check if there is a long position
        if (this.position.long) {
            min = this.position.long.stop_loss_price < min ? this.position.long.stop_loss_price: min;
            max = this.position.long.take_profit_price_5 > max ? this.position.long.take_profit_price_5: max;
        }

        // Check if there is a short position
        if (this.position.short) {
            min = this.position.short.take_profit_price_5 < min ? this.position.short.take_profit_price_5: min;
            max = this.position.short.stop_loss_price > max ? this.position.short.stop_loss_price: max;
        }

        // Finally, return the range
        return { min: min, max: max }
    }




    /**
     * Builds the annotations for the keyzones and any other element
     * that may require it.
     * @returns ApexAnnotations
     */
    private buildWindowAnnotations(): ApexAnnotations {
        // Init the annotations
        let annotations: ApexAnnotations = { yaxis: [] };


        /* Position Annotations */
        
        // Long Position
        if (this.position.long) {
            annotations.yaxis!.push({
                y: this.position.long.entry_price,
                strokeDashArray: 0,
                borderColor: this._chart.upwardColor,
                fillColor: this._chart.upwardColor,
                label: {
                    borderColor: this._chart.upwardColor,
                    style: { color: "#fff", background: this._chart.upwardColor},
                    text: `LONG`,
                    position: "left",
                    offsetX: 38
                }
            });
            annotations.yaxis!.push({
                y: this.position.long.take_profit_price_1,
                strokeDashArray: 0,
                borderColor: this._chart.upwardColor,
                fillColor: this._chart.upwardColor,
                label: {
                    borderColor: this._chart.upwardColor,
                    style: { color: "#fff", background: this._chart.upwardColor},
                    text: `TAKE_PROFIT_1`,
                    position: "left",
                    offsetX: 92
                }
            });
            annotations.yaxis!.push({
                y: this.position.long.take_profit_price_2,
                strokeDashArray: 0,
                borderColor: this._chart.upwardColor,
                fillColor: this._chart.upwardColor,
                label: {
                    borderColor: this._chart.upwardColor,
                    style: { color: "#fff", background: this._chart.upwardColor},
                    text: `TAKE_PROFIT_2`,
                    position: "left",
                    offsetX: 92
                }
            });
            annotations.yaxis!.push({
                y: this.position.long.take_profit_price_3,
                strokeDashArray: 0,
                borderColor: this._chart.upwardColor,
                fillColor: this._chart.upwardColor,
                label: {
                    borderColor: this._chart.upwardColor,
                    style: { color: "#fff", background: this._chart.upwardColor},
                    text: `TAKE_PROFIT_3`,
                    position: "left",
                    offsetX: 92
                }
            });
            annotations.yaxis!.push({
                y: this.position.long.take_profit_price_4,
                strokeDashArray: 0,
                borderColor: this._chart.upwardColor,
                fillColor: this._chart.upwardColor,
                label: {
                    borderColor: this._chart.upwardColor,
                    style: { color: "#fff", background: this._chart.upwardColor},
                    text: `TAKE_PROFIT_4`,
                    position: "left",
                    offsetX: 92
                }
            });
            annotations.yaxis!.push({
                y: this.position.long.take_profit_price_5,
                strokeDashArray: 0,
                borderColor: this._chart.upwardColor,
                fillColor: this._chart.upwardColor,
                label: {
                    borderColor: this._chart.upwardColor,
                    style: { color: "#fff", background: this._chart.upwardColor},
                    text: `TAKE_PROFIT_5`,
                    position: "left",
                    offsetX: 92
                }
            });
            annotations.yaxis!.push({
                y: this.position.long.stop_loss_price,
                strokeDashArray: 0,
                borderColor: this._chart.upwardColor,
                fillColor: this._chart.upwardColor,
                label: {
                    borderColor: this._chart.upwardColor,
                    style: { color: "#fff", background: this._chart.upwardColor},
                    text: `STOP_LOSS`,
                    position: "left",
                    offsetX: 71
                }
            });
        }

        // Short Position
        if (this.position.short) {
            annotations.yaxis!.push({
                y: this.position.short.entry_price,
                strokeDashArray: 0,
                borderColor: this._chart.downwardColor,
                fillColor: this._chart.downwardColor,
                label: {
                    borderColor: this._chart.downwardColor,
                    style: { color: "#fff", background: this._chart.downwardColor},
                    text: `SHORT`,
                    position: "left",
                    offsetX: 44
                }
            });
            annotations.yaxis!.push({
                y: this.position.short.take_profit_price_1,
                strokeDashArray: 0,
                borderColor: this._chart.downwardColor,
                fillColor: this._chart.downwardColor,
                label: {
                    borderColor: this._chart.downwardColor,
                    style: { color: "#fff", background: this._chart.downwardColor},
                    text: `TAKE_PROFIT_1`,
                    position: "left",
                    offsetX: 92
                }
            });
            annotations.yaxis!.push({
                y: this.position.short.take_profit_price_2,
                strokeDashArray: 0,
                borderColor: this._chart.downwardColor,
                fillColor: this._chart.downwardColor,
                label: {
                    borderColor: this._chart.downwardColor,
                    style: { color: "#fff", background: this._chart.downwardColor},
                    text: `TAKE_PROFIT_2`,
                    position: "left",
                    offsetX: 92
                }
            });
            annotations.yaxis!.push({
                y: this.position.short.take_profit_price_3,
                strokeDashArray: 0,
                borderColor: this._chart.downwardColor,
                fillColor: this._chart.downwardColor,
                label: {
                    borderColor: this._chart.downwardColor,
                    style: { color: "#fff", background: this._chart.downwardColor},
                    text: `TAKE_PROFIT_3`,
                    position: "left",
                    offsetX: 92
                }
            });
            annotations.yaxis!.push({
                y: this.position.short.take_profit_price_4,
                strokeDashArray: 0,
                borderColor: this._chart.downwardColor,
                fillColor: this._chart.downwardColor,
                label: {
                    borderColor: this._chart.downwardColor,
                    style: { color: "#fff", background: this._chart.downwardColor},
                    text: `TAKE_PROFIT_4`,
                    position: "left",
                    offsetX: 92
                }
            });
            annotations.yaxis!.push({
                y: this.position.short.take_profit_price_5,
                strokeDashArray: 0,
                borderColor: this._chart.downwardColor,
                fillColor: this._chart.downwardColor,
                label: {
                    borderColor: this._chart.downwardColor,
                    style: { color: "#fff", background: this._chart.downwardColor},
                    text: `TAKE_PROFIT_5`,
                    position: "left",
                    offsetX: 92
                }
            });
            annotations.yaxis!.push({
                y: this.position.short.stop_loss_price,
                strokeDashArray: 0,
                borderColor: this._chart.downwardColor,
                fillColor: this._chart.downwardColor,
                label: {
                    borderColor: this._chart.downwardColor,
                    style: { color: "#fff", background: this._chart.downwardColor},
                    text: `STOP_LOSS`,
                    position: "left",
                    offsetX: 71
                }
            });
        }



        /* Window State Annotations */
        const currentPrice: number = this.state.window.window[this.state.window.window.length - 1].c
        let windowStateColor: string = this._chart.neutralColor;
        let annOffset: {x: number, y: number} = {x: -15, y: -30};
        if (this.state.window.state > 0) { 
            windowStateColor = this._chart.upwardColor;
            annOffset.y = 30;
        }
        else if (this.state.window.state < 0) { 
            windowStateColor = this._chart.downwardColor;
        }
        annotations.yaxis!.push({
            y: currentPrice,
            strokeDashArray: 0,
            borderColor: "",
            fillColor: "",
            label: {
                borderColor: windowStateColor,
                style: { color: "#fff", background: windowStateColor, fontSize: "12px", padding: {top: 4, right: 4, left: 4, bottom: 4}},
                text: `$${this._utils.formatNumber(currentPrice, 0)} | ${this.state.window.state_value > 0 ? '+': ''}${this._utils.formatNumber(this.state.window.state_value, 1)}%`,
                position: "right",
                offsetY: annOffset.y,
                offsetX: annOffset.x
            }
        });

        // Finally, return the annotations
        return annotations;
    }







    /**
     * Triggers whenever a new state is downloaded and builds the volume chart.
     */
     private updateVolumeState(): void {
        // Init the color of the prediction sum line
        let lineColor: string = this._chart.neutralColor;
        if (this.state.volume.state > 0) {
            lineColor = this._chart.upwardColor;
        } else if (this.state.volume.state < 0) {
            lineColor = this._chart.downwardColor;
        }

        // Init the min and max values
        const minValue: number = this.state.volume.lower_band.end;
        const maxValue: number = this.state.volume.upper_band.end;

        // Build/Update the chart
        if (this.volumeChart) {
            // Update the range
            this.volumeChart.yaxis = { 
                tooltip: { enabled: false }, 
                labels: { show: false},
                axisTicks: { show: false},
                axisBorder: { show: false},
                forceNiceScale: false, min: minValue, max: maxValue
            };

            // Update the series
            this.volumeChart.series = [
                {
                    name: "USDT Volume Mean", 
                    data: this.state.volume.volumes, 
                    color: lineColor
                }
            ]
        } else {
            // Create the chart from scratch
            this.volumeChart = this._chart.getLineChartOptions(
                { 
                    series: [
                        {
                            name: "USDT Volume Mean", 
                            data: this.state.volume.volumes, 
                            color: lineColor
                        }
                    ],
                    stroke: {curve: "smooth", width:5},
                },
                this.layout == "desktop" ? this.marketStateChartDesktopHeight: 150, 
                true,
                { max: maxValue, min: minValue}
            );
            this.volumeChart.yaxis.labels = {show: false}
            this.volumeChart.xaxis.axisTicks = {show: false}
            this.volumeChart.xaxis.axisBorder = {show: false}
        }
    }





    /**
     * Triggers whenever a new state is downloaded and builds the network fee chart.
     */
     private updateNetworkFeeState(): void {
        // Init the color of the prediction sum line
        let lineColor: string = this._chart.neutralColor;
        if (this.state.network_fee.state > 0) {
            lineColor = this._chart.upwardColor;
        } else if (this.state.network_fee.state < 0) {
            lineColor = this._chart.downwardColor;
        }

        // Init the min and max values
        const minValue: number = this.state.network_fee.lower_band.end;
        const maxValue: number = this.state.network_fee.upper_band.end;

        // Build/Update the chart
        if (this.networkFeeChart) {
            // Update the range
            this.networkFeeChart.yaxis = { 
                tooltip: { enabled: false }, 
                labels: { show: false},
                axisTicks: { show: false},
                axisBorder: { show: false},
                forceNiceScale: false, min: minValue, max: maxValue
            };

            // Update the series
            this.networkFeeChart.series = [
                {
                    name: "Sats per byte", 
                    data: this.state.network_fee.fees, 
                    color: lineColor
                }
            ]
        } else {
            // Create the chart from scratch
            this.networkFeeChart = this._chart.getLineChartOptions(
                { 
                    series: [
                        {
                            name: "Sats per byte", 
                            data: this.state.network_fee.fees, 
                            color: lineColor
                        }
                    ],
                    stroke: {curve: "smooth", width:5},
                },
                this.layout == "desktop" ? this.marketStateChartDesktopHeight: 150, 
                true,
                { max: maxValue, min: minValue}
            );
            this.networkFeeChart.yaxis.labels = {show: false}
            this.networkFeeChart.xaxis.axisTicks = {show: false}
            this.networkFeeChart.xaxis.axisBorder = {show: false}
        }
    }





    /**
     * Triggers whenever a new state is downloaded and builds the open interest chart.
     */
     private updateOpenInterestState(): void {
        // Init the color of the prediction sum line
        let lineColor: string = this._chart.neutralColor;
        if (this.state.open_interest.state > 0) {
            lineColor = this._chart.upwardColor;
        } else if (this.state.open_interest.state < 0) {
            lineColor = this._chart.downwardColor;
        }

        // Init the min and max values
        const minValue: number = this.state.open_interest.lower_band.end;
        const maxValue: number = this.state.open_interest.upper_band.end;

        // Build/Update the chart
        if (this.openInterestChart) {
            // Update the range
            this.openInterestChart.yaxis = { 
                tooltip: { enabled: false }, 
                labels: { show: false},
                axisTicks: { show: false},
                axisBorder: { show: false},
                forceNiceScale: false, min: minValue, max: maxValue
            };

            // Update the series
            this.openInterestChart.series = [
                {
                    name: "USDT", 
                    data: this.state.open_interest.interest, 
                    color: lineColor
                }
            ]
        } else {
            // Create the chart from scratch
            this.openInterestChart = this._chart.getLineChartOptions(
                { 
                    series: [
                        {
                            name: "USDT", 
                            data: this.state.open_interest.interest, 
                            color: lineColor
                        }
                    ],
                    stroke: {curve: "smooth", width:5},
                },
                this.layout == "desktop" ? this.marketStateChartDesktopHeight: 150, 
                true,
                { max: maxValue, min: minValue}
            );
            this.openInterestChart.yaxis.labels = {show: false}
            this.openInterestChart.xaxis.axisTicks = {show: false}
            this.openInterestChart.xaxis.axisBorder = {show: false}
        }
    }






    /**
     * Triggers whenever a new state is downloaded and builds the long/short ratio chart.
     */
     private updateLongShortRatioState(): void {
        // Init the color of the prediction sum line
        let lineColor: string = this._chart.neutralColor;
        if (this.state.long_short_ratio.state > 0) {
            lineColor = this._chart.upwardColor;
        } else if (this.state.long_short_ratio.state < 0) {
            lineColor = this._chart.downwardColor;
        }

        // Init the min and max values
        const minValue: number = this.state.long_short_ratio.lower_band.end;
        const maxValue: number = this.state.long_short_ratio.upper_band.end;

        // Build/Update the chart
        if (this.longShortRatioChart) {
            // Update the range
            this.longShortRatioChart.yaxis = { 
                tooltip: { enabled: false }, 
                labels: { show: false},
                axisTicks: { show: false},
                axisBorder: { show: false},
                forceNiceScale: false, min: minValue, max: maxValue
            };

            // Update the series
            this.longShortRatioChart.series = [
                {
                    name: "Long vs Short", 
                    data: this.state.long_short_ratio.ratio, 
                    color: lineColor
                }
            ]
        } else {
            // Create the chart from scratch
            this.longShortRatioChart = this._chart.getLineChartOptions(
                { 
                    series: [
                        {
                            name: "Long vs Short", 
                            data: this.state.long_short_ratio.ratio, 
                            color: lineColor
                        }
                    ],
                    stroke: {curve: "smooth", width:5},
                },
                this.layout == "desktop" ? this.marketStateChartDesktopHeight: 150, 
                true,
                { max: maxValue, min: minValue}
            );
            this.longShortRatioChart.yaxis.labels = {show: false}
            this.longShortRatioChart.xaxis.axisTicks = {show: false}
            this.longShortRatioChart.xaxis.axisBorder = {show: false}
        }
    }







    /* Position Management */



    /**
     * Displays the confirmation dialog in order to open
     * a new position.
     * @param side 
     */
    public openPosition(side: IBinancePositionSide): void {
        const strat: IPositionStrategy = this.position.strategy;
        const entry: number = this.state.window.window[this.state.window.window.length - 1].c;
        const take_profit_price: number = <number>this._utils.alterNumberByPercentage(
            entry, 
            side == "LONG" ? strat.take_profit_1.price_change_requirement: -(strat.take_profit_1.price_change_requirement)
        );
        const stop_loss_price: number = <number>this._utils.alterNumberByPercentage(
            entry, 
            side == "LONG" ? -(strat.stop_loss): strat.stop_loss
        );
        const range: IPositionPriceRange = this._position.calculatePositionPriceRange(
            side, 
            strat.leverage, 
            [ { price: entry, margin: strat.position_size} ]
        );
        this._nav.displayConfirmationDialog({
            title: `Open ${side}`,
            content: `
                <table class="confirmation-dialog-table bordered">
                    <tbody>
                        <tr>
                            <td><strong>Entry</strong></td>
                            <td class="align-right">$${entry}</td>
                        </tr>
                        <tr>
                            <td><strong>Take Profit 1</strong></td>
                            <td class="align-right">$${take_profit_price}</td>
                        </tr>
                        <tr>
                            <td><strong>Stop Loss</strong></td>
                            <td class="align-right">$${stop_loss_price}</td>
                        </tr>
                        <tr>
                            <td><strong>Liquidation</strong></td>
                            <td class="align-right">$${range.liquidation}</td>
                        </tr>
                        <tr>
                            <td><strong>Margin</strong></td>
                            <td class="align-right">$${strat.position_size}</td>
                        </tr>
                    </tbody>
                </table>
            `,
            otpConfirmation: true
        }).afterClosed().subscribe(
            async (otp: string|undefined) => {
                if (otp) {
                    // Set Submission State
                    this.setSubmission(`Opening ${side} Position...`);
                    try {
                        // Perform Action
                        await this._position.open(side, otp);
                        await this._app.refreshAppBulk();

                        // Notify
                        this._app.success(`The ${side} position was opened successfully.`);

                        // Set Submission State
                        this.setSubmission();
                    } catch(e) { this._app.error(e) }

                    // Set Submission State
                    this.setSubmission();
                }
            }
        );
    }




    /**
     * Displays the confirmation dialog in order to close
     * an existing position.
     * @param side 
     * @param chunkSize 
     */
    public closePosition(side: IBinancePositionSide, chunkSize: number): void {
        // Initialize the position
        const position: IActivePosition = side == "LONG" ? this.position.long!: this.position.short!;

        // Calculate the PNL's color
        let pnlClass: string = "light-text";
        if (position.unrealized_pnl > 0) { pnlClass = "success-color" }
        else if (position.unrealized_pnl < 0) { pnlClass = "error-color" }

        // Calculate the margin, pnl & row based on the chunk size
        const margin: number = <number>this._utils.outputNumber(new BigNumber(position.isolated_margin).times(chunkSize), {dp: 2});
        const pnl: number = <number>this._utils.outputNumber(new BigNumber(position.unrealized_pnl).times(chunkSize), {dp: 2});
        const roe: number = <number>this._utils.outputNumber(new BigNumber(position.roe).times(chunkSize), {dp: 2});

        let confirmContent: string = `
            <table class="confirmation-dialog-table bordered">
                <tbody>
                    <tr>
                        <td><strong>Entry</strong></td>
                        <td class="align-right">$${position.entry_price}</td>
                    </tr>
                    <tr>
                        <td><strong>Exit</strong></td>
                        <td class="align-right">$${position.mark_price}</td>
                    </tr>
                    <tr>
                        <td><strong>Margin</strong></td>
                        <td class="align-right">$${margin}</td>
                    </tr>
                    <tr>
                        <td><strong>PNL</strong></td>
                        <td class="align-right"><strong><span class="${pnlClass}">$${pnl} (${roe}%)</strong></td>
                    </tr>
                </tbody>
            </table>
        `;
        if (position.unrealized_pnl < 0) {
            confirmContent += `
                <p class="margin-top align-center ts-m error-color">
                    <strong>Warning:</strong> you're about to close a <strong>${side}</strong> position with a 
                    <strong>negative PNL</strong>
                </p>
            `;
        }
        this._nav.displayConfirmationDialog({
            title: `Close ${side} ${chunkSize * 100}%`,
            content: confirmContent,
            otpConfirmation: true
        }).afterClosed().subscribe(
            async (otp: string|undefined) => {
                if (otp) {
                    // Set Submission State
                    this.setSubmission(`Closing ${side} Position...`);
                    try {
                        // Perform Action
                        await this._position.close(side, chunkSize, otp);
                        await this._app.refreshAppBulk();

                        // Notify
                        this._app.success(`The ${side} position was closed successfully.`);

                        // Set Submission State
                        this.setSubmission();
                    } catch(e) { this._app.error(e) }

                    // Set Submission State
                    this.setSubmission();
                }
            }
        );
    }






    /* Misc Helpers */



    /**
     * Toggles the kind of trend chart to display.
     * @returns Promise<void>
     */
    public async toggleTrendChart(): Promise<void> {
        this.userPreferences.splitTrendChart = !this.userPreferences.splitTrendChart;
        await this._localDB.saveUserPreferences(this.userPreferences);
    }




    /**
     * Displays the strategy form dialog.
     */
    public displayStrategyFormDialog(): void {
		this.dialog.open(StrategyFormDialogComponent, {
			hasBackdrop: true,
            disableClose: true,
			panelClass: "small-dialog",
            data: this.position.strategy
		})
	}



	/**
	 * Displays the balance dialog.
	 */
    public displayBalanceDialog(): void {
		this.dialog.open(BalanceDialogComponent, {
			hasBackdrop: true,
			panelClass: "light-dialog",
			data: this.position.balance
		})
	}





	/**
	 * Displays the position information dialog.
	 */
    public displayPositionDialog(position: IActivePosition): void {
		this.dialog.open(ActivePositionDialogComponent, {
			hasBackdrop: true,
            disableClose: false,
			panelClass: "small-dialog",
            data: <IActivePositionDialogData> {
                strategy: this.position.strategy,
                position: position,
                health: position.side == "LONG" ? this.position.health.long: this.position.health.short,
                window: this.state.window.window
            }
		})
	}







    
	/**
	 * Displays the features dedicated dialog to gather more information
	 * about the prediction.
	 */
    public displaySignalPoliciesDialog(): void {
		this.dialog.open(SignalPoliciesDialogComponent, {
			hasBackdrop: true,
            disableClose: true,
			panelClass: "small-dialog",
            data: {}
		})
	}



    
	/**
	 * Displays the features dedicated dialog to gather more information
	 * about the prediction.
	 */
     public displayFeaturesDialog(): void {
		this.dialog.open(FeaturesSumDialogComponent, {
			hasBackdrop: true,
			panelClass: "light-dialog",
            data: <IFeaturesSumDialogData>{
                sum: this.activeSum,
                features: this.activePrediction!.f,
                result: this.activePrediction!.r,
                model: this.epoch!.model
            }
		})
	}



    

	/**
	 * Displays the features dedicated dialog to gather more information
	 * about the prediction.
     * @param taInterval
	 */
    public displayTechnicalAnalysisDialog(taInterval: ITAIntervalID): void {
		this.dialog.open(TechnicalAnalysisDialogComponent, {
			hasBackdrop: this._app.layout.value != "mobile",
			panelClass: "medium-dialog",
			data: <ITechnicalAnalysisDialogData> {
                id: taInterval,
                state: this.state.technical_analysis
            }
		})
	}





    

    /**
     * Checks if all the required data has been loaded.
     */
    private checkLoadState(): void {
        this.loaded = this.positionLoaded && this.predictionsLoaded && this.stateLoaded;
    }






    /**
     * Enables/Disables the submission state on the component.
     * @param action 
     */
    private setSubmission(action?: string): void {
        if (typeof action == "string") {
            this.submittingText = action;
            this.submitting = true;
        } else {
            this.submitting = false;
        }
    }












    

    /* Nav Actions */




	/*
	* Creates a new instance of Epoca.
	* @returns void
	* */
	public createNewInstance(): void { this._nav.openUrl(window.location.href) }



	/*
	* Signs the user out
	* @returns void
	* */
	public signOut(): void {
        this._nav.displayConfirmationDialog({
            title: "Sign Out",
            content: "<p class='align-center'>If you confirm the action, your session will be destroyed on all your active tabs.</p>"
        }).afterClosed().subscribe(
            async (confirmed: boolean) => {
                if (confirmed) {
                    // Sign the user out
                    try {
                        // Close the sidenav if opened
                        if (this.sidenavOpened) await this.sidenav?.close(); 
                        await this._nav.signIn();
                        await this._auth.signOut();
                        this._app.success("The session has been destroyed successfully.");
                    } catch (e) { this._app.error(e) }
                }
            }
        );
	}
}

