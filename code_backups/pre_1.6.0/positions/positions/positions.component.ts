import { Component, OnInit, OnDestroy, ViewChild } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { MatSidenav } from "@angular/material/sidenav";
import { MatDialog } from "@angular/material/dialog";
import { Subscription } from "rxjs";
import { 
    IEpochRecord, 
    IItemElement, 
    IPosition, 
    IPositionDataItem, 
    LocalDatabaseService, 
    PositionDataService, 
    PredictionService,
    UtilsService
} from "../../../core";
import { 
    AppService, 
    ChartService, 
    IBarChartOptions, 
    ILayout, 
    ILineChartOptions, 
    NavService, 
    ValidationsService 
} from "../../../services";
import { PositionDialogComponent } from "./position-dialog";
import { 
    IPositionsComponent, 
    ISection, 
    ISectionID,
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

    // Navigation
    public readonly sections: ISection[] = [
        { id: "summary", name: "Summary", icon: "dashboard"},
        { id: "pnl", name: "PNL", icon: "download"},
        { id: "fees", name: "Fees", icon: "upload"},
        { id: "amounts", name: "Amounts", icon: "aspect_ratio"},
        { id: "prices", name: "Prices", icon: "price_check"},
        { id: "positions", name: "Positions", icon: "format_list_numbered"},
    ];
    public activeSection = this.sections[0];
    public sectionLoaded: boolean = false;

    // Summary Section
    public summary: {
        pnlHist: ILineChartOptions,
        positions: IBarChartOptions,
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
        longAccum: ILineChartOptions,
        long: ILineChartOptions,
        shortAccum: ILineChartOptions,
        short: ILineChartOptions,
    }|undefined;

    // Prices Section
    public prices: {
        long: ILineChartOptions,
        short: ILineChartOptions,
    }|undefined;

    // Trades list section
    public visiblePositions: number = 15;
    
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
        await this.buildView();

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
        await this._utils.asyncDelay(0.5)

        // Set the load state
        this.sectionLoaded = true;
    }








    /************************
     * View Size Management *
     ************************/




    /**
     * Applies a given size to the view and rebuilds the 
     * data.
     * @param size 
     * @returns Promise<void>
     */
    private async buildView(): Promise<void> {
        // Reset the view
        this.resetView();

        // Set loading state
        this.loaded = false;

        // Build the charts
        this.buildCharts();

        // Set loading state after a small delay
        await this._utils.asyncDelay(0.5);
        this.loaded = true;
    }







    /**
     * Resets all the view properties to pristine state.
     */
    private resetView(): void {
        this.activeSection = this.sections[0];
        this.summary = undefined;
        this.pnl = undefined;
        this.fees = undefined;
        this.amounts = undefined;
        this.prices = undefined;
        this.visiblePositions = 15;
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
            positions: this._chart.getBarChartOptions(
				{
					series: [
						{name:'Long', data: [this._d.longPositions]},
						{name:'Short', data: [this._d.shortPositions]},
					], 
					colors: [this._chart.upwardColor, this._chart.downwardColor],
					xaxis: {categories: [ "Positions" ], labels: {show: false}},
					yaxis: {labels: {show: false}},
					plotOptions: { bar: { horizontal: false, borderRadius: 4, columnWidth: "10%"}},
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
					self.displayPosition(self._d.pnl.elementsAccum[c.dataPointIndex].x)
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
					self.displayPosition(self._d.longPNL.elementsAccum[c.dataPointIndex].x)
				}
			}
		}
		this.pnl.short.chart.events = this.pnl.shortAccum.chart.events = {
			click: function(e: any, cc: any, c: any) {
				if (c.dataPointIndex >= 0 && self._d.shortPNL.elementsAccum[c.dataPointIndex]) {
					self.displayPosition(self._d.shortPNL.elementsAccum[c.dataPointIndex].x)
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
					self.displayPosition(self._d.longFees.elementsAccum[c.dataPointIndex].x)
				}
			}
		}
		this.fees.short.chart.events = this.fees.shortAccum.chart.events = {
			click: function(e: any, cc: any, c: any) {
				if (c.dataPointIndex >= 0 && self._d.shortFees.elementsAccum[c.dataPointIndex]) {
					self.displayPosition(self._d.shortFees.elementsAccum[c.dataPointIndex].x)
				}
			}
		}
    }



    // AMOUNTS CHARTS
    private buildAmountsCharts(): void {
        this.amounts = {
            longAccum: this.getLineChart("Long Accumulation", this._d.longAmounts.elementsAccum, this._chart.upwardColor, 250, 300),
            long: this.getLineChart("Long", this._d.longAmounts.elements, this._chart.upwardColor, 250, 300),
            shortAccum: this.getLineChart("Short Accumulation", this._d.shortAmounts.elementsAccum, this._chart.downwardColor, 250, 300),
            short: this.getLineChart("Short", this._d.shortAmounts.elements, this._chart.downwardColor, 250, 300)
        };
        this.amounts.long.chart!.id = "longAmounts";
        this.amounts.long.chart!.group = "long";
        this.amounts.longAccum.chart!.id = "longAccumAmounts";
        this.amounts.longAccum.chart!.group = "long";
        this.amounts.short.chart!.id = "shortFees";
        this.amounts.short.chart!.group = "short";
        this.amounts.shortAccum.chart!.id = "shortAccumAmounts";
        this.amounts.shortAccum.chart!.group = "short";
		const self = this;
        this.amounts.longAccum.chart.events = {
			click: function(e: any, cc: any, c: any) {
				if (c.dataPointIndex >= 0 && self._d.longAmounts.elements[c.dataPointIndex]) {
					self.displayPosition(self._d.longAmounts.elements[c.dataPointIndex].x)
				}
			}
		};
		this.amounts.long.chart.events = {
			click: function(e: any, cc: any, c: any) {
				if (c.dataPointIndex >= 0 && self._d.longAmounts.elements[c.dataPointIndex]) {
					self.displayPosition(self._d.longAmounts.elements[c.dataPointIndex].x)
				}
			}
		};
		this.amounts.shortAccum.chart.events = {
			click: function(e: any, cc: any, c: any) {
				if (c.dataPointIndex >= 0 && self._d.shortAmounts.elements[c.dataPointIndex]) {
					self.displayPosition(self._d.shortAmounts.elements[c.dataPointIndex].x)
				}
			}
		};
		this.amounts.short.chart.events = {
			click: function(e: any, cc: any, c: any) {
				if (c.dataPointIndex >= 0 && self._d.shortAmounts.elements[c.dataPointIndex]) {
					self.displayPosition(self._d.shortAmounts.elements[c.dataPointIndex].x)
				}
			}
		};
    }



    // PRICES CHARTS
    private buildPricesCharts(): void {
        this.prices = {
            long: this.getLineChart("Long Prices", this._d.longPrices.elements, this._chart.upwardColor, 350, 300),
            short: this.getLineChart("Short Prices", this._d.shortPrices.elements, this._chart.downwardColor, 350, 300),
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












    /****************
     * Misc Helpers *
     ****************/





    /**
     * Displays a position dialog based on a given query.
     * The values can be a position object, a timestamp or
     * a timestamp range.
     * @param query 
     */
    public displayPosition(query: IPosition|{start: number, end: number}|number|any): void {
        // Init the position
        let position: IPosition|undefined;

        // Populate the trade based on the query
        if (typeof query == "number") {
            position = this._d.getPositionByTimestamp(query);
        }
        else if (query && typeof query == "object" && query.start && query.end) {
            position = this._d.getPositionByRange(query.start, query.end);
        }
        else if (query && typeof query == "object") {
            position = query;
        }

        // If the trade was not found, abort
        if (!position) return;

        // Finally, display the dialog
		this.dialog.open(PositionDialogComponent, {
			hasBackdrop: this._app.layout.value != 'mobile', // Mobile optimization
			panelClass: 'small-dialog',
			data: position
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
