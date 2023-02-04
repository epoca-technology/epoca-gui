import { Component, OnInit, OnDestroy } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import {Title} from "@angular/platform-browser";
import { MatBottomSheetRef } from "@angular/material/bottom-sheet";
import { MatDialog } from "@angular/material/dialog";
import { Subscription } from "rxjs";
import { ApexAnnotations } from "ng-apexcharts";
import * as moment from "moment";
import { 
    IEpochRecord, 
    IPredictionCandlestick, 
    LocalDatabaseService, 
    PredictionService
} from "../../../core";
import { 
    AppService, 
    ChartService, 
    ICandlestickChartOptions, 
    ILayout, 
    NavService, 
    ValidationsService 
} from "../../../services";
import { EpochPredictionCandlestickDialogComponent, IPredictionCandlestickDialogData } from "./epoch-prediction-candlestick-dialog";
import { IBottomSheetMenuItem } from "src/app/shared/components/bottom-sheet-menu";
import { IPredictionsComponent } from "./interfaces";

@Component({
  selector: "app-predictions",
  templateUrl: "./predictions.component.html",
  styleUrls: ["./predictions.component.scss"]
})
export class PredictionsComponent implements OnInit, OnDestroy, IPredictionsComponent {
    // Layout
	public layout: ILayout = this._app.layout.value;
	private layoutSub?: Subscription;

    // Active Epoch
    public epoch: IEpochRecord|null = null;
    private epochSub?: Subscription;

    // Prediction Candlesticks
    public candlesticks: IPredictionCandlestick[] = [];
    public candlesticksChart?: ICandlestickChartOptions;
    private displayDays: number = 1;

    // Initialization State
    public initializing: boolean = false;
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
        private _chart: ChartService,
        private titleService: Title,
        public _prediction: PredictionService,
        private dialog: MatDialog,
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
        this.titleService.setTitle("Epoca");
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

        // Load the candlesticks
        await this.loadCandlesticks(1);

        // Set the loading state
        this.loaded = true;
    }








    /* View Management */








    /**
     * Activates the candlesticks for a given amount of days. If none 
     * are provided, it will prompt the menu.
     * @param days?
     * @returns Promise<void>
     */
    public async activateCandlesticks(days?: number): Promise<void> {
        // If the days were provided, load the data right away
        if (typeof days == "number") {
            this.loaded = false;
            this.displayDays = days;
            await this.loadCandlesticks(days);
            this.loaded = true;
        }
        
        // Otherwise, prompt the menu with the options
        else {
            // Display the bottom sheet and handle the action
            const menu: IBottomSheetMenuItem[] = [
                {icon: "calendar_month", title: "Last Day", description: "View 24 hours worth of data", response: "1"},
                {icon: "calendar_month", title: "Last 2 Days", description: "View 48 hours worth of data", response: "2"},
                {icon: "calendar_month", title: "Last 3 Days", description: "View 3 days worth of data", response: "3"},
                {icon: "calendar_month", title: "Last 7 Days", description: "View 1 week worth of data", response: "7"},
                {icon: "calendar_month", title: "Last 14 Days", description: "View 2 weeks worth of data", response: "14"},
                {icon: "calendar_month", title: "Last 21 Days", description: "View 3 weeks worth of data", response: "21"},
                {icon: "calendar_month", title: "Last Month", description: "View 30 days worth of data", response: "30"},
                {icon: "calendar_month", title: "Last 1.5 Months", description: "View 45 days worth of data", response: "45"},
                {icon: "calendar_month", title: "Last 2 Months", description: "View 60 days worth of data", response: "60"},
                {icon: "calendar_month", title: "Last 3 Months", description: "View 90 days worth of data", response: "90"},
                {icon: "calendar_month", title: "Last 6 Months", description: "View 120 days worth of data", response: "120"},
            ];
            const bs: MatBottomSheetRef = this._nav.displayBottomSheetMenu(menu.filter((mi) => Number(mi.response) != this.displayDays));
            bs.afterDismissed().subscribe(async (response: string|undefined) => {
                if (response) {
                    this.loaded = false;
                    this.displayDays = Number(response);
                    await this.loadCandlesticks(this.displayDays);
                    this.loaded = true;
                }
            });
        }

    }






    /**
     * Loads the candlesticks data based on a given number of days.
     * @param days 
     * @returns Promise<void>
     */
    private async loadCandlesticks(days: number): Promise<void> {
        try {
            // Retrieve the candlesticks
            const endAt: number = this.epoch!.uninstalled ? this.epoch!.uninstalled: this._app.serverTime.value!
            this.candlesticks = await this._localDB.listPredictionCandlesticks(
                this.epoch!.id, 
                moment(endAt).subtract(days, "days").valueOf(),
                endAt,
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
            this.candlesticksChart = this._chart.getCandlestickChartOptions(
                this.candlesticks, 
                annotations, 
                false, 
                false, 
                //{min: minValue, max: maxValue}
            );
            this.candlesticksChart.chart!.height = this.layout == "desktop" ? 600: 400;
            this.candlesticksChart.chart!.zoom = {enabled: true, type: "xy"};
            const self = this;
            this.candlesticksChart.chart!.events = {
                click: function(event, chartContext, config) {
                    if (self.candlesticks![config.dataPointIndex]) self.displayPredictionCandlestick(self.candlesticks![config.dataPointIndex]);
                }
            }
        } catch(e) { this._app.error(e) } 
    }

















    /* Prediction Candlestick */




    /**
     * Displays the prediction candlestick dialog.
     * @param candlestick 
     */
    private displayPredictionCandlestick(candlestick: IPredictionCandlestick): void {
        this.dialog.open(EpochPredictionCandlestickDialogComponent, {
			disableClose: false,
			hasBackdrop: this._app.layout.value != "mobile", // Mobile optimization
			panelClass: "small-dialog",
            data: <IPredictionCandlestickDialogData> {
                candlestick: candlestick,
                epoch: this.epoch!
            }
		})
    }
}
