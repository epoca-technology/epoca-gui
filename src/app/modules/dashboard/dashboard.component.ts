import {Component, OnInit, OnDestroy, ViewChild} from "@angular/core";
import {MatSidenav} from "@angular/material/sidenav";
import { MatDialog } from "@angular/material/dialog";
import { MatBottomSheetRef } from "@angular/material/bottom-sheet";
import {Title} from "@angular/platform-browser";
import { Subscription } from "rxjs";
import * as moment from "moment";
import { ApexAnnotations, PointAnnotations, YAxisAnnotations } from "ng-apexcharts";
import { 
    IEpochRecord, 
    IMarketState, 
    IPrediction, 
    LocalDatabaseService, 
    PredictionService, 
    UtilsService,
    AuthService,
    IUserPreferences,
    MarketStateService,
    IPredictionCandlestick,
    ISplitStateID,
    IMinifiedKeyZone,
    ILiquidityPeaks,
    ILiquiditySide,
    ILiquidityIntensity,
    IActivePositionHeadlines,
    IStateType,
} from "../../core";
import { 
    AppService, 
    ChartService, 
    ICandlestickChartOptions, 
    ILayout, 
    NavService,
} from "../../services";
import { BalanceDialogComponent } from "./balance-dialog";
import { StrategyFormDialogComponent } from "./strategy-form-dialog";
import { WindowConfigurationDialogComponent } from "./window-configuration-dialog";
import { KeyzonesConfigFormDialogComponent, KeyzonesDialogComponent, KeyzonesEventsDialogComponent } from "./keyzones";
import { IMarketStateDialogConfig, MarketStateDialogComponent } from "./market-state-dialog";
import { IBottomSheetMenuItem } from "../../shared/components/bottom-sheet-menu";
import { CoinsDialogComponent, CoinsStateSummaryDialogComponent, ICoinsStateSummaryConfig } from "./coins";
import { SignalPoliciesDialogComponent } from "./signal-policies-dialog";
import { PositionHeadlinesDialogComponent } from "./positions";
import { TrendConfigurationDialogComponent } from "./trend-configuration-dialog";
import { LiquidityConfigurationDialogComponent, LiquidityDialogComponent } from "./liquidity";
import { ReversalConfigDialogComponent, ReversalStateDialogComponent } from "./reversal";
import { IDashboardComponent, IWindowZoom, IWindowZoomID, IWindowZoomPrices } from "./interfaces";

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
    public activePositions: IActivePositionHeadlines = { LONG: null, SHORT: null };
    private positionsSub?: Subscription;
    private positionsLoaded: boolean = false;

    // Prediction Lists
    public epoch?: IEpochRecord;
    public activePrediction?: IPrediction;
    private predictionSub!: Subscription;
    private predictionsLoaded: boolean = false;

    // Prediction Charts
    public predictionCandlesticksChart?: ICandlestickChartOptions;

    // State
    public state!: IMarketState;
    private stateSub!: Subscription;
    private stateLoaded: boolean = false;

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

    // Coins Grid
    public symbols: string[] = [];
    public activeCoinPage: number = 1;
    public visibleSymbols: string[] = [];
    public coinsPerPage: number = 24;
    public totalCoinPages: number = 1;
    public coinPlaceholders: number[] = [];
    public activeSliceStart: number = 0;
    public activeSliceEnd: number = 0;
    public generalCoinClass: string = "neutral-neutral";
    public coinsTileClasses: {[symbol: string]: string} = {};

    // Reversal
    public reversalScore: number = 0;

    // Desktop Chart height helpers
    public readonly predictionChartDesktopHeight: number = 330;

    // Loading State
    public loaded: boolean = false;

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
                this.state = state;

                // Update charts
                this.onStateUpdate();

                // If there is a reversal, store a rounded version of the score
                if (this.state.reversal.k != 0) this.reversalScore = Math.floor(this.state.reversal.s);

                // Set loading state
                if (!this.stateLoaded) {
                    this.stateLoaded = true;
                    this.checkLoadState();
                }
            }
        });

        // Subscribe to be position summary
        this.positionsSub = this._app.positions.subscribe((pos) => {
            if (pos != null) {
                this.activePositions = pos || { LONG: null, SHORT: null };
                if (!this.positionsLoaded) {
                    this.positionsLoaded = true;
                    this.checkLoadState();
                }
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
        if (this.positionsSub) this.positionsSub.unsubscribe();
        if (this.predictionSub) this.predictionSub.unsubscribe();
        if (this.stateSub) this.stateSub.unsubscribe();
        if (this.guiVersionSub) this.guiVersionSub.unsubscribe();
        this.titleService.setTitle("Epoca");
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

            // Add the new prediction
            this.activePrediction = pred;
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
        // Init the candlesticks
        const candlesticks: IPredictionCandlestick[] = this.state.trend.w.length ? this.state.trend.w: this.getDefaultWindowPredictionCandlesticks();

        // Finally, update the chart
        if (this.predictionCandlesticksChart) {
            this.predictionCandlesticksChart.series = [{data: this._chart.getApexCandlesticks(candlesticks)}]
            this.predictionCandlesticksChart.annotations = this.getPredictionCandlestickAnnotations();
        } else {
            this.predictionCandlesticksChart = this._chart.getCandlestickChartOptions(
                candlesticks, 
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

        return {
            yaxis: [
                // Current sum annotation
                this.buildCurrentTrendSumAnnotation(),

                // Uptrend backgrounds
                this.buildTrendSumAnnotation(0, 1, "#E0F2F1"),
                this.buildTrendSumAnnotation(1, 2, "#80CBC4"),
                this.buildTrendSumAnnotation(2, 3, "#4DB6AC"),
                this.buildTrendSumAnnotation(3, 4, "#26A69A"),
                this.buildTrendSumAnnotation(4, 5, "#009688"),
                this.buildTrendSumAnnotation(5, 6, "#00897B"),
                this.buildTrendSumAnnotation(6, 7, "#00796B"),
                this.buildTrendSumAnnotation(7, 20, "#004D40"),

                // Downtrend Backgrounds
                this.buildTrendSumAnnotation(0, -1, "#FFEBEE"),
                this.buildTrendSumAnnotation(-1, -2, "#EF9A9A"),
                this.buildTrendSumAnnotation(-2, -3, "#E57373"),
                this.buildTrendSumAnnotation(-3, -4, "#EF5350"),
                this.buildTrendSumAnnotation(-4, -5, "#F44336"),
                this.buildTrendSumAnnotation(-5, -6, "#E53935"),
                this.buildTrendSumAnnotation(-6, -7, "#D32F2F"),
                this.buildTrendSumAnnotation(-7, -20, "#B71C1C")
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
     * Builds the current trend sum annotation.
     * @returns YAxisAnnotations
     */
    private buildCurrentTrendSumAnnotation(): YAxisAnnotations {
        // Set the color of the annotation
        let open: number = 0;
        let close: number = 0;
        if (this.state.trend.w.length) {
            open = this.state.trend.w[this.state.trend.w.length - 1].o;
            close = this.state.trend.w[this.state.trend.w.length - 1].c;
        }
        let stateColor: string = this._chart.neutralColor;
        if (close > open) { stateColor = this._chart.upwardColor } 
        else if (open > close) { stateColor = this._chart.downwardColor }

        // Build the annotations
        let sumStr: string = <string>this._utils.outputNumber(close, {dp: 3, of: "s"});
        let annOffset: {x: number, y: number} = {x: 0, y: 0};
        if (sumStr.length == 1 ) { annOffset.x = 20 }
        else if (sumStr.length == 2 ) { annOffset.x = 22 }
        else if (sumStr.length == 3 ) { annOffset.x = 24 }
        else if (sumStr.length == 4 ) { annOffset.x = 29 }
        else if (sumStr.length == 5 ) { annOffset.x = 36 }
        else if (sumStr.length == 6 ) { annOffset.x = 41 }
        else if (sumStr.length == 7 ) { annOffset.x = 46 }
        return {
            y: close,
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
                c: 0
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

        // Update the coins state
        this.updateCoinsState();

        // Update the title
        const price: string = <string>this._utils.outputNumber(
            this.state.window.w[this.state.window.w.length - 1].c, 
            {dp: 0, of: "s"}
        );
        let newTitle: string = `$${price}`;
        if (this.activePrediction) {
            newTitle += `: ${this._utils.outputNumber(this.activePrediction.s, {dp: 2})}`;
            this.titleService.setTitle(newTitle);
        } else {
            this.titleService.setTitle(newTitle);
        }
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
            this.windowChart.series = [{data: this._chart.getApexCandlesticks(this.state.window.w)}]

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
    }



    /**
     * Builds the annotations for the keyzones and any other element
     * that may require it.
     * @returns ApexAnnotations
     */
    private buildWindowAnnotations(): ApexAnnotations {
        // Init the annotations
        let annotations: ApexAnnotations = { yaxis: [], points: [] };

        /* Liquidity Annotations */
        
		// Init the annotations
        const x: number = this.state.window.w[0].ot;

        // Build the Asks (If any)
		const askPeaks: ILiquidityPeaks = this.state.liquidity.ap || {};
		for (let askPrice in askPeaks) {
			if (askPeaks[askPrice] > 0) {
				annotations.points!.push(this.buildLiquidityAnnotation("asks", x, Number(askPrice), askPeaks[askPrice]));
			}
		}

        // Build the Bids (If any)
		const bidPeaks: ILiquidityPeaks = this.state.liquidity.bp || {};
		for (let bidPrice in bidPeaks) {
			if (bidPeaks[bidPrice] > 0) {
				annotations.points!.push(this.buildLiquidityAnnotation("bids", x, Number(bidPrice), bidPeaks[bidPrice]));
			}
		}



        /* KeyZone Annotations */

        // Add the keyzones above (if any)
        if (this.state.keyzones.above) {
            for (let resistance of this.state.keyzones.above) {
                annotations.yaxis!.push(this.buildKeyZoneAnnotation(resistance, "above"));
            }
        }

        // Check if there is an active zone
        if (this.state.keyzones.active) {
            annotations.yaxis!.push(this.buildKeyZoneAnnotation(this.state.keyzones.active, "active"));
        }


        // Add the keyzones below (if any)
        if (this.state.keyzones.below) {
            for (let support of this.state.keyzones.below) {
                annotations.yaxis!.push(this.buildKeyZoneAnnotation(support, "below"));
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

        // Finally, return the annotations
        return annotations;
    }







    /* Liquidity Annotations */


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
        price: number,
        intensity: ILiquidityIntensity
    ): PointAnnotations {
        return {
            x: x,
            y: price,
            marker: {size: 0},
            label: {
                text: ".",
                borderWidth: 0,
                borderRadius: 0,
                offsetY: 1,
                style: {
                    background: this._ms.peakColors[side][intensity],
                    color: '#FFFFFF',
                    fontSize: "1px",
                    padding: {
                        left: 0,
                        right: Math.floor(this._ms.peakWidth[this.layout][intensity] / 4),
                        top: 1,
                        bottom: 1,
                        }
                }
            }
        }
    }







    /* KeyZone Annotations */
    


    /**
     * Builds a KeyZone Annotation based on its kind.
     * @param kz 
     * @param kind 
     * @returns YAxisAnnotations
     */
    private buildKeyZoneAnnotation(
        kz: IMinifiedKeyZone, 
        kind: "active"|"above"|"below"
    ): YAxisAnnotations {
        // Check if the provided zone has an active event
        if (this.state.keyzones.event && kz.id == this.state.keyzones.event.kz.id) {
            // Initialize the color
            const color: string = this.state.keyzones.event.k == "s" ? "#870505": "#083d34";

            // Finally, return the build
            return {
                y: kz.s,
                y2: kz.e,
                strokeDashArray: 0,
                borderColor: color,
                fillColor: color,
                label: {
                    borderColor: color,
                    style: { color: "#fff", background: color, fontSize: "9px", padding: {top: 1, right: 1, left: 1, bottom: 1}},
                    text: "ACTIVE",
                    position: "left",
                    offsetY: 0,
                    offsetX: 34
                }
            }
        }
        
        // Otherwise, put together the traditional build
        else {
            // Initialize the color
            const color: string = kind == "active" ? "#000000": this.getKeyZoneAnnotationColorFromScore(kz.scr, kind);

            // Finally, return the build
            return {
                y: kz.s,
                y2: kz.e,
                strokeDashArray: 0,
                borderColor: color,
                fillColor: color
            }
        }
    }




    /**
     * Retrieves the annotation's color based on the score and the kind.
     * @param score 
     * @param kind 
     * @returns string
     */
    private getKeyZoneAnnotationColorFromScore(score: number, kind: "above"|"below"): string {
        // Make sure the keyzone score is higher than the requirement
        if (score >= this._app.keyzoneEventScoreRequirement) {
            if      (score >= 9)    { return kind == "above" ? "#004D40": "#B71C1C" } 
            else if (score >= 8)    { return kind == "above" ? "#00796B": "#D32F2F" }
            else if (score >= 7)    { return kind == "above" ? "#009688": "#F44336" }
            else if (score >= 6)    { return kind == "above" ? "#4DB6AC": "#E57373" }
            else                    { return kind == "above" ? "#80CBC4": "#EF9A9A" }
        }

        // Otherwise, return the inactive color
        else { return kind == "above" ? "#E0F2F1": "#FFEBEE" }

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










    /***************
     * Coins State *
     ***************/




    /**
     * Handles the coin state updates. If the items in the list change,
     * the first page will be activated.
     */
    private updateCoinsState(): void {
        // Populate the symbols
        let symbols: string[] = Object.keys(this.state.coins.sbs || {});
        symbols.sort();

        // Calculate the total number of pages
        this.totalCoinPages = Math.ceil(symbols.length / this.coinsPerPage);

        // If the number of symbols is different to the previous one, activate the first page
        if (!this.symbols.length || this.symbols.length != symbols.length) {
            this.activateFirstCoinsPage(symbols);
        }

        // Set the symbols
        this.symbols = symbols;

        // Build the tile classes
        this.generalCoinClass = `${this.getCoinTileClassName(this.state.coins.cd)}-${this.getCoinTileClassName(this.state.coinsBTC.cd)}`;
        for (let sym of this.symbols) { this.coinsTileClasses[sym] = this.buildCSSClassForSymbol(sym) }
    }



    /**
     * Builds the css class that will be placed on the coins' tiles.
     * @param symbol 
     * @returns string
     */
    private buildCSSClassForSymbol(symbol: string): string {
        // Init the states
        const usdState: IStateType = this.state.coins.sbs[symbol].s;
        const btcState: IStateType = this.state.coinsBTC.sbs[symbol] ? this.state.coinsBTC.sbs[symbol].s: 0;

        // Return the class build
        return `${this.getCoinTileClassName(usdState)}-${this.getCoinTileClassName(btcState)}`
    }
    private getCoinTileClassName(state: IStateType): string {
        if      (state == -2) { return "strong-sell" }
        else if (state == -1) { return "sell" }
        else if (state == 0)  { return "neutral" }
        else if (state == 1)  { return "buy" }
        else                  { return "strong-buy" }
    }




    /**
     * Activates the first coins page. This is a safe method as it starts
     * from the beginning.
     * @param symbols 
     */
    public activateFirstCoinsPage(symbols?: string[]): void {
        // Populate the symbols
        symbols = Array.isArray(symbols) ? symbols: this.symbols;

        // Init the slice
        let sliceStart: number = 0;
        let sliceEnd: number = this.coinsPerPage;

        // If there are more items than coinsPerPage, leave room for the paginator
        if (symbols.length > this.coinsPerPage) sliceEnd -= 1;

        // If there are less items than coinsPerPage, fill the blanks with placeholders
        if (symbols.length < this.coinsPerPage) {
            this.coinPlaceholders = Array(this.coinsPerPage - symbols.length).fill(0);
        } else {
            this.coinPlaceholders = [];
        }

        // Apply the slice to the symbols
        this.visibleSymbols = symbols.slice(sliceStart, sliceEnd);

        // Set the active page and slice
        this.activeCoinPage = 1;
        this.activeSliceStart = sliceStart;
        this.activeSliceEnd = sliceEnd;
    }





    /**
     * Activates the next coins page based on the active slice range.
     */
    public activateNextCoinsPage(): void {
        // Init the slice
        let sliceStart: number = this.activeSliceEnd;
        let sliceEnd: number = sliceStart + this.coinsPerPage;

        // Deduct the previous pagination button
        sliceEnd -= 1;

        // If there are more symbols than the end of the slice, leave room for the paginator
        if (this.symbols.length > sliceEnd) sliceEnd -= 1;

        // If there are less symbols than sliceEnd, fill the blanks with placeholders
        if (this.symbols.length < sliceEnd) {
            this.coinPlaceholders = Array(sliceEnd - this.symbols.length).fill(0);
        } else {
            this.coinPlaceholders = [];
        }

        // Apply the slice to the symbols
        this.visibleSymbols = this.symbols.slice(sliceStart, sliceEnd);

        // Set the active page and slice
        this.activeCoinPage += 1;
        this.activeSliceStart = sliceStart;
        this.activeSliceEnd = sliceEnd;
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
                icon: 'waterfall_chart',  
                title: 'Window', 
                description: 'Configure the requirements for the window splits to be stateful.', 
                response: "WINDOW_CONFIG"
            },
            {
                icon: 'wand_magic_sparkles',  
                svg: true,
                title: 'Trend', 
                description: 'Configure the requirements for the trend splits to be stateful.', 
                response: "TREND_CONFIG"
            },
            {
                icon: 'vertical_distribute',  
                title: 'KeyZones', 
                description: 'Configure how the zones are built and events are issued.', 
                response: "KEYZONES_CONFIG"
            },
            {
                icon: 'water_drop',  
                title: 'Liquidity', 
                description: 'Configure how the liquidity is built and the state is calculated.', 
                response: "LIQUIDITY_CONFIG"
            },
            {
                icon: 'currency_bitcoin',  
                title: 'Coins', 
                description: 'Configure, install & uninstall coin based futures contracts.', 
                response: "COINS"
            },
            {
                icon: 'rotate_left',  
                svg: true,
                title: 'Reversal', 
                description: 'Configure the requirements for reversal events to be issued.', 
                response: "REVERSAL"
            },
            {
                icon: 'podcasts',  
                title: 'Signal Policies', 
                description: 'Manage issuance and cancellation policies for both sides.', 
                response: "SIGNAL_POLICIES"
            },
            {
                icon: 'money_bill_transfer',  
                svg: true,
                title: 'Trading Strategy', 
                description: 'Configure the way positions are managed.', 
                response: "TRADING_STRATEGY"
            },
        ]);
		bs.afterDismissed().subscribe((response: string|undefined) => {
            if      (response === "WINDOW_CONFIG") { this.displayWindowConfigFormDialog() }
            else if (response === "TREND_CONFIG") { this.displayTrendConfigFormDialog() }
            else if (response === "LIQUIDITY_CONFIG") { this.displayLiquidityConfigFormDialog() }
            else if (response === "KEYZONES_CONFIG") { this.displayKeyZonesConfigFormDialog() }
            else if (response === "COINS") { this.displayCoinsDialog() }
            else if (response === "REVERSAL") { this.displayReversalConfigDialog() }
            else if (response === "SIGNAL_POLICIES") { this.displaySignalPoliciesDialog() }
            else if (response === "TRADING_STRATEGY") { this.displayStrategyFormDialog() }
		});
	}




    /**
     * Displays the window config form dialog.
     */
    private displayWindowConfigFormDialog(): void {
		this.dialog.open(WindowConfigurationDialogComponent, {
			hasBackdrop: this._app.layout.value != "mobile",
            disableClose: true,
			panelClass: "small-dialog",
            data: {}
		})
	}



    /**
     * Displays the trend config form dialog.
     */
    private displayTrendConfigFormDialog(): void {
		this.dialog.open(TrendConfigurationDialogComponent, {
			hasBackdrop: this._app.layout.value != "mobile",
            disableClose: true,
			panelClass: "small-dialog",
            data: {}
		})
	}




    /**
     * Displays the liquidity config form dialog.
     */
    private displayLiquidityConfigFormDialog(): void {
		this.dialog.open(LiquidityConfigurationDialogComponent, {
			hasBackdrop: this._app.layout.value != "mobile",
            disableClose: true,
			panelClass: "small-dialog",
            data: {}
		})
	}




    /**
     * Displays the keyzones config form dialog.
     */
    private displayKeyZonesConfigFormDialog(): void {
		this.dialog.open(KeyzonesConfigFormDialogComponent, {
			hasBackdrop: this._app.layout.value != "mobile",
            disableClose: true,
			panelClass: "small-dialog",
            data: {}
		})
	}



	/**
	 * Displays the Coins dialog.
	 */
    private displayCoinsDialog(): void {
		this.dialog.open(CoinsDialogComponent, {
			hasBackdrop: this._app.layout.value != "mobile",
            disableClose: true,
			panelClass: "large-dialog"
		})
	}



	/**
	 * Displays the Reversal dialog.
	 */
    private displayReversalConfigDialog(): void {
		this.dialog.open(ReversalConfigDialogComponent, {
			hasBackdrop: this._app.layout.value != "mobile",
            disableClose: true,
			panelClass: "small-dialog",
            data: {}
		})
	}




    /**
     * Displays the signal policies dialog.
     */
    private displaySignalPoliciesDialog(): void {
		this.dialog.open(SignalPoliciesDialogComponent, {
			hasBackdrop: this._app.layout.value != "mobile",
            disableClose: true,
			panelClass: "large-dialog",
            data: {}
		})
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





    




    /*****************
     * Business Menu *
     *****************/



    /**
     * Displays the business menu.
     */
    public displayBusinessMenu(): void {
		const bs: MatBottomSheetRef = this._nav.displayBottomSheetMenu([
            {
                icon: 'money_bill_transfer',  
                svg: true,
                title: 'Position Headlines', 
                description: 'View the list of active and closed positions.', 
                response: "POSITION_HEADLINES"
            },
            {
                icon: 'account_balance_wallet',  
                title: 'Balance', 
                description: 'View the USDT Balance held in the Futures Wallet.', 
                response: "ACCOUNT_BALANCE"
            },
        ]);
		bs.afterDismissed().subscribe((response: string|undefined) => {
            if      (response === "POSITION_HEADLINES") { this.displayPositionHeadlinesDialog() }
            else if (response === "ACCOUNT_BALANCE") { this.displayBalanceDialog() }
		});
	}




	/**
	 * Displays the position headlines dialog.
     * @param taInterval
	 */
    private displayPositionHeadlinesDialog(): void {
		this.dialog.open(PositionHeadlinesDialogComponent, {
			hasBackdrop: this._app.layout.value != "mobile",
			panelClass: "medium-dialog",
			data: {}
		})
	}
    










	/**
	 * Displays the balance dialog.
	 */
    private displayBalanceDialog(): void {
		this.dialog.open(BalanceDialogComponent, {
			hasBackdrop: true,
			panelClass: "light-dialog",
			data: {}
		})
	}







    /****************
     * Misc Dialogs *
     ****************/






    
	/**
	 * Displays the features dedicated dialog to gather more information
	 * about the prediction.
	 */
    public displayActivePredictionDialog(): void {
        if (!this.epoch!.model || !this.activePrediction) return;
        this._nav.displayPredictionDialog(this.epoch!.model, this.activePrediction!);
	}




    

    /**
     * Displays the position record dialog.
     * @param id 
     */
    public displayPositionRecordDialog(id: string): void {
        this._nav.displayPositionRecordDialog(id);
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
	 * Displays the trend dialog.
     * @param taInterval
	 */
    public displayTrendDialog(id: ISplitStateID): void {
		this.dialog.open(MarketStateDialogComponent, {
			hasBackdrop: this._app.layout.value != "mobile",
			panelClass: "medium-dialog",
			data: <IMarketStateDialogConfig>{
                module: "trend",
                split: id,
                trendState: this.state.trend
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
	 * Displays the KeyZones dialog.
	 */
    public displayKeyZonesDialog(): void {
		this.dialog.open(KeyzonesDialogComponent, {
			hasBackdrop: this._app.layout.value != "mobile",
			panelClass: "large-dialog"
		})
	}



    /**
	 * Displays the coin dialog.
     * @param symbol?
	 */
    public displayCoinDialog(symbol?: string): void {
        // Display an individual coin through the market state dialog
        if (typeof symbol == "string") {
            const bs: MatBottomSheetRef = this._nav.displayBottomSheetMenu([
                {
                    icon: 'attach_money', 
                    title: 'USDT Price', 
                    description: `View ${symbol}'s price history in USDT.`, 
                    response: "USDT"
                },
                {
                    icon: 'currency_bitcoin',  
                    title: 'Bitcoin Price', 
                    description: `View ${symbol}'s price history in BTC.`, 
                    response: "BTC"
                },
            ]);
            bs.afterDismissed().subscribe((response: string|undefined) => {
                if (typeof response == "string") {
                    if (symbol == "BTCUSDT" && response == "BTC") {
                        this._app.error("Bitcoin can only be displayed based on the USDT Price.");
                        return;
                    }
                    this.dialog.open(MarketStateDialogComponent, {
                        hasBackdrop: this._app.layout.value != "mobile",
                        panelClass: "medium-dialog",
                        data: <IMarketStateDialogConfig>{
                            module: response == "USDT" ? "coin": "coinBTC",
                            symbol: symbol
                        }
                    })
                }
            });
        }

        // Display the general dialog
        else {
            const bs: MatBottomSheetRef = this._nav.displayBottomSheetMenu([
                {
                    icon: 'attach_money', 
                    title: 'USDT Price', 
                    description: `View coins' summaries in USDT.`, 
                    response: "USDT"
                },
                {
                    icon: 'currency_bitcoin',  
                    title: 'Bitcoin Price', 
                    description: `View coins' summaries in BTC.`, 
                    response: "BTC"
                },
            ]);
            bs.afterDismissed().subscribe((response: string|undefined) => {
                if (typeof response == "string") {
                    this.dialog.open(CoinsStateSummaryDialogComponent, {
                        hasBackdrop: this._app.layout.value != "mobile",
                        panelClass: "large-dialog",
                        data: <ICoinsStateSummaryConfig>{
                            compressedStates: undefined,
                            btcPrice: response == "BTC"
                        }
                    })
                }
            });
        }
	}







	/**
	 * Displays the liquidity dialog.
	 */
	public displayLiquidityDialog(): void {
		this.dialog.open(LiquidityDialogComponent, {
			hasBackdrop: this._app.layout.value != "mobile", // Mobile optimization
			panelClass: "large-dialog",
			data: {}
		})
	}








	/**
	 * Displays the keyzones events dialog.
	 */
	public displayKeyZoneEventsHistory(): void {
		this.dialog.open(KeyzonesEventsDialogComponent, {
			hasBackdrop: this._app.layout.value != "mobile", // Mobile optimization
			panelClass: "small-dialog",
			data: {}
		})
	}


    



    /**
     * Displays the reversal state dialog.
     */
    public displayReversalState(): void {
        if (this.state.reversal.id == 0) return;
		this.dialog.open(ReversalStateDialogComponent, {
			hasBackdrop: this._app.layout.value != "mobile", // Mobile optimization
			panelClass: "large-dialog",
			data: this.state.reversal.id
		})
    }












    /************
     * Tooltips *
     ************/



    // Window
    public windowTooltip(): void {
        this._nav.displayTooltip("Market State Window", [
            `The market state operates in a moving window of 128 15-minute-interval candlesticks (~32 hours) that is synced 
            every ~3 seconds through Binance Spot's API.`,
            `Additionally, the following market state submodules also make use of this exact window of time:`,
            `1) Volume`,
            `2) Trend`,
        ]);
    }






    // Volume
    public volumeTooltip(): void {
        this._nav.displayTooltip("Volume", [
            `Volume, or trading volume, is the number of units traded in a market during a given time. It is a 
            measurement of the number of individual units of an asset that changed hands during that period.`,
            `Each transaction involves a buyer and a seller. When they reach an agreement at a specific price, 
            the transaction is recorded by the facilitating exchange. This data is then used to calculate the trading volume.`,
            `The volume and the volume direction indicator are synced every ~3 seconds through Binance Spot's API.`
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
        this.loaded = this.positionsLoaded && this.predictionsLoaded && this.stateLoaded;
    }
}

