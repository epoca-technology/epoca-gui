import {Component, OnInit, OnDestroy, ViewChild} from "@angular/core";
import {MatSidenav} from "@angular/material/sidenav";
import { MatDialog } from "@angular/material/dialog";
import { MatBottomSheetRef } from "@angular/material/bottom-sheet";
import {Title} from "@angular/platform-browser";
import { Subscription } from "rxjs";
import * as moment from "moment";
import { ApexAnnotations, YAxisAnnotations } from "ng-apexcharts";
import { 
    IEpochRecord, 
    IMarketState, 
    IPrediction, 
    LocalDatabaseService, 
    PredictionService, 
    UtilsService,
    AuthService,
    IUserPreferences,
    PositionService,
    MarketStateService,
    IPredictionCandlestick,
    ISplitStateID,
    IMinifiedKeyZone,
    IPositionHeadline
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
import { KeyzonesConfigFormDialogComponent, KeyzonesDialogComponent } from "./keyzones";
import { IMarketStateDialogConfig, MarketStateDialogComponent } from "./market-state-dialog";
import { IBottomSheetMenuItem } from "../../shared/components/bottom-sheet-menu";
import { CoinsDialogComponent } from "./coins-dialog";
import { SignalPoliciesDialogComponent } from "./signal-policies-dialog";
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
    public positions: IPositionHeadline[] = [];
    private positionsSub?: Subscription;
    private positionsLoaded: boolean = false;

    // Prediction Lists
    public epoch?: IEpochRecord;
    public activePrediction?: IPrediction;
    public activeSum?: number;
    private predictionSub!: Subscription;
    private predictionsLoaded: boolean = false;

    // Prediction Charts
    private predictionCandlesticks: IPredictionCandlestick[] = [];
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

    // Desktop Chart height helpers
    public readonly predictionChartDesktopHeight: number = 330;

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
        this.positionsSub = this._app.positions.subscribe((pos) => {
            if (pos !== null) {
                this.onActivePositionsUpdate(pos || []);
                this.positionsLoaded = true;
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
        if (this.positionsSub) this.positionsSub.unsubscribe();
        if (this.predictionSub) this.predictionSub.unsubscribe();
        if (this.stateSub) this.stateSub.unsubscribe();
        if (this.guiVersionSub) this.guiVersionSub.unsubscribe();
        this.titleService.setTitle("Epoca");
    }






    /* Position Update Event Handler */




    /**
     * Populates all the position values adjusted to the current
     * state.
     * @param headlines 
     */
    private onActivePositionsUpdate(headlines: IPositionHeadline[]): void {
        // Update the local value
        this.positions = headlines;

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
                    c: this.activePrediction.s
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
                    c: this.activePrediction.s
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
        else if (sumStr.length == 6 ) { annOffset.x = 41 }
        else if (sumStr.length == 7 ) { annOffset.x = 46 }
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
        if (this.activeSum) {
            newTitle += `: ${this._utils.outputNumber(this.activeSum, {dp: 2})}`;
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






    /* KeyZone Annotations */
    


    /**
     * Builds a KeyZone Annotation based on its kind.
     * @param kz 
     * @param kind 
     * @returns YAxisAnnotations
     */
    private buildKeyZoneAnnotation(kz: IMinifiedKeyZone, kind: "active"|"above"|"below"): YAxisAnnotations {
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




    /**
     * Retrieves the annotation's color based on the score and the kind.
     * @param score 
     * @param kind 
     * @returns string
     */
    private getKeyZoneAnnotationColorFromScore(score: number, kind: "above"|"below"): string {
        if      (score >= 9)    { return kind == "above" ? "#004D40": "#B71C1C" } 
        else if (score >= 8)    { return kind == "above" ? "#00796B": "#D32F2F" }
        else if (score >= 7)    { return kind == "above" ? "#009688": "#F44336" }
        else if (score >= 6)    { return kind == "above" ? "#4DB6AC": "#E57373" }
        else if (score >= 5)    { return kind == "above" ? "#80CBC4": "#EF9A9A" }
        else                    { return kind == "above" ? "#E0F2F1": "#FFEBEE" }
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









    /* Coins State */




    /**
     * Handles the coin state updates. If the items in the list change,
     * the first page will be activated.
     */
    private updateCoinsState(): void {
        // Populate the symbols
        let symbols: string[] = Object.keys(this.state.coins || {});
        symbols.sort();

        // Calculate the total number of pages
        this.totalCoinPages = Math.ceil(symbols.length / this.coinsPerPage);

        // If the number of symbols is different to the previous one, activate the first page
        if (!this.symbols.length || this.symbols.length != symbols.length) {
            this.activateFirstCoinsPage(symbols);
        }

        // Set the symbols
        this.symbols = symbols;
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
                icon: 'money_bill_transfer',  
                svg: true,
                title: 'Trading Strategy', 
                description: 'Configure the way positions are managed.', 
                response: "TRADING_STRATEGY"
            },
            {
                icon: 'podcasts',  
                title: 'Signal Policies', 
                description: 'Manage issuance and cancellation policies for both sides.', 
                response: "SIGNAL_POLICIES"
            },
            {
                icon: 'vertical_distribute',  
                title: 'KeyZones Configuration', 
                description: 'Manage how the zones are built and issue events.', 
                response: "KEYZONES_CONFIG"
            },
            {
                icon: 'currency_bitcoin',  
                title: 'Coins', 
                description: 'Install & uninstall coin based futures contracts.', 
                response: "COINS"
            },
        ]);
		bs.afterDismissed().subscribe((response: string|undefined) => {
            if      (response === "COINS") { this.displayCoinsDialog() }
            else if (response === "SIGNAL_POLICIES") { this.displaySignalPoliciesDialog() }
            else if (response === "KEYZONES_CONFIG") { this.displayKeyZonesConfigFormDialog() }
            else if (response === "TRADING_STRATEGY") { this.displayStrategyFormDialog() }
		});
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
                title: 'Positions', 
                description: 'View the list of active and closed positions.', 
                response: "POSITIONS"
            },
            {
                icon: 'account_balance_wallet',  
                title: 'Balance', 
                description: 'View the USDT Balance held in the Futures Wallet.', 
                response: "ACCOUNT_BALANCE"
            },
        ]);
		bs.afterDismissed().subscribe((response: string|undefined) => {
            if      (response === "POSITIONS") { this.displayBalanceDialog() }
            else if (response === "ACCOUNT_BALANCE") { this.displayBalanceDialog() }
		});
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
                trendState: this.state.trend,
                trendWindow: this.predictionCandlesticks
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
     * @param symbol
	 */
    public displayCoinDialog(symbol: string): void {
		this.dialog.open(MarketStateDialogComponent, {
			hasBackdrop: this._app.layout.value != "mobile",
			panelClass: "medium-dialog",
			data: <IMarketStateDialogConfig>{
                module: "coin",
                symbol: symbol
            }
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

