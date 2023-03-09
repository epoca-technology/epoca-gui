import {Component, OnInit, OnDestroy, ViewChild} from "@angular/core";
import {MatSidenav} from "@angular/material/sidenav";
import { MatDialog } from "@angular/material/dialog";
import {Title} from "@angular/platform-browser";
import { Subscription } from "rxjs";
import * as moment from "moment";
import { BigNumber } from "bignumber.js";
import { ApexAnnotations, YAxisAnnotations } from "ng-apexcharts";
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
    PositionService,
    ITAIntervalID,
    MarketStateService,
    IPredictionCandlestick,
    IPredictionStateIntesity,
} from "../../core";
import { 
    AppService, 
    ChartService, 
    IBarChartOptions, 
    ICandlestickChartOptions, 
    IChartRange, 
    ILayout, 
    ILineChartOptions, 
    NavService 
} from "../../services";
import { BalanceDialogComponent } from "./balance-dialog";
import { StrategyFormDialogComponent } from "./strategy-form-dialog";
import { TechnicalAnalysisDialogComponent } from "./technical-analysis-dialog";
import { IDashboardComponent, IPositionCloseChunkSize } from "./interfaces";
import { PredictionStateIntensityFormDialogComponent } from "./prediction-state-intensity-form-dialog";
import { MatBottomSheetRef } from "@angular/material/bottom-sheet";
import { KeyzonesDialogComponent } from "./keyzones-dialog";

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
    private positionSub?: Subscription;
    private positionLoaded: boolean = false;

    // Prediction Lists
    public epoch?: IEpochRecord;
    public activePrediction?: IPrediction;
    public activeSum?: number;
    public activePredictionState: IPredictionState = 0;
    public activePredictionStateIntensity: IPredictionStateIntesity = 0;
    //public predictions: IPrediction[] = [];
    private predictionSub!: Subscription;
    private predictionsLoaded: boolean = false;

    // Prediction Charts
    private predictionCandlesticks: IPredictionCandlestick[] = [];
    public predictionCandlesticksChart?: ICandlestickChartOptions;

    // State
    public state!: IMarketState;
    public readonly taIntervals: ITAIntervalID[] = ["15m", "30m", "1h", "2h", "4h", "1d"];
    private stateSub!: Subscription;
    private stateLoaded: boolean = false;
    public taLastUpdate: string = "none";

    // Window Chart
    public windowChart?: ICandlestickChartOptions;

    // Volume State Chart
    public volumeChart?: IBarChartOptions;

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
                if (pred !== null) this.onNewPrediction(pred);
            }
        );

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

        // ...
    }



















    /********************************
     * New Prediction Event Handler *
     ********************************/






    /**
     * Triggers whenever there is a change in the data and builds
     * all the required data.
     */
     private async onNewPrediction(pred: IPrediction|null|undefined): Promise<void> {
        // Ensure a valid prediction was provided
        if (pred) {
            // Populate the epoch's record in case it hasn't been
            if (!this.epoch) this.epoch = this._app.epoch.value!;

            // Calculate the active sum
            this.activeSum = <number>this._utils.getSum(pred.f, {dp: 6});

            // Add the new prediction
            this.activePrediction = pred;
            this.activePredictionState = this._app.predictionState.value!;
            this.activePredictionStateIntensity = this._app.predictionStateIntensity.value!;
        }

        // Otherwise, set default values
        else {
            this.predictionCandlesticks = this.getDefaultWindowPredictionCandlesticks();
        }

        // Update the prediction chart
        await this.updatePredictionCandlesticks();

        // Set the component as loaded in case it hasn't been
        if (!this.predictionsLoaded) {
            this.predictionsLoaded = true;
            this.checkLoadState();
        }
    }






    /**
     * Triggers whenever a new prediction is received through the app bulk.
     * If the candlesticks have been initialized, it will build the current
     * candlestick locally. If the current candlestick's close time is 
     * older than 10 minutes or if they haven't been initialized, they will be 
     * built from the API.
     * @returns Promise<void>
     */
    private async updatePredictionCandlesticks(): Promise<void> {
        // Check if the candlesticks need to be built from scratch
        if (
            !this.predictionCandlesticks.length ||
            this.predictionCandlesticks[this.predictionCandlesticks.length - 1].ct < 
            moment(this.state.window.window[this.state.window.window.length - 1].ct).subtract(10, "minutes").valueOf()
        ) {
            try {
                // Retrieve the candlesticks
                this.predictionCandlesticks = await this.getWindowPredictionCandlesticks();
            } catch (e) { 
                this.predictionCandlesticks = this.getDefaultWindowPredictionCandlesticks();
                this._app.error(e);
            }
        }

        // Otherwise, update the local candlesticks
        else if(this.activePrediction) {
            // Check if the latest candlestick's interval ended
            const ct: number = moment(this.predictionCandlesticks[this.predictionCandlesticks.length - 1].ot).add(15, "minutes").valueOf() - 1;
            if (this.activePrediction.t > ct) {
                // Build the new candlestick
                const candlestick: IPredictionCandlestick = {
                    ot: this.predictionCandlesticks[this.predictionCandlesticks.length - 1].ct + 1,
                    ct: this.activePrediction.t,
                    o: this.activePrediction.s,
                    h: this.activePrediction.s,
                    l: this.activePrediction.s,
                    c: this.activePrediction.s,
                    sm: 0
                }

                // Push it to the list and slice it
                this.predictionCandlesticks.push(candlestick);
                this.predictionCandlesticks = this.predictionCandlesticks.slice(-128);
            }

            // Otherwise, update the OHLC of the current item
            else {
                const active: IPredictionCandlestick = this.predictionCandlesticks[this.predictionCandlesticks.length - 1];
                this.predictionCandlesticks[this.predictionCandlesticks.length - 1] = {
                    ot: active.ot,
                    ct: this.activePrediction.t,
                    o: active.o,
                    h: this.activePrediction.s > active.h ? this.activePrediction.s: active.h,
                    l: this.activePrediction.s < active.l ? this.activePrediction.s: active.l,
                    c: this.activePrediction.s,
                    sm: 0
                }
            }
        }

        // Finally, update the chart
        if (this.predictionCandlesticksChart) {
            // Update the series
            this.predictionCandlesticksChart.series = [
                {
                    name: "candle",
                    data: this._chart.getApexCandlesticks(this.predictionCandlesticks)
                }
            ];
            this.predictionCandlesticksChart.annotations = this.getPredictionCandlestickAnnotations();
        } else {
            this.predictionCandlesticksChart = this._chart.getCandlestickChartOptions(
                this.predictionCandlesticks, 
                this.getPredictionCandlestickAnnotations(), 
                false, 
                //true, 
                //{min: minValue, max: maxValue}
            );
            this.predictionCandlesticksChart.chart!.height = this.layout == "desktop" ? this.predictionChartDesktopHeight: 330;
            this.predictionCandlesticksChart.chart!.zoom = {enabled: false};
            this.predictionCandlesticksChart.title = {text: ""};
            this.predictionCandlesticksChart.yaxis.opposite = true;
            this.predictionCandlesticksChart.xaxis.labels = {show: false};
            this.predictionCandlesticksChart.xaxis.axisTicks = {show: false}
            this.predictionCandlesticksChart.xaxis.axisBorder = {show: false}
            this.predictionCandlesticksChart.xaxis.tooltip = {enabled: false}
        }
    }




    /**
     * Builds the annotations to be used on the predictio ncandlestick's chart.
     * @returns ApexAnnotations
     */
    private getPredictionCandlestickAnnotations(): ApexAnnotations {
        const minValue: number = -this.epoch!.model.regressions.length;
        const maxValue: number = this.epoch!.model.regressions.length;
        let stateColor: string = this._chart.neutralColor;
        if (this.activePredictionState > 0) { stateColor = this._chart.upwardColor } 
        else if (this.activePredictionState < 0) { stateColor = this._chart.downwardColor }
        return {
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
                },
                {
                    y: this.activePrediction ? this.activePrediction.s: 0,
                    strokeDashArray: 0,
                    borderColor: stateColor,
                    fillColor: stateColor,
                    label: {
                        borderColor: stateColor,
                        style: { color: "#fff", background: stateColor, fontSize: "12px", padding: {top: 2, right: 2, left: 2, bottom: 2}},
                        text: `${this.activePredictionState > 0 ? '+': ''}${this.activePredictionState}`,
                        position: "right",
                        offsetY: 0,
                        offsetX: 25
                    }
                }
            ]
        }
    }





    /**
     * Retrieves the Prediction Candlesticks based on the current
     * window.
     * @returns Promise<IPredictionCandlestick[]>
     */
    private getWindowPredictionCandlesticks(): Promise<IPredictionCandlestick[]> {
        return this._localDB.listPredictionCandlesticks(
            this.epoch!.id, 
            this.state.window.window[0].ot,
            this.state.window.window[this.state.window.window.length - 1].ct,
            this.epoch!.installed, 
            this._app.serverTime.value!
        );
    }





    /**
     * Builds the default list of prediction candlesticks.
     * @returns IPredictionCandlestick[]
     */
    private getDefaultWindowPredictionCandlesticks(): IPredictionCandlestick[] {
        // Init the list
        let candlesticks: IPredictionCandlestick[] = [];

        // Iterate over each element in the window and build the placeholder
        for (let wCandlestick of this.state.window.window) {
            candlesticks.push({
                ot: wCandlestick.ot,
                ct: wCandlestick.ct,
                o: 0,
                h: 0,
                l: 0,
                c: 0,
                sm: 0
            })
        }

        // Finally, return the list
        return candlesticks;
    }

















    /*************************************
     * Market State Update Event Handler *
     *************************************/



    /**
     * Whenever a new state is retrieved, it builds all the required charts.
     */
    private onStateUpdate(): void {
        // Update the window state chart
        this.updateWindowState();

        // Update the volume state chart
        this.updateVolumeState();

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
            this.windowChart.yaxis = { tooltip: { enabled: true }, forceNiceScale: false, min: min, max: max, opposite: true};

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
            this.windowChart.yaxis.opposite = true;
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
        let min: number = <number>this._utils.alterNumberByPercentage(this.state.window.lower_band.end, -0.3);
        let max: number = <number>this._utils.alterNumberByPercentage(this.state.window.upper_band.end, 0.3);

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


        /* KeyZone Annotations */

        // Add the keyzones above (if any)
        for (let resistance of this.state.keyzones.above) {
            annotations.yaxis!.push({
				y: resistance.s,
				y2: resistance.e,
				strokeDashArray: 0,
				borderColor: "#80CBC4",
				fillColor: "#80CBC4"
			})
        }

        // Check if there is an active zone
        if (this.state.keyzones.active) {
            annotations.yaxis!.push({
				y: this.state.keyzones.active.s,
				y2: this.state.keyzones.active.e,
				strokeDashArray: 0,
				borderColor: "#000000",
				fillColor: "#000000"
			})
        }


        // Add the keyzones below (if any)
        for (let support of this.state.keyzones.below) {
            annotations.yaxis!.push({
				y: support.s,
				y2: support.e,
				strokeDashArray: 0,
				borderColor: "#EF9A9A",
				fillColor: "#EF9A9A"
			})
        }



        /* Window State Annotations */
        const currentPrice: number = this.state.window.window[this.state.window.window.length - 1].c
        let windowStateColor: string = this._chart.neutralColor;
        //let annOffset: {x: number, y: number} = {x: -15, y: -30};
        if (this.state.window.state > 0) { 
            windowStateColor = this.state.window.state == 1 ? "#00796B": "#004D40";
            //annOffset.y = 30;
        }
        else if (this.state.window.state < 0) { 
            windowStateColor = this.state.window.state == -1 ? "#D32F2F": "#B71C1C";
        }
        annotations.yaxis!.push({
            y: currentPrice,
            strokeDashArray: 0,
            borderColor: windowStateColor,
            fillColor: windowStateColor,
            label: {
                borderColor: windowStateColor,
                style: { color: "#fff", background: windowStateColor, fontSize: "10px", padding: {top: 2, right: 2, left: 2, bottom: 2}},
                text: `${this._utils.formatNumber(currentPrice, 0)} ${this.state.window.state_value > 0 ? '+': ''}${this._utils.formatNumber(this.state.window.state_value, 1)}`,
                position: "right",
                offsetY: 0,
                offsetX: 67
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
                    name: "USDT", 
                    data: this.state.volume.volumes, 
                    color: lineColor
                }
            ]
        } else {
            // Create the chart from scratch
            this.volumeChart = this._chart.getBarChartOptions(
                { 
                    series: [
                        {
                            name: "USDT", 
                            data: this.state.volume.volumes, 
                            color: lineColor
                        }
                    ],
                    //stroke: {curve: "straight", width:4},
                },
                undefined,
                this.layout == "desktop" ? this.marketStateChartDesktopHeight: 250, 
                undefined,
                true,
                { max: maxValue, min: minValue}
            );
            this.volumeChart.yaxis.labels = {show: false}
            this.volumeChart.xaxis.tooltip = {enabled: false}
            this.volumeChart.xaxis.labels = {show: false}
            this.volumeChart.xaxis.axisTicks = {show: false}
            this.volumeChart.xaxis.axisBorder = {show: false}
            this.volumeChart.chart.zoom = {enabled: false}
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
                    stroke: {curve: "straight", width:3},
                },
                this.layout == "desktop" ? this.marketStateChartDesktopHeight: 150, 
                true,
                { max: maxValue, min: minValue}
            );
            this.openInterestChart.yaxis.labels = {show: false}
            this.openInterestChart.xaxis.tooltip = {enabled: false}
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
                    name: "Ratio", 
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
                            name: "Ratio", 
                            data: this.state.long_short_ratio.ratio, 
                            color: lineColor
                        }
                    ],
                    stroke: {curve: "straight", width:3},
                },
                this.layout == "desktop" ? this.marketStateChartDesktopHeight: 150, 
                true,
                { max: maxValue, min: minValue}
            );
            this.longShortRatioChart.yaxis.labels = {show: false}
            this.longShortRatioChart.xaxis.tooltip = {enabled: false}
            this.longShortRatioChart.xaxis.axisTicks = {show: false}
            this.longShortRatioChart.xaxis.axisBorder = {show: false}
        }
    }








    





    /**************************
     * Adjustments Management *
     **************************/






    /**
     * Displays the adjustments menu.
     */
    public displayAdjustmentsMenu(): void {
		const bs: MatBottomSheetRef = this._nav.displayBottomSheetMenu([
            {
                icon: 'money_bill_transfer',  
                svg: true,
                title: 'Trading Strategy', 
                description: 'Configure the way active positions are managed.', 
                response: "TRADING_STRATEGY"
            },
            {
                icon: 'swap_vert',  
                title: 'Trend Intensity', 
                description: 'Configure the requirements for the trend to have a state.', 
                response: "TREND_INTESITY_CONFIGURATION"
            },
        ]);
		bs.afterDismissed().subscribe((response: string|undefined) => {
            if (response === "TRADING_STRATEGY") { this.displayStrategyFormDialog() }
            else if (response === "TREND_INTESITY_CONFIGURATION") { this.displayPredictionStateIntensityFormDialog() }
		});
	}




    /**
     * Displays the strategy form dialog.
     */
    private displayStrategyFormDialog(): void {
		this.dialog.open(StrategyFormDialogComponent, {
			hasBackdrop: this._app.layout.value != "mobile",
            disableClose: true,
			panelClass: "small-dialog",
            data: {}
		})
	}





    /**
     * Displays the prediction state intensity dialog.
     */
    private displayPredictionStateIntensityFormDialog(): void {
		this.dialog.open(PredictionStateIntensityFormDialogComponent, {
			hasBackdrop: this._app.layout.value != "mobile",
            disableClose: true,
			panelClass: "small-dialog",
            data: {}
		})
	}












    /****************
     * Misc Dialogs *
     ****************/



	/**
	 * Displays the balance dialog.
	 */
    public displayBalanceDialog(): void {
		this.dialog.open(BalanceDialogComponent, {
			hasBackdrop: true,
			panelClass: "light-dialog",
			data: {}
		})
	}




    
	/**
	 * Displays the features dedicated dialog to gather more information
	 * about the prediction.
	 */
     public displayActivePredictionDialog(): void {
        if (!this.epoch!.model || !this.activePrediction) return;
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
	 * Displays the KeyZones dialog.
	 */
    public displayKeyZonesDialog(): void {
		this.dialog.open(KeyzonesDialogComponent, {
			hasBackdrop: true,
			panelClass: "large-dialog"
		})
	}






















    /************
     * Tooltips *
     ************/



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


    // Technicals
	public technicalsTooltip(): void {
		this._nav.displayTooltip("Technical Analysis", [
            `Epoca calculates a series of oscillators and moving averages for the most popular intervals every 
			~10 seconds. The results of these calculations are put through an interpreter based on TradingView. 
			The possible outputs are:`,
			`-2 = Strong Sell`,
			`-1 = Sell`,
			` 0 = Neutral`,
			` 1 = Buy`,
			` 2 = Strong Buy`,
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








    









    /***************
     * Nav Actions *
     ***************/




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













    /****************
     * Misc Helpers *
     ****************/

    



    /**
     * Checks if all the required data has been loaded.
     */
    private checkLoadState(): void {
        this.loaded = this.positionLoaded && this.predictionsLoaded && this.stateLoaded;
    }
}

