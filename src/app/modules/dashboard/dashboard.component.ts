import {Component, OnInit, OnDestroy, ViewChild} from "@angular/core";
import {MatSidenav} from "@angular/material/sidenav";
import { MatDialog } from "@angular/material/dialog";
import { MatBottomSheetRef } from "@angular/material/bottom-sheet";
import {Title} from "@angular/platform-browser";
import { Subscription } from "rxjs";
import * as moment from "moment";
import { BigNumber } from "bignumber.js";
import { ApexAnnotations, PointAnnotations, YAxisAnnotations } from "ng-apexcharts";
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
    PositionService,
    ITAIntervalID,
    MarketStateService,
    IPredictionCandlestick,
    IPredictionStateIntesity,
    IActivePosition,
    ISplitStateID,
    IExchangeOpenInterestID,
    IExchangeLongShortRatioID,
    ILiquiditySide,
    ILiquidityIntensity,
    ILiquidityPriceLevel,
    IMinifiedLiquidityPriceLevel
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
import { PredictionStateIntensityFormDialogComponent } from "./prediction-state-intensity-form-dialog";
import { KeyzonesDialogComponent } from "./keyzones-dialog";
import { IMarketStateDialogConfig, MarketStateDialogComponent } from "./market-state-dialog";
import { LiquidityDialogComponent } from "./liquidity-dialog";
import { IDashboardComponent, IWindowZoom, IWindowZoomID, IWindowZoomPrices } from "./interfaces";
import { IBottomSheetMenuItem } from "src/app/shared/components/bottom-sheet-menu";

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
    public position!: IActivePosition|undefined;
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
    public activeZoom: IWindowZoom|undefined = undefined;
    private readonly zooms: IWindowZoom[] = [
        { id: "xs", size: 0.75, highest: 0, lowest: 0, highLimit: 0, lowLimit: 0},
        { id: "s", size: 1.25, highest: 0, lowest: 0, highLimit: 0, lowLimit: 0},
        { id: "m", size: 2, highest: 0, lowest: 0, highLimit: 0, lowLimit: 0},
        { id: "l", size: 3.5, highest: 0, lowest: 0, highLimit: 0, lowLimit: 0},
        { id: "xl", size: 5, highest: 0, lowest: 0, highLimit: 0, lowLimit: 0},
    ];

    // Desktop Chart height helpers
    public readonly predictionChartDesktopHeight: number = 315;

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
                        prevState.window.w.length && 
                        prevState.window.w[prevState.window.w.length - 1].c != this.state.window.w[this.state.window.w.length - 1].c
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
            if (pos !== null) {
                this.onActivePositionUpdate(pos);
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
    private onActivePositionUpdate(summary: IActivePosition|undefined): void {
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
            moment(this.state.window.w[this.state.window.w.length - 1].ct).subtract(10, "minutes").valueOf()
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
                false
            );
            this.predictionCandlesticksChart.chart!.height = this.layout == "desktop" ? this.predictionChartDesktopHeight: 330;
            this.predictionCandlesticksChart.chart!.zoom = {enabled: false};
            this.predictionCandlesticksChart.title = {text: ""};
            this.predictionCandlesticksChart.yaxis.opposite = true;
            this.predictionCandlesticksChart.yaxis.labels = {show: true, align: "right"};
            this.predictionCandlesticksChart.xaxis.tooltip = {enabled: false}
        }
    }




    /**
     * Builds the annotations to be used on the predictio ncandlestick's chart.
     * @returns ApexAnnotations
     */
    private getPredictionCandlestickAnnotations(): ApexAnnotations {
        // Calculate min & max values
        const minValue: number = -this.epoch!.model.regressions.length;
        const maxValue: number = this.epoch!.model.regressions.length;

        // Set the color of the annotation
        const open: number = this.predictionCandlesticks[this.predictionCandlesticks.length - 1].o;
        const close: number = this.predictionCandlesticks[this.predictionCandlesticks.length - 1].c;
        let stateColor: string = this._chart.neutralColor;
        if (close > open) { stateColor = this._chart.upwardColor } 
        else if (open > close) { stateColor = this._chart.downwardColor }

        // Set the position
        let sumStr: string = typeof this.activeSum == "number" ? <string>this._utils.outputNumber(this.activeSum, {dp: 3, of: "s"}): "0";
        let annOffset: {x: number, y: number} = {x: 0, y: 0};
        if (sumStr.length == 1 ) { annOffset.x = 20 }
        else if (sumStr.length == 3 ) { annOffset.x = 24 }
        else if (sumStr.length == 4 ) { annOffset.x = 29 }
        else if (sumStr.length == 5 ) { annOffset.x = 36 }
        return {
            yaxis: [
                this.buildTrendSumAnnotation(this.epoch!.model.min_increase_sum, maxValue, this._chart.upwardColor),
                this.buildTrendSumAnnotation(0.000001, this.epoch!.model.min_increase_sum, "#B2DFDB"),
                this.buildTrendSumAnnotation(this.epoch!.model.min_decrease_sum, minValue, this._chart.downwardColor),
                this.buildTrendSumAnnotation(-0.000001, this.epoch!.model.min_decrease_sum, "#FFCDD2"),
                {
                    y: this.activePrediction ? this.activePrediction.s: 0,
                    strokeDashArray: 0,
                    borderColor: stateColor,
                    fillColor: stateColor,
                    label: {
                        borderColor: stateColor,
                        style: { color: "#fff", background: stateColor, fontSize: "11px", padding: {top: 4, right: 4, left: 4, bottom: 4}},
                        text: sumStr,
                        position: "right",
                        offsetY: annOffset.y,
                        offsetX: annOffset.x
                    }
                }
            ]
        }
    }




    /**
     * Builds a yaxis annotation for the trend sum chart signaling the 
     * predicted trend.
     * @param y 
     * @param y2 
     * @param color 
     * @param strokeDashArray 
     * @returns YAxisAnnotations
     */
    private buildTrendSumAnnotation(y: number, y2: number, color: string): YAxisAnnotations {
        return {
            y: y,
            y2: y2,
            borderColor: color,
            fillColor: color,
            strokeDashArray: 0
        };
    }




    /**
     * Retrieves the Prediction Candlesticks based on the current
     * window.
     * @returns Promise<IPredictionCandlestick[]>
     */
    private getWindowPredictionCandlesticks(): Promise<IPredictionCandlestick[]> {
        return this._localDB.listPredictionCandlesticks(
            this.epoch!.id, 
            this.state.window.w[0].ot,
            this.state.window.w[this.state.window.w.length - 1].ct,
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
        for (let wCandlestick of this.state.window.w) {
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

        // Update the title
        const price: string = <string>this._utils.outputNumber(
            this.state.window.w[this.state.window.w.length - 1].c, 
            {dp: 0, of: "s"}
        );
        let newTitle: string = `$${price}`;
        if (this.activeSum) {
            newTitle += `: ${this._utils.outputNumber(this.activeSum, {dp: 2})}`;
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
        // Build/update the chart
        if (this.windowChart) {
            // Handle the Zoom
            if (this.activeZoom) {
                const price: number = this.state.window.w[this.state.window.w.length - 1].c;
                if (price >= this.activeZoom.highLimit || price <= this.activeZoom.lowLimit) {
                    this.activeZoom = { ...this.activeZoom, ...this.calculateZoomPrices(this.activeZoom.size)}
                }
                this.windowChart.yaxis = { tooltip: { enabled: true }, forceNiceScale: false, min: this.activeZoom.lowest, max: this.activeZoom.highest, opposite: true, labels: {show: true, align: "right"}};
            } else {
                this.windowChart.yaxis = { tooltip: { enabled: true }, forceNiceScale: true, opposite: true, labels: {show: true, align: "right"}};
            }

            // Update the series
            this.windowChart.series = [
                {
                    name: "candle",
                    data: this._chart.getApexCandlesticks(this.state.window.w)
                }
            ];

            // Update the annotations
            this.windowChart.annotations = this.buildWindowAnnotations();
        } else {
            this.windowChart = this._chart.getCandlestickChartOptions(
                this.state.window.w, 
                this.buildWindowAnnotations(), 
                false
            );
            this.windowChart.chart!.height = this.layout == "desktop" ? 615: 400;
            this.windowChart.chart!.zoom = {enabled: false};
            this.windowChart.chart!.toolbar!.show = false;
            this.windowChart.yaxis.opposite = true;
            this.windowChart.yaxis.labels = {show: true, align: "right"};
        }

        // Determine the color of the candlesticks based on the volume direction
        let bullColor: string = "#80CBC4";
        let bearColor: string = "#EF9A9A";
        if (this.state.volume.d > 0) {
            bearColor = this.state.volume.d == 1 ? "#EF9A9A": "#80CBC4";
            bullColor = "#004D40";
        } else if (this.state.volume.d < 0) {
            bullColor = this.state.volume.d == -1 ? "#80CBC4": "#EF9A9A";
            bearColor = "#B71C1C";
        }
        this.windowChart.plotOptions = {candlestick: {colors: {upward: bullColor, downward: bearColor}}};
    }



    /**
     * Builds the annotations for the keyzones and any other element
     * that may require it.
     * @returns ApexAnnotations
     */
    private buildWindowAnnotations(): ApexAnnotations {
        // Init the annotations
        let annotations: ApexAnnotations = { yaxis: [], points: [] };


        /* KeyZone Annotations */

        // Add the keyzones above (if any)
        if (this.state.keyzones.above) {
            for (let resistance of this.state.keyzones.above) {
                annotations.yaxis!.push({
                    y: resistance.s,
                    y2: resistance.e,
                    strokeDashArray: 0,
                    borderColor: this._ms.kzAbove[resistance.vi],
                    fillColor: this._ms.kzAbove[resistance.vi]
                })
            }
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
        if (this.state.keyzones.below) {
            for (let support of this.state.keyzones.below) {
                annotations.yaxis!.push({
                    y: support.s,
                    y2: support.e,
                    strokeDashArray: 0,
                    borderColor: this._ms.kzBelow[support.vi],
                    fillColor: this._ms.kzBelow[support.vi]
                })
            }
        }



        /* Window State Annotations */

        // Prices
        const openPrice: number = this.state.window.w[this.state.window.w.length - 1].o;
        const currentPrice: number = this.state.window.w[this.state.window.w.length - 1].c;

        // Window State Color
        let windowStateColor: string = this._chart.neutralColor;
        if (currentPrice > openPrice) { windowStateColor = this._chart.upwardColor }
        else if (openPrice > currentPrice) { windowStateColor = this._chart.downwardColor }

        // Annotation Offset
        let annOffset: {x: number, y: number} = {x: 55, y: 0};
        if (currentPrice < 9999) { annOffset.x = 43 }
        else if (currentPrice < 99999) { annOffset.x = 49 }
        annotations.yaxis!.push({
            y: currentPrice,
            strokeDashArray: 0,
            borderColor: windowStateColor,
            fillColor: windowStateColor,
            label: {
                borderColor: windowStateColor,
                style: { color: "#fff", background: windowStateColor, fontSize: "11px", padding: {top: 4, right: 4, left: 4, bottom: 4}},
                text: `$${this._utils.formatNumber(currentPrice, 0)}`,
                position: "right",
                offsetY: annOffset.y,
                offsetX: annOffset.x
            }
        });

        
        /* Liquidity Annotations */
        const x: number = this.state.window.w[0].ot;

        // Build the Asks (If any)
        if (this.state.liquidity.a) {
            for (let ask of this.state.liquidity.a) {
                annotations.points!.push(this.buildLiquidityAnnotation("asks", x, ask));
            }
        }

        // Build the Bids (If any)
        if (this.state.liquidity.b) {
            for (let bid of this.state.liquidity.b) {
                annotations.points!.push(this.buildLiquidityAnnotation("bids", x, bid));
            }
        }

        // Finally, return the annotations
        return annotations;
    }




    /**
     * Builds a liquidity level annotation for a given side.
     * @param side 
     * @param x 
     * @param level 
     * @returns PointAnnotations
     */
    private buildLiquidityAnnotation(
        side: ILiquiditySide,
        x: number,
        level: IMinifiedLiquidityPriceLevel
    ): PointAnnotations {
        // Calculate the metadata
        const { color, width } = this.getLiquidityLevelMetadata(side, level.li);

        // Finally, return the annotation
        return {
            x: x,
            y: level.p,
            marker: {size: 0},
            label: {
                text: ".",
                borderWidth: 0,
                borderRadius: 0,
                offsetY: 1,
                style: {
                    background: color,
                    color: '#FFFFFF',
                    fontSize: "1px",
                    padding: {
                        left: 0,
                        right: width,
                        top: 1,
                        bottom: 1,
                      }
                }
            }
        }
    }



    /**
     * Retrieves the color and the width of a liquidity bar based on the side and
     * the intensity.
     * @param side 
     * @param intensity 
     * @returns {color: string, width: number}
     */
    private getLiquidityLevelMetadata(side: ILiquiditySide, intensity: ILiquidityIntensity): {color: string, width: number} {
        // Init values
        let color: string;
        let width: number;

        // Set the values based on the intensity
        if (intensity == 3) {
            color = side == "asks" ? "#B71C1C": "#004D40";
            width = this.layout == "desktop" ? 250: 100;
        } else if (intensity == 2) {
            color = side == "asks" ? "#F44336": "#009688";
            width = this.layout == "desktop" ? 150: 60;
        } else {
            color = side == "asks" ? "#EF9A9A": "#80CBC4";
            width = this.layout == "desktop" ? 75: 30;
        }
        
        // Finally, pack and return the values
        return { color: color, width: width };
    }










    /* Window Zoom */



    /**
     * Displays the zoom menu and handles the action (if any).
     */
    public displayZoomMenu(): void {
        const activeID: IWindowZoomID|undefined = this.activeZoom ? this.activeZoom.id: undefined;
        let menu: IBottomSheetMenuItem[] = this.zooms.filter((z) => !activeID || z.id != activeID).map((z) => { 
            return {
                icon: 'zoom_in_map',  
                title: `Zoom ${z.id.toUpperCase()}`, 
                description: `Limit the view to a distance of +- ${z.size}%`, 
                response: z.id
            }
        });
        if (activeID) {
            menu.push({
                icon: 'zoom_out_map',  
                title: 'Disable Zoom', 
                description: 'Disable the zoom and view original window.', 
                response: "DISABLE_ZOOM"
            });
        }
        menu.push({
            icon: 'question_mark',  
            title: 'Information', 
            description: 'Understand how the window module works.', 
            response: "INFORMATION"
        });
        const bs: MatBottomSheetRef = this._nav.displayBottomSheetMenu(menu);
		bs.afterDismissed().subscribe((response: string|undefined) => {
            if (typeof response == "string") {
                if (response == "DISABLE_ZOOM") { this.activeZoom = undefined }
                else if (response == "INFORMATION") { this.windowTooltip() }
                else { 
                    const activeZoom: IWindowZoom = this.zooms.filter((z) => z.id == response)[0];
                    const zoomPrices: IWindowZoomPrices = this.calculateZoomPrices(activeZoom.size);
                    this.activeZoom = {...activeZoom, ...zoomPrices};
                }
            }
		});
    }






    /**
     * Calculates the zoom prices for activation.
     * @returns IWindowZoomPrices
     */
    private calculateZoomPrices(zoomSize: number): IWindowZoomPrices {
        const price: number = this.state.window.w[this.state.window.w.length - 1].c;
        return {
            highest: <number>this._utils.alterNumberByPercentage(price, zoomSize),
            lowest: <number>this._utils.alterNumberByPercentage(price, -(zoomSize)),
            highLimit: <number>this._utils.alterNumberByPercentage(price, (zoomSize / 2)),
            lowLimit: <number>this._utils.alterNumberByPercentage(price, -((zoomSize / 2))),
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










    /************************
     * Market State Dialogs *
     ************************/



	/**
	 * Displays the window dialog.
     * @param taInterval
	 */
    public displayWindowDialog(id: ISplitStateID): void {
		this.dialog.open(MarketStateDialogComponent, {
			hasBackdrop: this._app.layout.value != "mobile",
			panelClass: "medium-dialog",
			data: <IMarketStateDialogConfig>{
                module: "window",
                split: id,
                windowState: this.state.window
            }
		})
	}



	/**
	 * Displays the Volume Dialog.
	 */
    public displayVolumeDialog(): void {
		this.dialog.open(MarketStateDialogComponent, {
			hasBackdrop: this._app.layout.value != "mobile",
			panelClass: "medium-dialog",
			data: <IMarketStateDialogConfig>{
                module: "volume"
            }
		})
	}





	/**
	 * Displays the Open Interest Dialog.
	 */
    public displayOpenInterestDialog(id: IExchangeOpenInterestID): void {
		this.dialog.open(MarketStateDialogComponent, {
			hasBackdrop: this._app.layout.value != "mobile",
			panelClass: "medium-dialog",
			data: <IMarketStateDialogConfig>{
                module: "open_interest",
                exchangeID: id
            }
		})
	}





	/**
	 * Displays the Long/Short Ratio Dialog.
	 */
    public displayLongShortRatioDialog(id: IExchangeLongShortRatioID): void {
		this.dialog.open(MarketStateDialogComponent, {
			hasBackdrop: this._app.layout.value != "mobile",
			panelClass: "medium-dialog",
			data: <IMarketStateDialogConfig>{
                module: "long_short_ratio",
                exchangeID: id
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
			data: taInterval
		})
	}




	/**
	 * Displays the Liquidity dialog.
	 */
    public displayLiquidityDialog(): void {
		this.dialog.open(LiquidityDialogComponent, {
			hasBackdrop: this._app.layout.value != "mobile",
			panelClass: "medium-dialog"
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

