import {Component, OnInit, OnDestroy, ViewChild} from "@angular/core";
import {MatSidenav} from "@angular/material/sidenav";
import { MatDialog } from "@angular/material/dialog";
import { MatBottomSheetRef } from "@angular/material/bottom-sheet";
import {Title} from "@angular/platform-browser";
import { Subscription } from "rxjs";
import { ApexAnnotations, PointAnnotations, YAxisAnnotations } from "ng-apexcharts";
import { 
    IMarketState, 
    LocalDatabaseService, 
    UtilsService,
    AuthService,
    IUserPreferences,
    MarketStateService,
    ISplitStateID,
    IMinifiedKeyZone,
    ILiquidityPeaks,
    ILiquiditySide,
    ILiquidityIntensity,
    IActivePositionHeadlines,
    IStateType,
    IBinancePositionSide,
    PositionService,
} from "../../core";
import { 
    AppService, 
    ChartService, 
    ICandlestickChartOptions, 
    ILayout, 
    NavService,
} from "../../services";
import { BalanceDialogComponent } from "./balance-dialog";
import { KeyzonesDialogComponent, KeyzonesEventsDialogComponent } from "./keyzones-dialog";
import { IMarketStateDialogConfig, MarketStateDialogComponent } from "./market-state-dialog";
import { IBottomSheetMenuItem } from "../../shared/components/bottom-sheet-menu";
import { CoinsStateSummaryDialogComponent, ICoinsStateSummaryConfig } from "./coins-state-summary-dialog";
import { LiquidityDialogComponent } from "./liquidity-dialog";
import { ReversalStateDialogComponent } from "./reversal-state-dialog";
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

    // New Version Available
    public newVersionAvailable: string|undefined;
    private guiVersionSub?: Subscription;

    // Position
    public activePositions: IActivePositionHeadlines = { LONG: null, SHORT: null };
    private positionsSub?: Subscription;
    private positionsLoaded: boolean = false;

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

    // Liquidity
    public liquidityIndicatorClass: string = "sideways-action-container";

    // Reversal
    public reversalScore: number = 0;

    // Loading State
    public loaded: boolean = false;

    constructor(
        public _nav: NavService,
        private _localDB: LocalDatabaseService,
        public _app: AppService,
        private dialog: MatDialog,
        private _chart: ChartService,
        private titleService: Title,
        private _utils: UtilsService,
        private _auth: AuthService,
        public _ms: MarketStateService,
        private _position: PositionService
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
        if (this.stateSub) this.stateSub.unsubscribe();
        if (this.guiVersionSub) this.guiVersionSub.unsubscribe();
        this.titleService.setTitle("Epoca");
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

        // Process the liquidity power values
        this.liquidityIndicatorClass = this.getLiquidityIndicatorClass();

        // If there is a reversal, store a rounded version of the score
        if (this.state.reversal.k != 0) this.reversalScore = Math.floor(this.state.reversal.s);

        // Update the title
        const price: string = <string>this._utils.outputNumber(
            this.state.window.w[this.state.window.w.length - 1].c, 
            {dp: 0, of: "s"}
        );
        this.titleService.setTitle(`$${price}`);
    }





    /**
     * Based on the current liquidity power, it calculates the class that should be applied
     * to the liquidity indicator grid cell.
     * @returns string
     */
    private getLiquidityIndicatorClass(): string {
        // Init the BLP values
        const bidLiquidityPower = Math.floor(this.state.liquidity.blp);
        const askLiquidityPower = Math.floor(100 - this.state.liquidity.blp);

        // Return the class accordingly
        if (bidLiquidityPower > askLiquidityPower) {
            return `increase-action-container-${bidLiquidityPower}`;
        } else if (askLiquidityPower > bidLiquidityPower) {
            return `decrease-action-container-${askLiquidityPower}`;
        } else {
            return "sideways-action-container";
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
        let windowStateColor: string = this._ms.colors.sideways;
        if (currentPrice > openPrice) { windowStateColor = this._ms.colors.increase_2 }
        else if (openPrice > currentPrice) { windowStateColor = this._ms.colors.decrease_2 }

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











    /********************
     * Position Actions *
     ********************/


    

    /**
     * Displays the confirmation dialog in order to open
     * a new position.
     * @param side 
     */
    public openPosition(side: IBinancePositionSide): void {
        this._nav.displayConfirmationDialog({
            title: `Open ${side}`,
            content: `
                <p class='align-center'>
                    If you confirm the action, a ${side} Position will be opened based on the Trading Strategy.
                </p>
            `,
            otpConfirmation: true
        }).afterClosed().subscribe(
            async (otp: string|undefined) => {
                if (otp) {
                    try {
                        // Perform Action
                        await this._position.onReversalStateEvent(side, otp);

                        // Notify
                        this._app.success(`The ${side} position was opened successfully.`);
                    } catch(e) { this._app.error(e) }
                }
            }
        );
    }
























    /****************
     * Misc Dialogs *
     ****************/





	/**
	 * Displays the position headlines dialog.
     * @param taInterval
	 */
    public displayPositionHeadlinesDialog(): void {
		this._nav.displayPositionHeadlinesDialog();
	}
    



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
            const baseAssetName: string = this._ms.getBaseAssetName(symbol);
            const bs: MatBottomSheetRef = this._nav.displayBottomSheetMenu([
                {
                    icon: 'attach_money', 
                    title: 'USDT Price', 
                    description: `View ${baseAssetName}'s price history in USDT.`, 
                    response: "USDT"
                },
                {
                    icon: 'currency_bitcoin',  
                    title: 'Bitcoin Price', 
                    description: `View ${baseAssetName}'s price history in BTC.`, 
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
                    description: `View the coins' states summary in USDT.`, 
                    response: "USDT"
                },
                {
                    icon: 'currency_bitcoin',  
                    title: 'Bitcoin Price', 
                    description: `View the coins' states summary in BTC.`, 
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
        this._nav.displayTooltip("Window", [
            `The window module operates in a moving window of 128 15-minute-interval candlesticks (~32 hours) that is synced every ~3 seconds through Binance Spot's API.`,
            `To calculate the state of the window, a total of 8 splits are applied to the sequence of candlesticks and the state for each is derived based on the configuration.`,
            `-----`,
            `The splits applied to the window are:`,
            `* 100%: 128 items (last ~32 hours)`,
            `* 75%: 96 items (last ~24 hours)`,
            `* 50%: 64 items (last ~16 hours)`,
            `* 25%: 32 items (last ~8 hours)`,
            `* 15%: 20 items (last ~5 hours)`,
            `* 10%: 13 items (last ~3.25 hours)`,
            `* 5%: 7 items (last ~1.75 hours)`,
            `* 2%: 3 items (last ~45 minutes)`,
            `-----`,
            `The supported states are:`,
            `* 2: Increasing Strongly`,
            `* 1: Increasing`,
            `* 0: Sideways`,
            `* -1: Decreasing`,
            `* -2: Decreasing Strongly`,
            `-----`,
            `The configuration for this module can be fully tuned in Adjustments/Window.`
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
        this.loaded = this.positionsLoaded && this.stateLoaded;
    }
}

