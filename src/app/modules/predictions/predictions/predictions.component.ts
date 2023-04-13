import { Component, OnInit, OnDestroy } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { MatDialog } from "@angular/material/dialog";
import { Subscription } from "rxjs";
import { ApexAnnotations, YAxisAnnotations } from "ng-apexcharts";
import * as moment from "moment";
import { 
    EpochService,
    IEpochRecord, 
    IPredictionCandlestick, 
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
import { IPredictionsComponent, IPredsHistoryRange, IPredsHistoryRangeID } from "./interfaces";
import { IDateRangeConfig } from "src/app/shared/components/date-range-form-dialog";

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
    public histMenu: IPredsHistoryRange[] = [
		{id: "24h", name: "Last 24 hours"},
		{id: "48h", name: "Last 48 hours"},
		{id: "72h", name: "Last 72 hours"},
		{id: "1w", name: "Last week"},
		{id: "2w", name: "Last 2 weeks"},
		{id: "1m", name: "Last month"},
		{id: "3m", name: "Last 3 months"},
		{id: "custom", name: "Custom Date Range"},
	];
    public activeHistMenuItem: IPredsHistoryRange = this.histMenu[0];
    private activeRange!: IDateRangeConfig;
    public candlesticksChart?: ICandlestickChartOptions;

    // Initialization State
    public initializing: boolean = false;
    public initialized: boolean = false;

    // Epoch Data Loading State
    public loaded: boolean = false;
    
    constructor(
        public _nav: NavService,
        public _app: AppService,
        private _validations: ValidationsService,
        private route: ActivatedRoute,
        private _chart: ChartService,
        public _prediction: PredictionService,
        private dialog: MatDialog,
        private _epoch: EpochService
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
                epochSummary = await this._epoch.getEpochRecord(<string>epochID);
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
        await this.loadCandlesticks(this.histMenu[0]);

        // Set the loading state
        this.loaded = true;
    }








    /* View Management */








    /**
     * Loads the candlesticks data based on a given range.
     * @param range
     * @returns Promise<void>
     */
    public async loadCandlesticks(range: IPredsHistoryRange): Promise<void> {
        // Calculate the date range
        const dateRange: IDateRangeConfig|undefined = await this.calculateDateRange(range.id);

        // Only proceed if a date range was derived
        if (dateRange) {
            try {
                this.loaded = false;
                // Retrieve the candlesticks
                this.candlesticks = await this._prediction.listPredictionCandlesticks(
                    this.epoch!.id, 
                    dateRange.startAt,
                    dateRange.endAt
                );

                // Build the chart
                this.candlesticksChart = this._chart.getCandlestickChartOptions(
                    this.candlesticks, 
                    {
                        yaxis: [
                            // Uptrend backgrounds
                            this.buildTrendSumAnnotation(0, 1, "#E0F2F1"),
                            this.buildTrendSumAnnotation(1, 2, "#80CBC4"),
                            this.buildTrendSumAnnotation(2, 3, "#4DB6AC"),
                            this.buildTrendSumAnnotation(3, 4, "#26A69A"),
                            this.buildTrendSumAnnotation(4, 5, "#009688"),
                            this.buildTrendSumAnnotation(5, 6, "#00897B"),
                            this.buildTrendSumAnnotation(6, 7, "#00796B"),
                            this.buildTrendSumAnnotation(7, 8, "#004D40"),
    
                            // Downtrend Backgrounds
                            this.buildTrendSumAnnotation(0, -1, "#FFEBEE"),
                            this.buildTrendSumAnnotation(-1, -2, "#EF9A9A"),
                            this.buildTrendSumAnnotation(-2, -3, "#E57373"),
                            this.buildTrendSumAnnotation(-3, -4, "#EF5350"),
                            this.buildTrendSumAnnotation(-4, -5, "#F44336"),
                            this.buildTrendSumAnnotation(-5, -6, "#E53935"),
                            this.buildTrendSumAnnotation(-6, -7, "#D32F2F"),
                            this.buildTrendSumAnnotation(-7, -8, "#B71C1C")
                        ]
                    }
                );
                this.candlesticksChart.chart!.height = this.layout == "desktop" ? 600: 400;
                this.candlesticksChart.chart!.zoom = {enabled: true, type: "xy"};
                const self = this;
                this.candlesticksChart.chart!.events = {
                    click: function(event, chartContext, config) {
                        if (self.candlesticks![config.dataPointIndex]) self.displayPredictionCandlestick(self.candlesticks![config.dataPointIndex]);
                    }
                }

                // Set the current range
                this.activeHistMenuItem = range;
                this.activeRange = dateRange;
            } catch (e) {
                this._app.error(e);
            }
            this.loaded = true;
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
	 * Calculates the date range of the history based
	 * on the range id.
	 * @param id
	 * @returns {startAt: number, endAt: number}
	 */
	private calculateDateRange(id: IPredsHistoryRangeID): Promise<IDateRangeConfig|undefined> { 
		return new Promise((resolve, reject) => {
			// Init the end
			const endAt: number = this.epoch!.uninstalled ? this.epoch!.uninstalled: this._app.serverTime.value!

			// Handle a custom date range
			if (id == "custom") {
				this._nav.displayDateRangeDialog(this.activeRange).afterClosed().subscribe(
					(response) => {
						if (response) {
							resolve(response);
						} else {
							resolve(undefined)
						}
					}
				);
			} else {
				// Init values
				let startAt: number;

				// Calculate the starting point
				if 		(id == "24h") { startAt = moment(endAt).subtract(24, "hours").valueOf() }
				else if (id == "48h") { startAt = moment(endAt).subtract(48, "hours").valueOf() }
				else if (id == "72h") { startAt = moment(endAt).subtract(72, "hours").valueOf() }
				else if (id == "1w") { startAt = moment(endAt).subtract(1, "week").valueOf() }
				else if (id == "2w") { startAt = moment(endAt).subtract(2, "weeks").valueOf() }
				else if (id == "1m") { startAt = moment(endAt).subtract(1, "month").valueOf() }
				else if (id == "3m") { startAt = moment(endAt).subtract(3, "months").valueOf() }
				else { throw new Error("Invalid History Range ID.") }


				// Finally, return the range
				resolve({startAt: startAt, endAt: endAt});
			}
		});
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
