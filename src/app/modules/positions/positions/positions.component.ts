import { Component, OnInit, OnDestroy, ViewChild } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { MatBottomSheetRef } from "@angular/material/bottom-sheet";
import { MatSidenav } from "@angular/material/sidenav";
import { MatDialog } from "@angular/material/dialog";
import { Subscription } from "rxjs";
import { ApexAnnotations, PointAnnotations, XAxisAnnotations, YAxisAnnotations } from "ng-apexcharts";
import * as moment from "moment";
import { 
    ICandlestick,
    IEpochRecord, 
    IItemElement, 
    IPositionDataItem, 
    IPositionTrade, 
    IPredictionCandlestick, 
    LocalDatabaseService, 
    PositionDataService, 
    PredictionService,
    UtilsService
} from "../../../core";
import { 
    AppService, 
    ChartService, 
    IBarChartOptions, 
    ICandlestickChartOptions, 
    ILayout, 
    ILineChartOptions, 
    NavService, 
    ValidationsService 
} from "../../../services";
import { IBottomSheetMenuItem } from "../../../shared/components/bottom-sheet-menu";
import { PositionTradeDialogComponent } from "./position-trade-dialog";
import { 
    IPositionsComponent, 
    IViewSize, 
    ISection, 
    ISectionID,
    IDateRange
} from './interfaces';
import { PositionDataItemDialogComponent } from "./position-data-item-dialog";



@Component({
  selector: 'app-positions',
  templateUrl: './positions.component.html',
  styleUrls: ['./positions.component.scss']
})
export class PositionsComponent implements OnInit, OnDestroy, IPositionsComponent {
    // Position Sidenav Element
	@ViewChild("positionSidenav") positionSidenav: MatSidenav|undefined;
	public positionSidenavOpened: boolean = false;

    // Layout
	public layout: ILayout = this._app.layout.value;
	private layoutSub?: Subscription;

    // Active Epoch
    public epoch: IEpochRecord|null = null;
    private epochSub?: Subscription;

    // Initialization & Loading State
    public initializing: boolean = false;
    public initialized: boolean = false;
    public loaded: boolean = false;

    // View Size
    public viewSize: IViewSize = "all";

    // Navigation
    public readonly sections: ISection[] = [
        { id: "summary", name: "Summary", icon: "dashboard"},
        { id: "pnl", name: "PNL", icon: "download"},
        { id: "fees", name: "Fees", icon: "upload"},
        { id: "amounts", name: "Amounts", icon: "aspect_ratio"},
        { id: "prices", name: "Prices", icon: "price_check"},
        { id: "trades", name: "Trades", icon: "format_list_numbered"},
        { id: "history", name: "History", icon: "candlestick_chart"},
    ];
    public activeSection = this.sections[0];
    public sectionLoaded: boolean = false;

    // Summary Section
    public summary: {
        pnlHist: ILineChartOptions,
        trades: IBarChartOptions,
        pnl: IBarChartOptions,
        bottomLine: IBarChartOptions,
        fees: IBarChartOptions,
        amounts: IBarChartOptions,
        prices: IBarChartOptions,
    }|undefined;

    // PNLs Section
    public pnl: {
        long: ILineChartOptions,
        longAccum: ILineChartOptions,
        short: ILineChartOptions,
        shortAccum: ILineChartOptions,
    }|undefined;

    // Fees Section
    public fees: {
        long: ILineChartOptions,
        longAccum: ILineChartOptions,
        short: ILineChartOptions,
        shortAccum: ILineChartOptions,
    }|undefined;

    // Amounts Section
    public amounts: {
        long: ILineChartOptions,
        longIncrease: ILineChartOptions,
        longClose: ILineChartOptions,
        short: ILineChartOptions,
        shortIncrease: ILineChartOptions,
        shortClose: ILineChartOptions,
    }|undefined;

    // Prices Section
    public prices: {
        long: ILineChartOptions,
        longIncrease: ILineChartOptions,
        longClose: ILineChartOptions,
        short: ILineChartOptions,
        shortIncrease: ILineChartOptions,
        shortClose: ILineChartOptions,
    }|undefined;

    // Trades list section
    public visibleTrades: number = 15;

    // History
    public histChart?: ICandlestickChartOptions;
    public histBarChart?: IBarChartOptions;
	public histPages: Array<IDateRange> = [];
	public activePage: number = 0;
	public loadingPage: boolean = false;
    
