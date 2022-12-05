import { Component, OnInit, OnDestroy, ViewChild } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { MatBottomSheetRef } from "@angular/material/bottom-sheet";
import { MatSidenav } from "@angular/material/sidenav";
import { MatDialog } from "@angular/material/dialog";
import { Subscription } from "rxjs";
import { ApexAnnotations } from "ng-apexcharts";
import * as moment from "moment";
import { 
    IEpochRecord, 
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
import { IBottomSheetMenuItem } from "src/app/shared/components/bottom-sheet-menu";
import { 
    IPositionsComponent, 
    IViewSize, 
    ISection, 
    ISectionID 
} from './interfaces';



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

    // Initialization State
    public initializing: boolean = false;
    public initialized: boolean = false;

    // View Size
    public viewSize: IViewSize = "2 weeks";

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






    /* Navigation */




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
            // ...
            this.sectionLoaded = true;
        }

        // Otherwise, just apply a small delay
        else { await this._utils.asyncDelay(0.5) }

        // Set the load state
        this.sectionLoaded = true;
    }







    /* View Size Management */




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

        // Set loading state after a small delay
        await this._utils.asyncDelay(0.5);
        this.loaded = true;
    }







    /**
     * Resets all the view properties to pristine state.
     */
    private resetView(): void {
        //this.viewSize = "1 week";
        this.activeSection = this.sections[0];
        this.summary = undefined;
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
                return moment(endAt).subtract(2, "weeks").valueOf();
        }
    }






    /* Charts Building */




    /**
     * When triggered, builds all the essential charts.
     */
    private buildCharts(): void {
        // Build the summary charts
        this.buildSummaryCharts();

        // Build the pnl charts
        // ...

        // Build the fees charts
        // ...

        // Build the amounts charts
        // ...

        // Build the prices charts
        // ...
    }




    /**
     * Builds the summary charts.
     */
    private buildSummaryCharts(): void {
        const pnlAccumRaw: number[] = this._d.pnl.elementsAccum.map((e) => e.y);
        this.summary = {
            pnlHist: this._chart.getLineChartOptions(
                { 
                    series: [{name: "PNL History", data: this._d.pnl.elementsAccum, color: this.getChartColor(this._d.pnl.lastAccum)}],
                    stroke: {curve: "straight", width:5},
                    xaxis: {type: "datetime", labels: { show: true, datetimeUTC: false }, axisTicks: {show: true}, }
                },
                this.layout == "desktop" ? 255: 300,
                true,
                { min: <number>this._utils.getMin(pnlAccumRaw), max: <number>this._utils.getMax(pnlAccumRaw)}
            ),
            trades: this._chart.getBarChartOptions(
				{
					series: [
						{name:'L.Incr.', data: [this._d.longIncreaseTrades]},
						{name:'L.Close', data: [this._d.longCloseTrades]},
						{name:'S.Incr.', data: [this._d.shortIncreaseTrades]},
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
    }















    /* Misc Helpers */





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
