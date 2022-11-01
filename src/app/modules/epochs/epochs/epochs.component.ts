import { Component, OnInit, OnDestroy } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { ActivatedRoute } from "@angular/router";
import { Subscription } from "rxjs";
import { 
    EpochService, 
    IEpochSummary, 
    LocalDatabaseService, 
    UtilsService 
} from "../../../core";
import { 
    AppService, 
    ChartService, 
    IBarChartOptions, 
    ILayout, 
    NavService, 
    ValidationsService 
} from "../../../services";
import { InstallEpochComponent } from "./install-epoch";
import { UninstallEpochComponent } from "./uninstall-epoch";
import { IEpochsComponent } from "./interfaces";

@Component({
  selector: "app-epochs",
  templateUrl: "./epochs.component.html",
  styleUrls: ["./epochs.component.scss"]
})
export class EpochsComponent implements OnInit, OnDestroy, IEpochsComponent {
    // Layout
	public layout: ILayout = this._app.layout.value;
	private layoutSub?: Subscription;

    // Active Epoch
    public epoch: IEpochSummary|null = null;
    private epochSub?: Subscription;

    // Epoch"s Performance Charts
    public profitHist?: IBarChartOptions;
    public accuracy?: IBarChartOptions;
    public profit?: IBarChartOptions;

    // Initialization State
    public initialized: boolean = false;

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
        private _epoch: EpochService,
        private dialog: MatDialog,
        private _chart: ChartService,
        private _utils: UtilsService
    ) { }

    ngOnInit(): void {
        // Initialize layout
        this.layoutSub = this._app.layout.subscribe((nl: ILayout) => this.layout = nl);

        /**
         * Initialize the epoch sub briefly. This subscription is destroyed once the 
         * epoch data initialization is invoked.
         */
        this.epochSub = this._app.epoch.subscribe(async (e: IEpochSummary|undefined|null) => {
            if (e != null && !this.initialized) {
                // Check if an Epoch ID was provided from the URL. If so, initialize it right away.
                const urlEpochID: string|null = this.route.snapshot.paramMap.get("epochID");
                if (typeof urlEpochID == "string" && this._validations.epochIDValid(urlEpochID)) { 
                    await this.initializeEpochData(urlEpochID);
                }

                // Otherwise, check if an active epoch is available
                else if (e){
                    await this.initializeEpochData(e.record.id);
                }

                // Set the init state
                this.initialized = true;
            } else if (e == undefined) { this.initialized = true  }
        });
    }


    ngOnDestroy(): void {
        if (this.layoutSub) this.layoutSub.unsubscribe();
        if (this.epochSub) this.epochSub.unsubscribe();
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
        if (this.epochSub) this.epochSub.unsubscribe();

        // Make sure the provided ID is valid
        if (!this._validations.epochIDValid(epochID || "")) {
            this.loaded = true;
            return;
        }

        // Check if the epoch matches the active one
        if (this._app.epoch.value && this._app.epoch.value.record.id == epochID) {
            this.epochSub = this._app.epoch.subscribe(async (summary: IEpochSummary|null|undefined) => {
                if (summary) {
                    this.epoch = summary;
                    this.onDataChanges();
                    this.loaded = true;
                }
            })
        }

        // If it isn"t the active epoch, retrieve the summary from the API
        else {
            try {
                this.epoch = await this._localDB.getEpochSummary(<string>epochID);
                this.onDataChanges();
            } catch (e) { this._app.error(e) }
            this.loaded = true;
        }
    }






    /**
     * Triggers whenever there is a change in the data and builds
     * all the required data.
     */
    private onDataChanges(): void {
        // Only build the data if the epoch is setup
        if (this.epoch) {
            // Retrieve the profit history data
            const { colors, values } = this._chart.getProfitHistoryData(this.epoch.positions);
            const minBalance: number = <number>this._utils.getMin(values);
            const maxBalance: number = <number>this._utils.getMax(values);

            // Build the positions chart
            this.profitHist = this._chart.getBarChartOptions(
				{
					series: [{name: this.epoch.record.id, data: values}],
					chart: {height: 350, type: "bar",animations: { enabled: false}, toolbar: {show: true,tools: {download: false}}},
					plotOptions: {bar: {borderRadius: 0, horizontal: false, distributed: true,}},
					colors: colors,
					grid: {show: true},
					xaxis: {labels: { show: false } }
				}, 
				[], 
				undefined, 
				false,
				true,
				{min: minBalance, max: maxBalance}
			);

            // Build the accuracy chart
            this.accuracy = this._chart.getBarChartOptions(
                {
                    series: [
                        { name: "Long Acc.", data: [ this.epoch.metrics.long_accuracy ] },
                        { name: "Short Acc.", data: [ this.epoch.metrics.short_accuracy ] },
                        { name: "Acc.", data: [ this.epoch.metrics.accuracy ] },
                    ], 
                    colors: [ this._chart.upwardColor, this._chart.downwardColor, "#000000" ],
                    xaxis: {categories: [ "Accuracy" ], labels: {show: false}},
                    yaxis: {labels: {show: false}},
                    plotOptions: { bar: { horizontal: false, borderRadius: 4, columnWidth: "25%"}},
                }, 
                [ "Accuracy" ], 
                280
            );

            // Build the profit chart
            this.profit = this._chart.getBarChartOptions(
                {
                    series: [
                        { name: "Gross Profit", data: [ this.epoch.metrics.fees + this.epoch.metrics.profit ] },
                        { name: "Fees", data: [ this.epoch.metrics.fees ] },
                        { name: "Net Profit", data: [ this.epoch.metrics.profit ] },
                    ], 
                    colors: [ "#26A69A", this._chart.downwardColor, this._chart.upwardColor ],
                    xaxis: {categories: [ "Profit" ], labels: {show: false}},
                    yaxis: {labels: {show: false}},
                    plotOptions: { bar: { horizontal: false, borderRadius: 4, columnWidth: "25%"}},
                }, 
                [ "Profit" ], 
                280
            );
        }
    }











    /* Install Manager */




    

    /**
     * Displays the install epoch dialog.
     */
    public install(): void {
        this.dialog.open(InstallEpochComponent, {
            disableClose: true,
            hasBackdrop: this._app.layout.value != "mobile", // Mobile optimization
            panelClass: "small-dialog"
        }).afterClosed().subscribe(
            (installed: boolean) => { if (installed) this.initializeEpochData() }
        );
    }







    /**
     * Displays the uninstall epoch dialog.
     */
    public uninstall(): void {
        this.dialog.open(UninstallEpochComponent, {
            disableClose: true,
            hasBackdrop: this._app.layout.value != "mobile", // Mobile optimization
            panelClass: "small-dialog"
        }).afterClosed().subscribe(
            (uninstalled: boolean) => { if (uninstalled) this.initializeEpochData() }
        );
    }
}