    constructor(
        public _nav: NavService,
        public _app: AppService,
        private _validations: ValidationsService,
        private route: ActivatedRoute,
        private _localDB: LocalDatabaseService,
        private _chart: ChartService,
        public _prediction: PredictionService,
        private dialog: MatDialog,
        public _d: PositionDataService,
        private _utils: UtilsService
    ) { }

    async ngOnInit(): Promise<void> {
        // Initialize layout
        this.layoutSub = this._app.layout.subscribe((nl: ILayout) => { this.layout = nl });

        /**
         * Initialize the epoch sub briefly. This subscription is destroyed once the 
         * first epoch value is emmited
         */
         this.epochSub = this._app.epoch.subscribe(async (e: IEpochRecord|undefined|null) => {
            if (e !== null && !this.initialized) {
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
                    await this.initializeEpochData(e.id);
                }

                // Set the init state
                this.initializing = false;
                this.initialized = true;
            } else if (e === undefined) { this.initialized = true  }
        });
    }


    ngOnDestroy(): void {
        if (this.layoutSub) this.layoutSub.unsubscribe();
        if (this.epochSub) this.epochSub.unsubscribe();
        this._d.reset();
    }








    /***************
     * Initializer *
     ***************/



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

        // Make sure the provided ID is valid
        if (!this._validations.epochIDValid(epochID || "")) {
            this.loaded = true;
            return;
        }

        // Initialize the epoch summary
        let epochSummary: IEpochRecord|undefined|null = null;

        // Check if the epoch matches the active one
        if (this._app.epoch.value && this._app.epoch.value.id == epochID) {
            // Set the epoch summary
            epochSummary = this._app.epoch.value;
        }

        // If it isn"t the active epoch, retrieve the summary from the API
        else {
            try {
                epochSummary = await this._localDB.getEpochRecord(<string>epochID);
            } catch (e) { this._app.error(e) }
        }

        // Make sure an epoch summary was found
        if (!epochSummary) {
            this._app.error("Could not extract the Epoch Record.");
            this.loaded = true;
            return;
        }

        // Populate the epoch
        this.epoch = epochSummary;

        // Initialize the position data
        await this._d.initialize(this.epoch.installed, this.epoch.uninstalled || this._app.serverTime.value!);
        await this.applyViewSize(this.viewSize);

        // Set the loading state
        this.loaded = true;

        // Activate the section
        await this.activateSection(this.activeSection.id);
    }









    /**************
     * Navigation *
     **************/




    /**
     * Triggers whenever the tabs change. If the history is activated,
     * it will load all required data and prepare the view.
     * @param sectionID 
     * @returns Promise<void>
     */
    public async activateSection(sectionID: ISectionID): Promise<void> {
        // Hide the sidenavs if any
		if (this.positionSidenav && this.positionSidenavOpened) this.positionSidenav.close();

        // Set loading state
        this.sectionLoaded = false;

        // Populate the active section
        this.activeSection = this.sections.filter((s) => s.id == sectionID)[0];

        // Initialize the history if applies
        if (this.activeSection.id == "history") {
            await this.loadFirstHistPage();
            this.sectionLoaded = true;
        }

        // Otherwise, just apply a small delay
        else { await this._utils.asyncDelay(0.5) }

        // Set the load state
        this.sectionLoaded = true;
    }








    /************************
     * View Size Management *
     ************************/




    /**
     * Displays the menu for all the sizes that can be applied to the
     * positions.
     */
    public changeViewSize(): void {
        // Display the bottom sheet and handle the action
        const menu: IBottomSheetMenuItem[] = [
            {icon: "date_range", title: "Last Day", description: "View the last 24 hours worth of data", response: "24 hours"},
            {icon: "date_range", title: "Last 2 Days", description: "View the last 48 hours worth of data", response: "48 hours"},
            {icon: "date_range", title: "Last 3 Days", description: "View the last 72 hours worth of data", response: "72 hours"},
            {icon: "date_range", title: "Last Week", description: "View the last 7 days worth of data", response: "1 week"},
            {icon: "date_range", title: "Last 2 Weeks", description: "View the last 14 days worth of data", response: "2 weeks"},
            {icon: "date_range", title: "Last Month", description: "View the last 30 days worth of data", response: "1 month"},
            {icon: "date_range", title: "Last 2 Months", description: "View the last 60 days worth of data", response: "2 months"},
            {icon: "date_range", title: "Last 3 Months", description: "View the last 90 days worth of data", response: "3 months"},
            {icon: "date_range", title: "All", description: "View all the data", response: "all"},
        ];
        const bs: MatBottomSheetRef = this._nav.displayBottomSheetMenu(menu.filter((mi) => mi.response != this.viewSize));
        bs.afterDismissed().subscribe(async (response: string|undefined) => {
            if (response) this.applyViewSize(<IViewSize>response);
        });
    }






    /**
     * Applies a given size to the view and rebuilds the 
     * data.
     * @param size 
     * @returns Promise<void>
     */
    private async applyViewSize(size: IViewSize): Promise<void> {
        // Reset the view
        this.resetView();

        // Set loading state
        this.loaded = false;

        // Calculate the range and set the size on the data
        const { start, end } = this.calculateViewRange(size);
        this._d.setSize(start, end);
        this.viewSize = size;

        // Build the charts
        this.buildCharts();

        // Build the history pages
        this.buildHistPages();

        // Set loading state after a small delay
        await this._utils.asyncDelay(0.5);
        this.loaded = true;
    }







    /**
     * Resets all the view properties to pristine state.
     */
    private resetView(): void {
        //this.viewSize = "all";
        this.activeSection = this.sections[0];
        this.summary = undefined;
        this.pnl = undefined;
        this.fees = undefined;
        this.amounts = undefined;
        this.prices = undefined;
        this.visibleTrades = 15;
        this.histChart = undefined;
        this.histPages = [];
        this.activePage = 0;
    }







    /**
     * Calculates the size's start and end timestamps. 
     * @param size 
     * @returns {start: number, end: number}
     */
    private calculateViewRange(size: IViewSize): {start: number, end: number} {
        // Calculate the end of the range
        const end: number = this.epoch!.uninstalled ? this.epoch!.uninstalled: this._app.serverTime.value!;

        // Finally, return the range
        return { start: this.calculateStartBySize(size, end), end: end }
    }




    /**
     * Calculates the start time of a view range based on the end.
     * @param size 
     * @param endAt 
     * @returns number
     */
    private calculateStartBySize(size: IViewSize, endAt: number): number {
        switch (size) {
            case "24 hours":
                return moment(endAt).subtract(24, "hours").valueOf();
            case "48 hours":
                return moment(endAt).subtract(48, "hours").valueOf();
            case "72 hours":
                return moment(endAt).subtract(72, "hours").valueOf();
            case "1 week":
                return moment(endAt).subtract(1, "week").valueOf();
            case "2 weeks":
                return moment(endAt).subtract(2, "weeks").valueOf();
            case "1 month":
                return moment(endAt).subtract(1, "month").valueOf();
            case "2 months":
                return moment(endAt).subtract(2, "months").valueOf();
            case "3 months":
                return moment(endAt).subtract(3, "months").valueOf();
            case "all":
                return this.epoch!.installed;
            default:
                return moment(endAt).subtract(1, "month").valueOf();
        }
    }













    /*****************************
     * Essential Charts Building *
     *****************************/




    /**
     * When triggered, builds all the essential charts.
     */
    private buildCharts(): void {
        // Build the summary charts
        this.buildSummaryCharts();

        // Build the pnl charts
        this.buildPNLCharts();

        // Build the fees charts
        this.buildFeesCharts();

        // Build the amounts charts
        this.buildAmountsCharts();

        // Build the prices charts
        this.buildPricesCharts();
    }




    // SUMMARY CHARTS
    private buildSummaryCharts(): void {
        const pnlAccumRaw: number[] = this._d.pnl.elementsAccum.map((e) => e.y);
        this.summary = {
            pnlHist: this._chart.getLineChartOptions(
                { 
                    series: [{name: "PNL History", data: this._d.pnl.elementsAccum, color: this.getChartColor(this._d.pnl.lastAccum)}],
                    stroke: {curve: "smooth", width:5},
                    xaxis: {type: "datetime", labels: { show: true, datetimeUTC: false }, axisTicks: {show: true}, }
                },
                this.layout == "desktop" ? 240: 300,
                true,
                { min: <number>this._utils.getMin(pnlAccumRaw), max: <number>this._utils.getMax(pnlAccumRaw)}
            ),
            trades: this._chart.getBarChartOptions(
				{
					series: [
						{name:'L.Open', data: [this._d.longIncreaseTrades]},
						{name:'L.Close', data: [this._d.longCloseTrades]},
						{name:'S.Open', data: [this._d.shortIncreaseTrades]},
						{name:'S.Close', data: [this._d.shortCloseTrades]},
					], 
					colors: ["#009688", "#004D40", "#F44336", "#B71C1C"],
					xaxis: {categories: [ "Bottom Line" ], labels: {show: false}},
					yaxis: {labels: {show: false}},
					plotOptions: { bar: { horizontal: false, borderRadius: 4, columnWidth: "20%"}},
				}, 
				["Trades"], 
				this.layout == "desktop" ? 255: 250
			),
            pnl: this._chart.getBarChartOptions(
				{
					series: [
						{ name: "Long PNL", data: [ this._d.longPNL.lastAccum ] },
						{ name: "Short PNL", data: [ this._d.shortPNL.lastAccum ] }
					], 
					colors: [ this._chart.upwardColor, this._chart.downwardColor],
					xaxis: {categories: [ "PNL" ], labels: {show: false}},
					yaxis: {labels: {show: false}},
					plotOptions: { bar: { horizontal: false, borderRadius: 4, columnWidth: "10%"}},
				}, 
				[ "PNL" ], 
				this.layout == "desktop" ? 255: 250
			),
            bottomLine: this._chart.getBarChartOptions(
				{
					series: [
						{ name: "Sub Total", data: [ this._d.subTotal ] },
						{ name: "Fees", data: [ this._d.feesTotal ] },
						{ name: "Net Profit", data: [ this._d.netProfit ] }
					], 
					colors: [ "#26A69A", "#D32F2F", "#004D40"],
					xaxis: {categories: [ "Bottom Line" ], labels: {show: false}},
					yaxis: {labels: {show: false}},
					plotOptions: { bar: { horizontal: false, borderRadius: 4, columnWidth: "15%"}},
				}, 
				[ "Bottom Line" ], 
				this.layout == "desktop" ? 255: 250
			),
            fees: this._chart.getBarChartOptions(
				{
					series: [
						{ name: "Long Fees", data: [ this._d.longFees.lastAccum ] },
						{ name: "Short Fees", data: [ this._d.shortFees.lastAccum ] }
					], 
					colors: [ this._chart.upwardColor, this._chart.downwardColor],
					xaxis: {categories: [ "Fees" ], labels: {show: false}},
					yaxis: {labels: {show: false}},
					plotOptions: { bar: { horizontal: false, borderRadius: 4, columnWidth: "10%"}},
				}, 
				[ "Fees" ], 
				this.layout == "desktop" ? 255: 250
			),
            amounts: this._chart.getBarChartOptions(
				{
					series: [
						{ name: "Long Amounts", data: [ this._d.longAmounts.lastAccum ] },
						{ name: "Short Amounts", data: [ this._d.shortAmounts.lastAccum ] }
					], 
					colors: [ this._chart.upwardColor, this._chart.downwardColor],
					xaxis: {categories: [ "Amounts" ], labels: {show: false}},
					yaxis: {labels: {show: false}},
					plotOptions: { bar: { horizontal: false, borderRadius: 4, columnWidth: "10%"}},
				}, 
				[ "Amounts" ], 
				this.layout == "desktop" ? 255: 250
			),
            prices: this._chart.getBarChartOptions(
				{
					series: [
						{ name: "Long Prices", data: [ this._d.longPrices.mean ] },
						{ name: "Short Prices", data: [ this._d.shortPrices.mean ] }
					], 
					colors: [ this._chart.upwardColor, this._chart.downwardColor],
					xaxis: {categories: [ "Prices Mean" ], labels: {show: false}},
					yaxis: {labels: {show: false}},
					plotOptions: { bar: { horizontal: false, borderRadius: 4, columnWidth: "10%"}},
				}, 
				[ "Prices Mean" ], 
				this.layout == "desktop" ? 255: 250
			)
        }
		const self = this;
		this.summary.pnlHist.chart.events = {
			click: function(e: any, cc: any, c: any) {
				if (c.dataPointIndex >= 0 && self._d.pnl.elementsAccum[c.dataPointIndex]) {
					self.displayTrade(self._d.pnl.elementsAccum[c.dataPointIndex].x)
				}
			}
		}
    }




    // PNL CHARTS
    private buildPNLCharts(): void {
        this.pnl = {
            long: this.getLineChart("Long PNL", this._d.longPNL.elements, this._chart.upwardColor, 250, 300),
            longAccum: this.getLineChart("Long Accum. PNL", this._d.longPNL.elementsAccum, this._chart.upwardColor, 250, 300),
            short: this.getLineChart("Short PNL", this._d.shortPNL.elements, this._chart.downwardColor, 250, 300),
            shortAccum: this.getLineChart("Short Accum. PNL", this._d.shortPNL.elementsAccum, this._chart.downwardColor, 250, 300),
        };
        this.pnl.long.chart!.id = "longPNL";
        this.pnl.long.chart!.group = "long";
        this.pnl.longAccum.chart!.id = "longAccumPNL";
        this.pnl.longAccum.chart!.group = "long";
        this.pnl.short.chart!.id = "shortPNL";
        this.pnl.short.chart!.group = "short";
        this.pnl.shortAccum.chart!.id = "shortAccumPNL";
        this.pnl.shortAccum.chart!.group = "short";
		const self = this;
		this.pnl.long.chart.events = this.pnl.longAccum.chart.events = {
			click: function(e: any, cc: any, c: any) {
				if (c.dataPointIndex >= 0 && self._d.longPNL.elementsAccum[c.dataPointIndex]) {
					self.displayTrade(self._d.longPNL.elementsAccum[c.dataPointIndex].x)
				}
			}
		}
		this.pnl.short.chart.events = this.pnl.shortAccum.chart.events = {
			click: function(e: any, cc: any, c: any) {
				if (c.dataPointIndex >= 0 && self._d.shortPNL.elementsAccum[c.dataPointIndex]) {
					self.displayTrade(self._d.shortPNL.elementsAccum[c.dataPointIndex].x)
				}
			}
		}
    }



    // FEES CHARTS
    private buildFeesCharts(): void {
        this.fees = {
            long: this.getLineChart("Long Fees", this._d.longFees.elements, this._chart.upwardColor, 250, 300),
            longAccum: this.getLineChart("Long Accum. Fees", this._d.longFees.elementsAccum, this._chart.upwardColor, 250, 300),
            short: this.getLineChart("Short Fees", this._d.shortFees.elements, this._chart.downwardColor, 250, 300),
            shortAccum: this.getLineChart("Short Accum. Fees", this._d.shortFees.elementsAccum, this._chart.downwardColor, 250, 300),
        };
        this.fees.long.chart!.id = "longFees";
        this.fees.long.chart!.group = "long";
        this.fees.longAccum.chart!.id = "longAccumFees";
        this.fees.longAccum.chart!.group = "long";
        this.fees.short.chart!.id = "shortFees";
        this.fees.short.chart!.group = "short";
        this.fees.shortAccum.chart!.id = "shortAccumFees";
        this.fees.shortAccum.chart!.group = "short";
		const self = this;
		this.fees.long.chart.events = this.fees.longAccum.chart.events = {
			click: function(e: any, cc: any, c: any) {
				if (c.dataPointIndex >= 0 && self._d.longFees.elementsAccum[c.dataPointIndex]) {
					self.displayTrade(self._d.longFees.elementsAccum[c.dataPointIndex].x)
				}
			}
		}
		this.fees.short.chart.events = this.fees.shortAccum.chart.events = {
			click: function(e: any, cc: any, c: any) {
				if (c.dataPointIndex >= 0 && self._d.shortFees.elementsAccum[c.dataPointIndex]) {
					self.displayTrade(self._d.shortFees.elementsAccum[c.dataPointIndex].x)
				}
			}
		}
    }



    // AMOUNTS CHARTS
    private buildAmountsCharts(): void {
        this.amounts = {
            long: this.getLineChart("Long", this._d.longAmounts.elementsAccum, this._chart.upwardColor, 230, 300),
            longIncrease: this.getLineChart("Long Increase", this._d.longIncreaseAmounts.elements, this._chart.upwardColor, 230, 300),
            longClose: this.getLineChart("Long Close", this._d.longCloseAmounts.elements, this._chart.upwardColor, 230, 300),
            short: this.getLineChart("Short", this._d.shortAmounts.elementsAccum, this._chart.downwardColor, 230, 300),
            shortIncrease: this.getLineChart("Short Increase", this._d.shortIncreaseAmounts.elements, this._chart.downwardColor, 230, 300),
            shortClose: this.getLineChart("Short Close", this._d.shortCloseAmounts.elements, this._chart.downwardColor, 230, 300),
        };
		const self = this;
		this.amounts.long.chart.events = {
			click: function(e: any, cc: any, c: any) {
				if (c.dataPointIndex >= 0 && self._d.longAmounts.elements[c.dataPointIndex]) {
					self.displayTrade(self._d.longAmounts.elements[c.dataPointIndex].x)
				}
			}
		};
		this.amounts.longIncrease.chart.events = {
			click: function(e: any, cc: any, c: any) {
				if (c.dataPointIndex >= 0 && self._d.longIncreaseAmounts.elements[c.dataPointIndex]) {
					self.displayTrade(self._d.longIncreaseAmounts.elements[c.dataPointIndex].x)
				}
			}
		};
		this.amounts.longClose.chart.events = {
			click: function(e: any, cc: any, c: any) {
				if (c.dataPointIndex >= 0 && self._d.longCloseAmounts.elements[c.dataPointIndex]) {
					self.displayTrade(self._d.longCloseAmounts.elements[c.dataPointIndex].x)
				}
			}
		};
		this.amounts.short.chart.events = {
			click: function(e: any, cc: any, c: any) {
				if (c.dataPointIndex >= 0 && self._d.shortAmounts.elements[c.dataPointIndex]) {
					self.displayTrade(self._d.shortAmounts.elements[c.dataPointIndex].x)
				}
			}
		};
		this.amounts.shortIncrease.chart.events = {
			click: function(e: any, cc: any, c: any) {
				if (c.dataPointIndex >= 0 && self._d.shortIncreaseAmounts.elements[c.dataPointIndex]) {
					self.displayTrade(self._d.shortIncreaseAmounts.elements[c.dataPointIndex].x)
				}
			}
		};
		this.amounts.shortClose.chart.events = {
			click: function(e: any, cc: any, c: any) {
				if (c.dataPointIndex >= 0 && self._d.shortCloseAmounts.elements[c.dataPointIndex]) {
					self.displayTrade(self._d.shortCloseAmounts.elements[c.dataPointIndex].x)
				}
			}
		};
    }



    // PRICES CHARTS
    private buildPricesCharts(): void {
        this.prices = {
            long: this.getLineChart("Long Prices", this._d.longPrices.elements, this._chart.upwardColor, 230, 300),
            longIncrease: this.getLineChart("Long Open Prices", this._d.longIncreasePrices.elements, this._chart.upwardColor, 230, 300),
            longClose: this.getLineChart("Long Close Prices", this._d.longClosePrices.elements, this._chart.upwardColor, 230, 300),
            short: this.getLineChart("Short Prices", this._d.shortPrices.elements, this._chart.downwardColor, 230, 300),
            shortIncrease: this.getLineChart("Short Open Prices", this._d.shortIncreasePrices.elements, this._chart.downwardColor, 230, 300),
            shortClose: this.getLineChart("Short Close Prices", this._d.shortClosePrices.elements, this._chart.downwardColor, 230, 300),
        };
    }






    /**
     * Builds a line chart based on the provided configuration.
     * @param name 
     * @param data 
     * @param color 
     * @param desktopHeight 
     * @param mobileHeight 
     * @returns ILineChartOptions
     */
    private getLineChart(
        name: string,
        data: IItemElement[],
        color: string,
        desktopHeight: number,
        mobileHeight: number,
    ): ILineChartOptions {
        return this._chart.getLineChartOptions(
            { 
                series: [{name: name, data: data, color: color}],
                stroke: {curve: "smooth", width:5},
                xaxis: {type: "datetime", labels: { show: true, datetimeUTC: false }, axisTicks: {show: true}, }
            },
            this.layout == "desktop" ? desktopHeight: mobileHeight
        )
    }











    /***************************
     * Position Trades History *
     ***************************/




	/**
	 * Builds the history pages based on the trades executed.
	 */
     private buildHistPages(): void {
		// Calculate the number of milliseconds in 4 days
		const pageSize: number = 1000 * 60 * 60 * 24 * 4;

		// Init the pages and build them
		this.histPages = [];
		for (let i = this._d.start; i < this._d.end; i = i + pageSize) {
			this.histPages.push({start: i, end: i + pageSize });
		}
	}



	// First Page
	public async loadFirstHistPage(): Promise<void> {
		// Set loading state
		this.loadingPage = true;

		// Load the data
		try {
			// Calculate the new page
			const newPage: number = 0;
			
			// Load the page
			await this.buildHistoryCandlesticks(newPage);

			// Set the active page
			this.activePage = newPage;
		} catch (e) { this._app.error(e) }

		// Set loading state
		this.loadingPage = false;
	}


	// Previous Page
	public async loadPreviousHistPage(): Promise<void> {
		// Load the first page if applies
		if (this.activePage == 2) {
			await this.loadFirstHistPage();
		}

		// Otherwise, load the correct page
		else {
			// Set loading state
			this.loadingPage = true;

			// Load the data
			try {
				// Calculate the new page
				const newPage: number = this.activePage - 1;

				// Load the page
				await this.buildHistoryCandlesticks(newPage);

				// Set the active page
				this.activePage = newPage;
			} catch (e) { this._app.error(e) }

			// Set loading state
			this.loadingPage = false;
		}
	}


	// Next Page
	public async loadNextHistPage(): Promise<void> {
		// Load the last page if applies
		if (this.activePage == this.histPages.length - 2) {
			await this.loadLastHistPage();
		}

		// Otherwise, load the correct page
		else {
			// Set loading state
			this.loadingPage = true;

			// Load the data
			try {
				// Calculate the new page
				const newPage: number = this.activePage + 1;

				// Load the page
				await this.buildHistoryCandlesticks(newPage);

				// Set the active page
				this.activePage = newPage;
			} catch (e) { this._app.error(e) }

			// Set loading state
			this.loadingPage = false;
		}
	}


	// Last Page
	public async loadLastHistPage(): Promise<void> {
		// Set loading state
		this.loadingPage = true;

		// Load the data
		try {
			// Calculate the new page
			const newPage: number = this.histPages.length - 1;

			// Load the page
			await this.buildHistoryCandlesticks(newPage);

			// Set the active page
			this.activePage = newPage;
		} catch (e) { this._app.error(e) }

		// Set loading state
		this.loadingPage = false;
	}




	/**
	 * Downloads and builds the history's candlesticks
	 * based on a provided page index.
	 * @param pageIndex 
	 * @returns Promise<void>
	 */
	private async buildHistoryCandlesticks(pageIndex: number): Promise<void> {
		// Retrieve the candlesticks
		const candlesticks: ICandlestick[] = await this._localDB.getCandlesticksForPeriod(
			this.histPages[pageIndex].start,
			this.histPages[pageIndex].end,
			<number>this._app.serverTime.value
		);

		// If there are no candlesticks, don't build the chart
		if (!candlesticks.length) throw new Error("The chart could not be built because no candlesticks were retrieved.");

		// Build the annotations
		const annotations: ApexAnnotations = this.buildHistoryCandlesticksAnnotations(pageIndex);

		// Build the chart
		this.histChart = this._chart.getCandlestickChartOptions(candlesticks, annotations, false, false);
		this.histChart.chart!.toolbar = {show: true,tools: {selection: true,zoom: true,zoomin: true,zoomout: true,download: false}};
		this.histChart.chart!.zoom = {enabled: true, type: "xy"};
		this.histChart.chart!.height = this._app.layout.value == "desktop" ? 450: 370;
        this.histChart.chart!.id = "candles";
        this.histChart.chart!.group = "predictions";


        // Retrieve the predictions within the range
        const preds: IPredictionCandlestick[] = await this._localDB.listPredictionCandlesticks(
            this.epoch!.id, 
            this.histPages[pageIndex].start, 
            this.histPages[pageIndex].end,
            this.epoch!.installed,
            <number>this._app.serverTime.value
        );

        // Build the bars data
        const { values, colors } = this.buildPredictionBarsData(candlesticks, preds);
        
        // Build the chart
        this.histBarChart = this._chart.getBarChartOptions(
            {
                series: [{name: "SUM Mean", data: values}],
                chart: {height: 180, type: "bar",animations: { enabled: false}, toolbar: {show: false,tools: {download: false}}, zoom: {enabled: false}},
                plotOptions: {bar: {borderRadius: 0, horizontal: false, distributed: true,}},
                colors: colors,
                grid: {show: true},
                xaxis: {type: "datetime", tooltip: {enabled: false}, labels: { show: false, datetimeUTC: false } }
            }, 
            [], 
            undefined, 
            false,
            true,
            {
                min: -this.epoch!.model.regressions.length, 
                max: this.epoch!.model.regressions.length, 
            }
        );
        this.histBarChart.chart!.id = "bars";
        this.histBarChart.chart!.group = "predictions";
        this.histBarChart.yaxis!.labels = {minWidth: 40}
        this.histBarChart.yaxis!.tooltip = {enabled: false}
	}





	/**
	 * Builds the annotations based on a provided list of candlesticks.
	 * @returns ApexAnnotations
	 */
	private buildHistoryCandlesticksAnnotations(pageIndex: number): ApexAnnotations {
		// Init values
		const pageStart: number = this.histPages[pageIndex].start;
		const pageEnd: number = this.histPages[pageIndex].end;
		let yaxis: YAxisAnnotations[] = [];
		let xaxis: XAxisAnnotations[] = [];
		let points: PointAnnotations[] = [];

		// Retrieve the trades that were executed within the candlestick's range
		const trades: IPositionTrade[] = this._d.query.filter(t => t.t >= pageStart  && t.t <= pageEnd);

		// Check if any trades were found
		if (trades.length) {
			for (let trade of trades) {
				const color: string = this.getTradeColor(trade);
				xaxis.push(
					{
						x: trade.t,
						label: {
							text: this.getTradeLabel(trade),
							borderColor: color,
							style: { color: '#fff', background: color}
						}
					}
				);
			}
		}

		// Finally, return the annotations
		return {
			yaxis: yaxis,
			xaxis: xaxis,
			points: points
		}
	}






	/**
	 * Builds the data required by the bar chart based on the 
	 * candlesticks and the generated predictions.
	 * @param candlesticks 
	 * @param preds 
	 * @returns {values: number[], colors: string[]}
	 */
     private buildPredictionBarsData(
		candlesticks: ICandlestick[], 
		preds: IPredictionCandlestick[]
	): {values: {x: number, y: number}[], colors: string[]} {
		// Init values
		let values: {x: number, y: number}[] = [];
		let colors: string[] = [];

		// Iterate over each candlestick and group the preds
		for (let candle of candlesticks) {
			// Group the predictions within the candlestick
			const predsInCandle: IPredictionCandlestick[] = preds.filter((p) => candle.ot >= p.ot  && p.ot <= candle.ct);

			// Make sure there are predictions in the candle
			if (predsInCandle.length) {
				// Calculate the mean of the sums within the group
				const sumsMean: number = predsInCandle[predsInCandle.length - 1].sm;

				// Append the values
				values.push({x: candle.ot, y: sumsMean});
				if (sumsMean > 0) { colors.push(this._chart.upwardColor) }
				else if (sumsMean < 0) { colors.push(this._chart.downwardColor) }
				else { colors.push(this._chart.neutralColor) }
			}
			
			// Otherwise, fill the void with blanks
			else {
				values.push({x: candle.ot, y: 0.000000});
				colors.push(this._chart.neutralColor);
			}
		}

		// Finally, return the data
		return { values: values, colors: colors };
	}






    /**
     * Retrieves the annotation label based on the type of trade.
     * @param trade 
     * @returns string
     */
    private getTradeLabel(trade: IPositionTrade): string {
        if (trade.ps == "LONG" && trade.s == "BUY") { return "LONG_OPEN" }			
		else if (trade.ps == "LONG" && trade.s == "SELL") { return "LONG_CLOSE" }
		else if (trade.ps == "SHORT" && trade.s == "SELL") { return "SHORT_OPEN" }
		else { return "SHORT_CLOSE" }
    }



    /**
     * Retrieves the color of an annotation based on its type
     * @param trade 
     * @returns string
     */
	private getTradeColor(trade: IPositionTrade): string {
		if (trade.ps == "LONG" && trade.s == "BUY") { return "#26A69A" }			
		else if (trade.ps == "LONG" && trade.s == "SELL") { return "#004D40" }
		else if (trade.ps == "SHORT" && trade.s == "SELL") { return "#EF5350" }
		else { return "#B71C1C" }
	}














    /****************
     * Misc Helpers *
     ****************/





    /**
     * Displays a position dialog based on a given query.
     * The values can be a trade object, a timestamp or
     * a timestamp range.
     * @param query 
     */
    public displayTrade(query: IPositionTrade|{start: number, end: number}|number|any): void {
        // Init the trade
        let trade: IPositionTrade|undefined;

        // Populate the trade based on the query
        if (typeof query == "number") {
            trade = this._d.getTradeByTimestamp(query);
        }
        else if (query && typeof query == "object" && query.start && query.end) {
            trade = this._d.getTradeByRange(query.start, query.end);
        }
        else if (query && typeof query == "object") {
            trade = query;
        }

        // If the trade was not found, abort
        if (!trade) return;

        // Finally, display the dialog
		this.dialog.open(PositionTradeDialogComponent, {
			hasBackdrop: this._app.layout.value != 'mobile', // Mobile optimization
			panelClass: 'small-dialog',
			data: trade
		})
    }




    /**
     * Displays the data items dialog.
     * @param items 
     */
    public displayDataItems(items: IPositionDataItem[]): void {
		this.dialog.open(PositionDataItemDialogComponent, {
			hasBackdrop: this._app.layout.value != 'mobile', // Mobile optimization
			panelClass: 'small-dialog',
			data: items
		})
    }




    /**
     * Displays the Epoch's Prediction model if it has been
     * set correctly.
     */
    public displayPredictionModel(): void {
        if (this.epoch) {
            this._nav.displayPredictionModelConfigDialog(this.epoch.model);
        }
    }




    /**
     * Returns the color of a chart based on its value.
     * @param value 
     * @returns string
     */
    private getChartColor(value: number): string {
        if (value > 0)      { return this._chart.upwardColor }
        else if (value < 0) { return this._chart.downwardColor }
        else                { return this._chart.neutralColor }
    }
}
