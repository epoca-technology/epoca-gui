import {Component, OnInit, OnDestroy, ViewChild} from "@angular/core";
import {MatSidenav} from "@angular/material/sidenav";
import { MatDialog } from "@angular/material/dialog";
import {Title} from "@angular/platform-browser";
import { Subscription } from "rxjs";
import * as moment from "moment";
import { BigNumber } from "bignumber.js";
import { ApexAnnotations, ApexAxisChartSeries, YAxisAnnotations } from "ng-apexcharts";
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
    IPredictionCandlestick,
    IPredictionStateIntesity,
    IPositionSideHealth,
    IStateType
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
import { BalanceDialogComponent } from "./balance-dialog";
import { ActivePositionDialogComponent, IActivePositionDialogData } from "./active-position-dialog";
import { StrategyFormDialogComponent } from "./strategy-form-dialog";
import { TechnicalAnalysisDialogComponent } from "./technical-analysis-dialog";
import { SignalPoliciesDialogComponent } from "./signal-policies-dialog";
import { IPositionHealthDialogData, PositionHealthDialogComponent } from './position-health-dialog';
import { IDashboardComponent, IPositionCloseChunkSize } from "./interfaces";
import { PositionHealthWeightsFormDialogComponent } from "./position-health-weights-form-dialog";
import { PredictionStateIntensityFormDialogComponent } from "./prediction-state-intensity-form-dialog";
import { MatBottomSheetRef } from "@angular/material/bottom-sheet";

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

    // PNL Readable States
    public longPNLState: string = "+0$ | +0%";
    public shortPNLState: string = "+0$ | +0%";

    // HP Readable States
    public longHPState: string = "0 HP 0% | 0%";
    public shortHPState: string = "0 HP 0% | 0%";

    // Prediction Lists
    public epoch?: IEpochRecord;
    public activePrediction?: IPrediction;
    public activeSum?: number;
    public activePredictionState: IPredictionState = 0;
    public activePredictionStateIntensity: IPredictionStateIntesity = 0;
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
    public predLastUpdate: string = "none";

    // State
    public state!: IMarketState;
    public readonly taIntervals: ITAIntervalID[] = ["15m", "30m", "1h", "2h", "4h", "1d"];
    private stateSub!: Subscription;
    private stateLoaded: boolean = false;
    public taLastUpdate: string = "none";

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
    public readonly predictionChartDesktopHeight: number = 270;
    private readonly marketStateChartDesktopHeight: number = 136;

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

                        // If it is an actual new prediction, add it to the list
                        if (
                            !this.activePrediction || 
                            (this.activePrediction && pred.t != this.activePrediction.t)
                        ) {
                            this.onNewPrediction(pred);
                        }
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
            //this.position.balance.available >= this.position.strategy.position_size && 
            this.position.strategy.long_status;
            //this._app.serverTime.value! >= this.position.strategy.long_idle_until;

        // Check if a short position can be opened
        this.canOpenShort = 
            !this.position.short && 
            //this.position.balance.available >= this.position.strategy.position_size && 
            this.position.strategy.short_status;
            //this._app.serverTime.value! >= this.position.strategy.short_idle_until;

        // Reset the close chunk sizes
        this.longChunkSize = undefined;
        this.shortChunkSize = undefined;
        
        // Build additional meta data for a long position (if any)
        if (this.position.long) {
            // Populate the PNL State
            this.longPNLState = this.buildPNLState(this.position.long);

            // Calculate the Long Close Chunk Sizes
            this.longChunkSize = this.calculateChunkSizes(this.position.long.isolated_margin);
        }

        // Build additional meta data for a long position (if any)
        if (this.position.short) {
            // Populate the PNL State
            this.shortPNLState = this.buildPNLState(this.position.short);

            // Calculate the Short Close Chunk Sizes
            this.shortChunkSize = this.calculateChunkSizes(this.position.short.isolated_margin);
        }

        // Populate the HP States
        if (this.position.health && this.position.health.long) {
            this.longHPState = this.buildHPState(this.position.health.long);
        } else { this.longHPState = "0 HP 0% | 0%" }
        if (this.position.health && this.position.health.short) {
            this.shortHPState = this.buildHPState(this.position.health.short);
        } else { this.shortHPState = "0 HP 0% | 0%" }
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




    /**
     * Builds the PNL State String for an active position
     * @param pos 
     * @returns string
     */
    private buildPNLState(pos: IActivePosition): string {
        const pnl: number = <number>this._utils.outputNumber(pos.unrealized_pnl, {dp: 1});
        const roe: number = <number>this._utils.outputNumber(pos.roe, {dp: 1});
        return `${pnl > 0 ? '+': ''}${pnl}$ | ${roe > 0 ? '+': ''}${roe}%`;
    }



    /**
     * Builds the Health State String for an active position
     * @param pos 
     * @returns string
     */
    private buildHPState(h: IPositionSideHealth): string {
        const hp: number = <number>this._utils.outputNumber(h.chp, {dp: 0});
        const hpdd: number = <number>this._utils.outputNumber(h.dd, {dp: 1});
        const gdd: number = <number>this._utils.outputNumber(h.mgdd, {dp: 1});
        return `${this.layout == 'mobile' ? '': hp + ' '}HP ${hpdd}% | ${gdd}%`;
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
        if (!this.predictions.length) { this.predictions = [ {...pred, t: pred.t - 100} ] }
        this.predictions.push(pred);
        if (this.predictions.length > 500) this.predictions = this.predictions.slice(-500);
        this.activePrediction = pred;
        this.activePredictionState = this._app.predictionState.value!;
        this.activePredictionStateIntensity = this._app.predictionStateIntensity.value!;

        // Set the last update date
        this.predLastUpdate = moment(pred.t).format("h:mm:ss a");

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
        if (this.activePredictionStateIntensity > 0) {
            predLineColor = this._chart.upwardColor;
        } else if (this.activePredictionStateIntensity < 0) {
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
                    stroke: {curve: "straight", width:4},
                    annotations: annotations,
                    xaxis: {
                        type: "datetime",
                        tooltip: {enabled: false, }, 
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
            // Init the marker color
            if (this.activePredictionState > 0) { markerColor = this._chart.upwardColor }
            else if (this.activePredictionState < 0) { markerColor = this._chart.downwardColor }

            // Init the marker size
            markerSize = this.getMarkerSize();
        }

        // Finally, return the data
        return { markerSize: markerSize, markerColor: markerColor }
    }




    /**
     * Calculates the suggested marker size based on the absolute state 
     * value.
     * @returns number
     */
    private getMarkerSize(): number {
        // Init the state and the intensity
        const state: IPredictionState = this.activePredictionState;
        const intensity: IPredictionStateIntesity = this.activePredictionStateIntensity;

        // Handle an increasing state
        if (state > 0 && intensity > 0) {
            if      (state >= 9)    { return intensity == 1 ? 6.0: 9.0 }
            else if (state == 8)    { return intensity == 1 ? 5.7: 8.5 }
            else if (state == 7)    { return intensity == 1 ? 5.4: 8.0 }
            else if (state == 6)    { return intensity == 1 ? 5.1: 7.5 }
            else if (state == 5)    { return intensity == 1 ? 4.8: 7.0 }
            else if (state == 4)    { return intensity == 1 ? 4.5: 6.5 }
            else if (state == 3)    { return intensity == 1 ? 4.2: 6.0 }
            else if (state == 2)    { return intensity == 1 ? 3.9: 5.5 }
            else if (state == 1)    { return intensity == 1 ? 3.7: 5.0 }
            else                    { return 3.5 }
        }

        // Handle a decreasing state
        else if (state < 0 && intensity < 0) {
            if      (state <= -9)    { return intensity == -1 ? 6.0: 9.0 }
            else if (state == -8)    { return intensity == -1 ? 5.7: 8.5 }
            else if (state == -7)    { return intensity == -1 ? 5.4: 8.0 }
            else if (state == -6)    { return intensity == -1 ? 5.1: 7.5 }
            else if (state == -5)    { return intensity == -1 ? 4.8: 7.0 }
            else if (state == -4)    { return intensity == -1 ? 4.5: 6.5 }
            else if (state == -3)    { return intensity == -1 ? 4.2: 6.0 }
            else if (state == -2)    { return intensity == -1 ? 3.9: 5.5 }
            else if (state == -1)    { return intensity == -1 ? 3.7: 5.0 }
            else                     { return 3.5 }
        }

        // Handle a neutral state
        else { return 3.5 }
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
                        tooltip: {enabled: false, }, 
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
                moment(this._app.serverTime.value!).subtract(32, "hours").valueOf(),
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
                //{min: minValue, max: maxValue}
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

        // Update the last technicals update
        this.taLastUpdate = moment(this.state.technical_analysis.ts).format("h:mm:ss a");
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

        // Determine the color of the candlesticks based on the volume direction
        let bullColor: string = "#80CBC4";
        let bearColor: string = "#EF9A9A";
        if (this.state.volume.direction > 0) {
            bearColor = this.state.volume.direction == 1 ? "#EF9A9A": "#80CBC4";
            bullColor = "#004D40";
        } else if (this.state.volume.direction < 0) {
            bullColor = this.state.volume.direction == -1 ? "#80CBC4": "#EF9A9A";
            bearColor = "#B71C1C";
        }
        this.windowChart.plotOptions = {candlestick: {colors: {upward: bullColor, downward: bearColor}}};
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
            const tpLevel: 0|1|2|3|4|5 = this.getActiveTakeProfitLevel(this.position.health.long ? this.position.health.long.dd: 0);
            annotations.yaxis!.push(this.buildPositionAnnotation(
                this.position.long.entry_price,
                this._chart.upwardColor,
                "LONG",
                38
            ));
            annotations.yaxis!.push(this.buildPositionAnnotation(
                this.position.long.take_profit_price_1,
                tpLevel == 1 ? this._chart.upwardColor: "#26A69A",
                "TAKE_PROFIT_1",
                92
            ));
            annotations.yaxis!.push(this.buildPositionAnnotation(
                this.position.long.take_profit_price_2,
                tpLevel == 2 ? this._chart.upwardColor: "#26A69A",
                "TAKE_PROFIT_2",
                92
            ));
            annotations.yaxis!.push(this.buildPositionAnnotation(
                this.position.long.take_profit_price_3,
                tpLevel == 3 ? this._chart.upwardColor: "#26A69A",
                "TAKE_PROFIT_3",
                92
            ));
            annotations.yaxis!.push(this.buildPositionAnnotation(
                this.position.long.take_profit_price_4,
                tpLevel == 4 ? this._chart.upwardColor: "#26A69A",
                "TAKE_PROFIT_4",
                92
            ));
            annotations.yaxis!.push(this.buildPositionAnnotation(
                this.position.long.take_profit_price_5,
                tpLevel == 5 ? this._chart.upwardColor: "#26A69A",
                "TAKE_PROFIT_5",
                92
            ));
            annotations.yaxis!.push(this.buildPositionAnnotation(
                this.position.long.stop_loss_price,
                this._chart.upwardColor,
                "STOP_LOSS",
                71
            ));
        }

        // Short Position
        if (this.position.short) {
            const tpLevel: 0|1|2|3|4|5 = this.getActiveTakeProfitLevel(this.position.health.short ? this.position.health.short.dd: 0);
            annotations.yaxis!.push(this.buildPositionAnnotation(
                this.position.short.entry_price,
                this._chart.downwardColor,
                "SHORT",
                44
            ));
            annotations.yaxis!.push(this.buildPositionAnnotation(
                this.position.short.take_profit_price_1,
                tpLevel == 1 ? this._chart.downwardColor: "#EF5350",
                "TAKE_PROFIT_1",
                92
            ));
            annotations.yaxis!.push(this.buildPositionAnnotation(
                this.position.short.take_profit_price_2,
                tpLevel == 2 ? this._chart.downwardColor: "#EF5350",
                "TAKE_PROFIT_2",
                92
            ));
            annotations.yaxis!.push(this.buildPositionAnnotation(
                this.position.short.take_profit_price_3,
                tpLevel == 3 ? this._chart.downwardColor: "#EF5350",
                "TAKE_PROFIT_3",
                92
            ));
            annotations.yaxis!.push(this.buildPositionAnnotation(
                this.position.short.take_profit_price_4,
                tpLevel == 4 ? this._chart.downwardColor: "#EF5350",
                "TAKE_PROFIT_4",
                92
            ));
            annotations.yaxis!.push(this.buildPositionAnnotation(
                this.position.short.take_profit_price_5,
                tpLevel == 5 ? this._chart.downwardColor: "#EF5350",
                "TAKE_PROFIT_5",
                92
            ));
            annotations.yaxis!.push(this.buildPositionAnnotation(
                this.position.short.stop_loss_price,
                this._chart.downwardColor,
                "STOP_LOSS",
                71
            ));
        }



        /* Window State Annotations */
        const currentPrice: number = this.state.window.window[this.state.window.window.length - 1].c
        let windowStateColor: string = this._chart.neutralColor;
        let annOffset: {x: number, y: number} = {x: -15, y: -30};
        if (this.state.window.state > 0) { 
            windowStateColor = this.state.window.state == 1 ? "#00796B": "#004D40";
            annOffset.y = 30;
        }
        else if (this.state.window.state < 0) { 
            windowStateColor = this.state.window.state == -1 ? "#D32F2F": "#B71C1C";
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
     * Calculates the take profit that will be triggered with current HP conditions.
     * @param hp_drawdown 
     * @returns 0|1|2|3|4|5
     */
    private getActiveTakeProfitLevel(hp_drawdown: number): 0|1|2|3|4|5 {
        if      (hp_drawdown <= this.position.strategy.max_hp_drawdown_in_profit)     { return 0 }
        else if (hp_drawdown <= this.position.strategy.take_profit_1.max_hp_drawdown) { return 1 }
        else if (hp_drawdown <= this.position.strategy.take_profit_2.max_hp_drawdown) { return 2 }
        else if (hp_drawdown <= this.position.strategy.take_profit_3.max_hp_drawdown) { return 3 }
        else if (hp_drawdown <= this.position.strategy.take_profit_4.max_hp_drawdown) { return 4 }
        else if (hp_drawdown <= this.position.strategy.take_profit_5.max_hp_drawdown) { return 5 }
        else                                                                          { return 0 }
    }



    /**
     * Builds a position annotation object.
     * @param y 
     * @param color 
     * @param labelText 
     * @param offsetX 
     * @returns YAxisAnnotations
     */
    private buildPositionAnnotation(y: number, color: string, labelText: string, offsetX: number): YAxisAnnotations {
        return {
            y: y,
            strokeDashArray: 0,
            borderColor: color,
            fillColor: color,
            label: {
                borderColor: color,
                style: { color: "#fff", background: color},
                text: labelText,
                position: "left",
                offsetX: offsetX
            }
        }
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
                    name: "USDT", 
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
                            name: "USDT", 
                            data: this.state.volume.volumes, 
                            color: lineColor
                        }
                    ],
                    stroke: {curve: "smooth", width:4},
                },
                this.layout == "desktop" ? this.marketStateChartDesktopHeight - 40: 250, 
                true,
                { max: maxValue, min: minValue}
            );
            this.volumeChart.yaxis.labels = {show: false}
            this.volumeChart.xaxis.tooltip = {enabled: false}
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
                    stroke: {curve: "smooth", width:4},
                },
                this.layout == "desktop" ? this.marketStateChartDesktopHeight - 40: 250, 
                true,
                { max: maxValue, min: minValue}
            );
            this.networkFeeChart.yaxis.labels = {show: false}
            this.networkFeeChart.xaxis.tooltip = {enabled: false}
            this.networkFeeChart.xaxis.axisTicks = {show: false}
            this.networkFeeChart.xaxis.axisBorder = {show: false}
        }
    }





    /**
     * Triggers whenever a new state is downloaded and builds the open interest chart.
     */
     private updateOpenInterestState(): void {
        // Build/Update the chart
        if (this.openInterestChart) {
            // Update the series
            this.openInterestChart.series = [
                {
                    name: "BIN", 
                    data: this.normalizeSeries(
                        this.state.open_interest.interest, 
                        this.state.open_interest.upper_band.end,
                        this.state.open_interest.lower_band.end
                    ), 
                    color: this.getStateLineColor(this.state.open_interest.state)
                },
                {
                    name: "BYB", 
                    data: this.normalizeSeries(
                        this.state.open_interest_bybit.interest, 
                        this.state.open_interest_bybit.upper_band.end,
                        this.state.open_interest_bybit.lower_band.end
                    ), 
                    color: this.getStateLineColor(this.state.open_interest_bybit.state)
                },
                {
                    name: "OKX", 
                    data: this.normalizeSeries(
                        this.state.open_interest_okx.interest, 
                        this.state.open_interest_okx.upper_band.end,
                        this.state.open_interest_okx.lower_band.end
                    ), 
                    color: this.getStateLineColor(this.state.open_interest_okx.state)
                },
                {
                    name: "HUO", 
                    data: this.normalizeSeries(
                        this.state.open_interest_huobi.interest, 
                        this.state.open_interest_huobi.upper_band.end,
                        this.state.open_interest_huobi.lower_band.end
                    ), 
                    color: this.getStateLineColor(this.state.open_interest_huobi.state)
                },
            ]
        } else {
            // Create the chart from scratch
            this.openInterestChart = this._chart.getLineChartOptions(
                { 
                    series: [
                        {
                            name: "BIN", 
                            data: this.normalizeSeries(
                                this.state.open_interest.interest, 
                                this.state.open_interest.upper_band.end,
                                this.state.open_interest.lower_band.end
                            ), 
                            color: this.getStateLineColor(this.state.open_interest.state)
                        },
                        {
                            name: "BYB", 
                            data: this.normalizeSeries(
                                this.state.open_interest_bybit.interest, 
                                this.state.open_interest_bybit.upper_band.end,
                                this.state.open_interest_bybit.lower_band.end
                            ), 
                            color: this.getStateLineColor(this.state.open_interest_bybit.state)
                        },
                        {
                            name: "OKX", 
                            data: this.normalizeSeries(
                                this.state.open_interest_okx.interest, 
                                this.state.open_interest_okx.upper_band.end,
                                this.state.open_interest_okx.lower_band.end
                            ), 
                            color: this.getStateLineColor(this.state.open_interest_okx.state)
                        },
                        {
                            name: "HUO", 
                            data: this.normalizeSeries(
                                this.state.open_interest_huobi.interest, 
                                this.state.open_interest_huobi.upper_band.end,
                                this.state.open_interest_huobi.lower_band.end
                            ), 
                            color: this.getStateLineColor(this.state.open_interest_huobi.state)
                        },
                    ],
                    stroke: {curve: "smooth", width: 3},
                },
                this.layout == "desktop" ? this.marketStateChartDesktopHeight + 15: 250, 
                true,
                { max: 1, min: 0}
            );
            this.openInterestChart.yaxis.labels = {show: false}
            this.openInterestChart.xaxis.tooltip = {enabled: false}
            this.openInterestChart.xaxis.axisTicks = {show: false}
            this.openInterestChart.xaxis.axisBorder = {show: false}
            this.openInterestChart.dataLabels = {enabled: false}
        }
    }






    /**
     * Triggers whenever a new state is downloaded and builds the long/short ratio chart.
     */
     private updateLongShortRatioState(): void {
        // Build/Update the chart
        if (this.longShortRatioChart) {
            // Update the series
            this.longShortRatioChart.series = [
                {
                    name: "Global Ratio",  
                    data: this.normalizeSeries(
                        this.state.long_short_ratio.ratio, 
                        this.state.long_short_ratio.upper_band.end,
                        this.state.long_short_ratio.lower_band.end
                    ),
                    color: this.getStateLineColor(this.state.long_short_ratio.state)
                },
                {
                    name: "TTA Ratio", 
                    data: this.normalizeSeries(
                        this.state.long_short_ratio_tta.ratio, 
                        this.state.long_short_ratio_tta.upper_band.end,
                        this.state.long_short_ratio_tta.lower_band.end
                    ),
                    color: this.getStateLineColor(this.state.long_short_ratio_tta.state)
                },
                {
                    name: "TTP Ratio", 
                    data: this.normalizeSeries(
                        this.state.long_short_ratio_ttp.ratio, 
                        this.state.long_short_ratio_ttp.upper_band.end,
                        this.state.long_short_ratio_ttp.lower_band.end
                    ),
                    color: this.getStateLineColor(this.state.long_short_ratio_ttp.state)
                },
            ]
        } else {
            // Create the chart from scratch
            this.longShortRatioChart = this._chart.getLineChartOptions(
                { 
                    series: [
                        {
                            name: "Global Ratio",  
                            data: this.normalizeSeries(
                                this.state.long_short_ratio.ratio, 
                                this.state.long_short_ratio.upper_band.end,
                                this.state.long_short_ratio.lower_band.end
                            ),
                            color: this.getStateLineColor(this.state.long_short_ratio.state)
                        },
                        {
                            name: "TTA Ratio", 
                            data: this.normalizeSeries(
                                this.state.long_short_ratio_tta.ratio, 
                                this.state.long_short_ratio_tta.upper_band.end,
                                this.state.long_short_ratio_tta.lower_band.end
                            ),
                            color: this.getStateLineColor(this.state.long_short_ratio_tta.state)
                        },
                        {
                            name: "TTP Ratio", 
                            data: this.normalizeSeries(
                                this.state.long_short_ratio_ttp.ratio, 
                                this.state.long_short_ratio_ttp.upper_band.end,
                                this.state.long_short_ratio_ttp.lower_band.end
                            ),
                            color: this.getStateLineColor(this.state.long_short_ratio_ttp.state)
                        },
                    ],
                    stroke: {curve: "smooth", width:3},
                },
                this.layout == "desktop" ? this.marketStateChartDesktopHeight + 15: 250, 
                true,
                { max: 1, min: 0}
            );
            this.longShortRatioChart.yaxis.labels = {show: false}
            this.longShortRatioChart.xaxis.tooltip = {enabled: false}
            this.longShortRatioChart.xaxis.axisTicks = {show: false}
            this.longShortRatioChart.xaxis.axisBorder = {show: false}
        }
    }




    /* Chart Misc Helpers */



    /**
     * Normalizes a given series so multiple exchanges can be displayed simultaneously.
     * @param series 
     * @param max 
     * @param min 
     * @returns number[] 
     */
    private normalizeSeries(series: number[], max: number, min: number): number[] {
        return series.map((v) => <number>this._utils.outputNumber((v - min) / (max - min), {dp: 6}))
    }




    /**
     * Retrieves the line's color based on the state.
     * @param state 
     * @returns string
     */
    private getStateLineColor(state: IStateType): string {
        if      (state == 1) { return "#26A69A" }
        else if (state == 2) { return "#004D40" }
        else if (state == -1) { return "#EF5350" }
        else if (state == -2) { return "#B71C1C" }
        else { return this._chart.neutralColor }
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
     * Toggles the kind of info to display in the position button.
     * @returns Promise<void>
     */
    public async togglePositionButtonContent(): Promise<void> {
        this.userPreferences.positionButtonPNL = !this.userPreferences.positionButtonPNL;
        await this._localDB.saveUserPreferences(this.userPreferences);
    }





    /**
     * Displays the prediction state intensity dialog.
     */
    public displayPredictionStateIntensityFormDialog(): void {
		this.dialog.open(PredictionStateIntensityFormDialogComponent, {
			hasBackdrop: this._app.layout.value != "mobile",
            disableClose: true,
			panelClass: "small-dialog",
            data: {}
		})
	}





    /**
     * Displays the signal policies dialog.
     */
    public displaySignalPoliciesDialog(): void {
		const bs: MatBottomSheetRef = this._nav.displayBottomSheetMenu([
            {icon: 'trending_up', title: 'Long', description: 'Manage issuance & cancellation policies.', response: "LONG"},
            {icon: 'trending_down', title: 'Short', description: 'Manage issuance & cancellation policies.', response: "SHORT"},
        ]);
		bs.afterDismissed().subscribe((response: IBinancePositionSide|undefined) => {
            if (response) {
                this.dialog.open(SignalPoliciesDialogComponent, {
                    hasBackdrop: this._app.layout.value != "mobile",
                    disableClose: true,
                    panelClass: "large-dialog",
                    data: response
                })
            }
		});
	}



    /**
     * Displays the strategy form dialog.
     */
    public displayStrategyFormDialog(): void {
		this.dialog.open(StrategyFormDialogComponent, {
			hasBackdrop: this._app.layout.value != "mobile",
            disableClose: true,
			panelClass: "small-dialog",
            data: this.position.strategy
		})
	}




    /**
     * Displays the position hp weights form dialog.
     */
    public displayPositionHealthWeightsFormDialog(): void {
		this.dialog.open(PositionHealthWeightsFormDialogComponent, {
			hasBackdrop: this._app.layout.value != "mobile",
            disableClose: true,
			panelClass: "small-dialog",
            data: {}
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
			hasBackdrop: this._app.layout.value != "mobile",
            disableClose: false,
			panelClass: "small-dialog",
            data: <IActivePositionDialogData> {
                strategy: this.position.strategy,
                position: position,
                health: position.side == "LONG" ? this.position.health.long: this.position.health.short,
                spotPrice: this.state.window.window[this.state.window.window.length - 1].c
            }
		})
	}






	/**
	 * Displays the position health dialog.
	 */
    public displayHealthDialog(side: IBinancePositionSide): void {
		this.dialog.open(PositionHealthDialogComponent, {
			hasBackdrop: this._app.layout.value != "mobile",
			panelClass: "large-dialog",
			data: <IPositionHealthDialogData>{
				side: side,
				health: side == "LONG" ? this.position.health.long: this.position.health.short
			}
		})
	}


    


    
	/**
	 * Displays the features dedicated dialog to gather more information
	 * about the prediction.
	 */
     public displayActivePredictionDialog(): void {
        this._nav.displayPredictionDialog(this.epoch!.model, this.activePrediction!);
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
			data: taInterval
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






    /* Tooltips */


    // Window
    public windowTooltip(): void {
        this._nav.displayTooltip("Market State Window", [
            `The market state operates in a moving window of 128 15-minute-interval candlesticks (~32 hours) that is synced 
            every ~4 seconds through Binance Spot's API.`,
            `Additionally, the following market state submodules also make use of this exact window of time:`,
            `1) Volume`,
            `2) Open Interest`,
            `3) Long/Short Ratio`,
            `4) Network Fee`,
        ]);
    }



    // Prediction Model
    public predictionModelTooltip(): void {
        this._nav.displayTooltip("Prediction Model", [
            `The prediction model is an ensemble of regressions trained to predict the near-future trend. It is used by 
            the Signal Policies Module to generate non-neutral signals, and is also used by the Position Health Points 
            Module for the management of active positions. Since the Bitcoin Market is always changing, a complete 
            recalibration is performed every few months.`,
            `The model predicts every ~10 seconds. Each prediction is broadcast, stored and used to create the 
            15-minute-interval candlesticks that are then used to calculate the trend state and intensity. The key pieces of 
            information derived from the model are:`,
            `1) Trend Sum: the sum of all the predictions generated by the regressions. This value can range from -8 to 8.`,
            `2) Min Increase Sum: the trend sum at which the up-trend is considered to be very strong.`,
            `3) Min Decrease Sum: the trend sum at which the down-trend is considered to be very strong.`,
            `4) Prediction State: the number of 15-minute-intervals the trend sum has been increasing or decreasing consistently. 
            This value can range from -12 to 12.`,
            `5) Prediction State Intensity: the intensity of the prediction state. This value can range from -2 to 2, if it is 0,
            the trend sum is going sideways.`,
        ]);
    }


    // Volume
    public volumeTooltip(): void {
        this._nav.displayTooltip("Volume", [
            `Volume, or trading volume, is the number of units traded in a market during a given time. It is a 
            measurement of the number of individual units of an asset that changed hands during that period.`,
            `Each transaction involves a buyer and a seller. When they reach an agreement at a specific price, 
            the transaction is recorded by the facilitating exchange. This data is then used to calculate the trading volume.`,
            `The volume and the volume direction indicator are synced every ~4 seconds through Binance Spot's API.`
        ]);
    }


    // Open Interest
    public openInterestTooltip(): void {
        this._nav.displayTooltip("Open Interest", [
            `Volume and open interest are related concepts. Volume accounts for all contracts that have been traded in a given period, 
            while open interest considers the total number of open positions held by market participants at any given time. Regardless 
            of long or short positions, open interest adds up all opened trades and subtracts the trades that have been closed on Binance Futures. `,
            `Why Open Interest Matters`,
            `In traditional futures markets, traders closely monitor changes in open interest as an indicator to determine market sentiment and the 
            strength behind price trends. `,
            `Open interest indicates capital flowing in and out of the market. As capital flows into a futures contract, open interest increases. 
            Conversely,  as capital flows out of the derivatives markets, open interest declines. For this reason, increasing open interest is often 
            considered as one of the many factors that can serve as confirmation of a bull market, whereas decreasing open interest signals a bear market.`,
            `The open interest is synced every ~10 seconds through Binance Futures' API.`
        ]);
    }


    // Long Short Ratio
    public longShortRatioTooltip(): void {
        this._nav.displayTooltip("Long Short Ratio", [
            `The long/short ratio indicates the number of long positions relative to short positions for a particular instrument. The long/short ratio is 
            considered a barometer of investor expectations, with a high long/short ratio indicating positive investor expectations. For example, a 
            long/short ratio that has increased in recent months indicates that more long positions are being held relative to short positions. 
            This could be because of various factors ranging from market conditions to geo-political events. The long/short ratio is used by many as 
            a leading indicator of market health and direction including as a precursor to what the spot markets will soon be experiencing.`,
            `The long/short ratio is calculated by dividing the long positions by the short positions. This gives a ratio representing the number of 
            long positions to short positions. For example, the BTCUSDT instrument on Binance on August 29 2022 shows a ratio of 1.8145, a long position 
            of 0.6447 and a short position of 0.3553. Simply put, the long/short ratio of 1.8145 means that there are 1.8145 as many long positions as 
            short positions. This would be considered a bullish signal.`,
            `The long/short ratio is synced every ~10 seconds through Binance Futures' API.`
        ]);
    }


    // Network Fee
    public networkFeeTooltip(): void {
        this._nav.displayTooltip(`Fee at #${this.state.network_fee.height}`, [
            `Mathematically, transaction fees are the difference between the amount of bitcoin sent and the amount received. Conceptually, transaction 
            fees are a reflection of the speed with which a user wants their transaction validated on the blockchain. When a miner validates a new block 
            in the blockchain, they also validate all of the transactions within the block.`,
            `The transaction fee tends to increase when the price experiences a significant movement and declines once the price has "stabilized".`,
        ]);
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

