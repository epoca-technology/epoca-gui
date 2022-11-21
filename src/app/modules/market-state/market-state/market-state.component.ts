import { Component, OnDestroy, OnInit } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import {Title} from "@angular/platform-browser";
import { Subscription } from "rxjs";
import * as moment from "moment";
import {BigNumber} from "bignumber.js";
import { ApexAnnotations, ApexAxisChartSeries } from "ng-apexcharts";
import { 
    IEpochRecord, 
    IKeyZone, 
    IMarketState, 
    IPrediction, 
    IPredictionState, 
    LocalDatabaseService, 
    PredictionService, 
    UtilsService 
} from "../../../core";
import { 
    AppService, 
    ChartService, 
    ICandlestickChartOptions, 
    ILayout, 
    ILineChartOptions, 
    NavService 
} from "../../../services";
import { FeaturesSumDialogComponent, IFeaturesSumDialogData } from "../../../shared/components/epoch-builder";
import { KeyzoneStateDialogComponent, IKeyZonesStateDialogData } from "./keyzone-state-dialog";
import { IMarketStateComponent } from "./interfaces";

@Component({
  selector: "app-market-state",
  templateUrl: "./market-state.component.html",
  styleUrls: ["./market-state.component.scss"]
})
export class MarketStateComponent implements OnInit, OnDestroy, IMarketStateComponent {
    // Layout
	public layout: ILayout = this._app.layout.value;
	private layoutSub?: Subscription;

    // Prediction Lists
    public epoch?: IEpochRecord;
    public activePrediction?: IPrediction;
    public activeSum?: number;
    public predictions: IPrediction[] = [];
    private predictionSub!: Subscription;
    private predictionsLoaded: boolean = false;

    // Prediction Charts
    public predictionsChart?: ILineChartOptions;
    public splitPredictionsChart?: ILineChartOptions;
    public displaySplitPredictions: boolean = false;

    // State
    public state!: IMarketState;
    private stateSub!: Subscription;
    private stateLoaded: boolean = false;

    // Window Chart
    public windowChart?: ICandlestickChartOptions;

    // Volume State Chart
    public volumeChart?: ILineChartOptions;

    // Network Fees State Chart
    public networkFeeChart?: ILineChartOptions;

    // Loading State
    public loaded: boolean = false;

    constructor(
        public _nav: NavService,
        private _localDB: LocalDatabaseService,
        private _app: AppService,
        private dialog: MatDialog,
        private _chart: ChartService,
        private titleService: Title,
        public _prediction: PredictionService,
        private _utils: UtilsService
    ) { }

    ngOnInit(): void {
        // Initialize layout
        this.layoutSub = this._app.layout.subscribe((nl: ILayout) => this.layout = nl);

        // Subscribe to the active prediction
        this.predictionSub = this._app.prediction.subscribe(
            async (pred: IPrediction|null|undefined) => {
                // Make sure the predictions have been initialized
                if (pred !== null) {
                    if (pred) { 
                        // Populate the active epoch
                        this.epoch = this._app.epoch.value!;

                        // Load the predictions in case they haven't been
                        if (!this.predictions.length) {
                            let endAt: number = this._app.serverTime.value ? this._app.serverTime.value: moment().valueOf();
                            let startAt: number = moment(endAt).subtract(3, "hours").valueOf();
                            this.predictions = await this._localDB.listPredictions(
                                this.epoch!.id,
                                startAt,
                                endAt,
                                this.epoch!.installed
                            );
                            this.onNewPrediction(this.predictions[this.predictions.length - 1]);
                        }

                        // If it is an actual new prediction, add it to the list
                        if (this.activePrediction && pred.t != this.activePrediction.t) this.onNewPrediction(pred);

                        // Populate the prediction
                        //this.activePrediction = pred;
                    }

                    // Set loading state
                    this.predictionsLoaded = true;
                    this.checkLoadState();
                }

            }
        )

        // Subscribe to the market state
        this.stateSub = this._app.marketState.subscribe((state: IMarketState|undefined|null) => {
            if (state) {
                // Update the local state
                this.state = state;

                // Update charts
                this.onStateUpdate();

                // Set loading state
                this.stateLoaded = true;
                this.checkLoadState();
            }
        });
    }

    ngOnDestroy(): void {
        if (this.layoutSub) this.layoutSub.unsubscribe();
        if (this.predictionSub) this.predictionSub.unsubscribe();
        if (this.stateSub) this.stateSub.unsubscribe();
        this.titleService.setTitle("Epoca");
    }





    /* New Prediction Event Handler */





    /**
     * Triggers whenever there is a change in the data and builds
     * all the required data.
     */
     private onNewPrediction(pred: IPrediction): void {
        // Calculate the active sum
        this.activeSum = <number>this._utils.getSum(pred.f, {dp: 8});

        // Add the new prediction
        this.predictions.push(pred);
        this.activePrediction = pred;

        // Update the prediction chart
        this.updatePredictionChart();

        // Update the split prediction chart
        this.updateSplitPredictionChart();
    }




    /**
     * Triggers whenever a new prediction comes into existance. Builds or
     * updates the chart accordingly.
     */
    private updatePredictionChart(): void {
        // Init the color of the prediction sum line
        let predLineColor: string = this._chart.neutralColor;
        if (this.predictions[0].s >= this.epoch!.model.min_increase_sum) {
            predLineColor = this._chart.upwardColor;
        } else if (this.predictions[0].s <= this.epoch!.model.min_decrease_sum) {
            predLineColor = this._chart.downwardColor;
        }

        // Init the min and max values
        const minValue: number = -this.epoch!.model.regressions.length;
        const maxValue: number = this.epoch!.model.regressions.length;

        // Build the annotations
        const { markerSize, markerColor } = this.getPointAnnotationData();
        const annotations: ApexAnnotations = {
            yaxis: [
                {
                    y: this.epoch!.model.min_increase_sum,
                    y2: maxValue,
                    borderColor: this._chart.upwardColor,
                    fillColor: this._chart.upwardColor,
                    strokeDashArray: 0
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
            ],
            points: [
                {
                    x: this.predictions[this.predictions.length - 1].t,
                    y: this.predictions[this.predictions.length - 1].s,
                    marker: {
                        size: markerSize,
                        strokeColor: markerColor,
                        strokeWidth: markerSize,
                        shape: "circle", // circle|square
                        offsetX: -5
                    }
                }
            ]
        };

        // Build/Update the chart
        if (this.predictionsChart) {
            // Update the series
            this.predictionsChart.series = [
                {
                    name: "Prediction Sum", 
                    data: this.predictions.map((p) => { return {x: p.t, y: p.s } }), 
                    color: predLineColor
                }
            ]

            // Update the current point
            this.predictionsChart.annotations = annotations;
        } else {
            // Create the chart from scratch
            this.predictionsChart = this._chart.getLineChartOptions(
                { 
                    series: [
                        {
                            name: "Prediction Sum", 
                            data: this.predictions.map((p) =>  { return {x: p.t, y: p.s } }), 
                            color: predLineColor
                        }
                    ],
                    stroke: {curve: "straight", width:5},
                    annotations: annotations,
                    xaxis: {type: "datetime",tooltip: {enabled: true}, labels: {datetimeUTC: false}}, 
                },
                this.layout == "desktop" ? 350: 330, 
                true,
                {min: minValue, max: maxValue}
            );
        }
    }




    /**
     * Builds the metadata that will be used to populate the monitor's
     * point annotation.
     * @returns {markerSize: number,markerColor: string}
     */
    private getPointAnnotationData(): {markerSize: number, markerColor: string} {
        // Init values
        let markerSize: number = 3.5; // Min size
        let markerColor: string = this._chart.neutralColor;

        // Check if the active epoch is the one being visualized
        if (this._app.epoch.value && this._app.epoch.value.id == this.epoch!.id) {
            // Init the state
            const state: IPredictionState = this._app.predictionState.value!;

            // Init the marker color
            if (state > 0) { markerColor = this._chart.upwardColor }
            else if (state < 0) { markerColor = this._chart.downwardColor }

            // Init the marker size
            markerSize = this.getMarkerSize(state);
        }

        // Finally, return the data
        return { markerSize: markerSize, markerColor: markerColor }
    }




    /**
     * Calculates the suggested marker size based on the absolute state 
     * value.
     * @param state 
     * @returns number
     */
    private getMarkerSize(state: IPredictionState): number {
        const absState: number = state < 0 ? -(state): state;
        if      (absState >= 9)    { return 9 }
        else if (absState == 8)    { return 8 }
        else if (absState == 7)    { return 7 }
        else if (absState == 6)    { return 6.5 }
        else if (absState == 5)    { return 6 }
        else if (absState == 4)    { return 5.5 }
        else if (absState == 3)    { return 5 }
        else if (absState == 2)    { return 4.5 }
        else if (absState == 1)    { return 4 }
        else                       { return 3.5 }
    }





    /**
     * Triggers whenever a new prediction comes into existance. Builds or
     * updates the chart accordingly.
     */
     private updateSplitPredictionChart(): void {
        // Init the series
        let series: ApexAxisChartSeries = [];

        // Build the list of features
        const features: Array<{x: number, y: number[]}> = this.predictions.map((p) => { return { x: p.t, y: p.f} });

        // Build the color list based on their active predictions
        const colors: string[] = this.activePrediction!.f.map((f) => {
            if (f >= 0.5) { return this._chart.upwardColor }
            else if (f <= -0.5) { return this._chart.downwardColor }
            else { return this._chart.neutralColor}
        });

        // Iterate over each regression and populate the values
        for (let i = 0; i < this.epoch!.model.regressions.length; i++) {
            series.push({
                name: this.epoch!.model.regressions[i].id.slice(0, 12) + "...",
                data: features.map((f) => { return {x: f.x, y: f.y[i]}}),
                color: colors[i]
            });
        }

        // Build/Update the chart
        if (this.splitPredictionsChart) {
            // Update the series
            this.splitPredictionsChart.series = series;
        } else {
            // Build the annotations
            const annotations: ApexAnnotations = {
                yaxis: [
                    {
                        y: 0.500000,
                        y2: 1.000000,
                        borderColor: this._chart.upwardColor,
                        fillColor: this._chart.upwardColor,
                        strokeDashArray: 0
                    },
                    {
                        y: 0.000001,
                        y2: 0.499999,
                        borderColor: "#B2DFDB",
                        fillColor: "#B2DFDB",
                        strokeDashArray: 0
                    },
                    {
                        y: -0.500000,
                        y2: -1.000000,
                        borderColor: this._chart.downwardColor,
                        fillColor: this._chart.downwardColor,
                        strokeDashArray: 0
                    },
                    {
                        y: -0.000001,
                        y2: -0.499999,
                        borderColor: "#FFCDD2",
                        fillColor: "#FFCDD2",
                        strokeDashArray: 0
                    }
                ]
            };

            // Create the chart from scratch
            this.splitPredictionsChart = this._chart.getLineChartOptions(
                { 
                    series: series,
                    stroke: {curve: "straight", width:3},
                    annotations: annotations,
                    xaxis: {type: "datetime",tooltip: {enabled: true}, labels: {datetimeUTC: false}}, 
                },
                this.layout == "desktop" ? 350: 330, 
                true,
                {min: -1, max: 1}
            );
        }
    }











    /* State Update Event Handler */



    /**
     * Whenever a new state is retrieved, it builds all the required charts.
     */
    private onStateUpdate(): void {
        // Update the window state chart
        this.updateWindowState();

        // Update the volume state chart
        this.updateVolumeState();

        // Update the network fee state chart
        this.updateNetworkFeeState();

        // Update the title
        const price: string = <string>this._utils.outputNumber(
            this.state.window.window[this.state.window.window.length - 1].c, 
            {dp: 0, of: "s"}
        );
        if (this.activeSum) {
            this.titleService.setTitle(`$${price}: ${this._utils.outputNumber(this.activeSum, {dp: 1})}`);
        } else {
            this.titleService.setTitle(`$${price}`);
        }
    }




    /**
     * Triggers whenever a new state is downloaded and builds the window chart.
     */
    private updateWindowState(): void {
        // Calculate the min and max values
        const minVal: number = this.state.window.lower_band.end < this.state.keyzone.below[0].s ? 
            this.state.window.lower_band.end: this.state.keyzone.below[0].s;
        const maxVal: number = this.state.window.upper_band.end > this.state.keyzone.above[0].e ? 
            this.state.window.upper_band.end: this.state.keyzone.above[0].e;

        // Build/update the chart
        if (this.windowChart) {
            // Update the range
            this.windowChart.yaxis = { tooltip: { enabled: true }, forceNiceScale: false, min: minVal, max: maxVal};

            // Update the series
            this.windowChart.series = [
                {
                    name: "candle",
                    data: this._chart.getApexCandlesticks(this.state.window.window)
                }
            ];

            // Update the annotations
            this.windowChart.annotations = this.buildWindowAnnotations();
        } else {
            this.windowChart = this._chart.getCandlestickChartOptions(
                this.state.window.window, 
                this.buildWindowAnnotations(), 
                false, 
                true,
                { min:  minVal, max: maxVal }
            );
            this.windowChart.chart!.height = this.layout == "desktop" ? 599: 400;
            this.windowChart.chart!.zoom = {enabled: true, type: "xy"};
        }
    }



    /**
     * Builds the annotations for the keyzones and any other element
     * that may require it.
     * @returns ApexAnnotations
     */
    private buildWindowAnnotations(): ApexAnnotations {
        // Init the annotations
        let annotations: ApexAnnotations = { yaxis: [] };

        // Init the colors
        const resistanceColor: string = this._chart.upwardColor;
        const supportcolor: string = this._chart.downwardColor;

        // Iterate over the keyzones above
        for (let i = 0; i < this.state.keyzone.above.length; i++) {
            annotations.yaxis!.push({
				y: this.state.keyzone.above[i].s,
				y2: this.state.keyzone.above[i].e,
				strokeDashArray: 0,
				borderColor: resistanceColor,
				fillColor: resistanceColor
			})
        }

        // Check if there is an active zone
        if (this.state.keyzone.active) {
            annotations.yaxis!.push({
				y: this.state.keyzone.active.s,
				y2: this.state.keyzone.active.e,
				strokeDashArray: 0,
				borderColor: "#000000",
				fillColor: "#000000",
				label: {
					borderColor: "#000000",
					style: { color: "#fff", background: "#000000",},
					text: this.getKeyZoneLabelText(this.state.keyzone.active),
					position: "left",
					offsetX: 145
				}
			})
        }


        // Iterate over the keyzones below
        for (let i = 0; i < this.state.keyzone.below.length; i++) {
            annotations.yaxis!.push({
				y: this.state.keyzone.below[i].s,
				y2: this.state.keyzone.below[i].e,
				strokeDashArray: 0,
				borderColor: supportcolor,
				fillColor: supportcolor
			})
        }

        // Finally, return the annotations
        return annotations;
    }


	/**
	 * Returns a label for a given zone.
	 * @param zone 
	 * @returns string
	 */
     private getKeyZoneLabelText(zone: IKeyZone): string {
		if (this.layout == "mobile") return ''; 
		let label: string = "";
        let zoneState: "R"|"S"|"M" = "M";
        if (!zone.m) {
            zoneState = zone.r[0].t == "r" ? "R": "S";
        }
		label += `$${new BigNumber(zone.s).toFormat(2)} - $${new BigNumber(zone.e).toFormat(2)} | ${zoneState}${zone.r.length}`;
		return label;
	}







    /**
     * Triggers whenever a new state is downloaded and builds the volume chart.
     */
     private updateVolumeState(): void {
        // Init the color of the prediction sum line
        let lineColor: string = this._chart.neutralColor;
        if (this.state.volume.state == "increasing") {
            lineColor = this._chart.upwardColor;
        } else if (this.state.volume.state == "decreasing") {
            lineColor = this._chart.downwardColor;
        }

        // Build/Update the chart
        if (this.volumeChart) {
            // Update the series
            this.volumeChart.series = [
                {
                    name: "USDT Volume Mean", 
                    data: this.state.volume.volumes, 
                    color: lineColor
                }
            ]
        } else {
            // Create the chart from scratch
            this.volumeChart = this._chart.getLineChartOptions(
                { 
                    series: [
                        {
                            name: "USDT Volume Mean", 
                            data: this.state.volume.volumes, 
                            color: lineColor
                        }
                    ],
                    stroke: {curve: "smooth", width:5},
                },
                this.layout == "desktop" ? 150: 150, 
                false
            );
            this.volumeChart.yaxis.labels = {show: false}
            this.volumeChart.xaxis.axisTicks = {show: false}
            this.volumeChart.xaxis.axisBorder = {show: false}
        }
    }





    /**
     * Triggers whenever a new state is downloaded and builds the network fee chart.
     */
     private updateNetworkFeeState(): void {
        // Init the color of the prediction sum line
        let lineColor: string = this._chart.neutralColor;
        if (this.state.network_fee.state == "increasing") {
            lineColor = this._chart.upwardColor;
        } else if (this.state.network_fee.state == "decreasing") {
            lineColor = this._chart.downwardColor;
        }

        // Build/Update the chart
        if (this.networkFeeChart) {
            // Update the series
            this.networkFeeChart.series = [
                {
                    name: "Sats per byte", 
                    data: this.state.network_fee.fees, 
                    color: lineColor
                }
            ]
        } else {
            // Create the chart from scratch
            this.networkFeeChart = this._chart.getLineChartOptions(
                { 
                    series: [
                        {
                            name: "Sats per byte", 
                            data: this.state.network_fee.fees, 
                            color: lineColor
                        }
                    ],
                    stroke: {curve: "smooth", width:5},
                },
                this.layout == "desktop" ? 150: 150, 
                false,
            );
            this.networkFeeChart.yaxis.labels = {show: false}
            this.networkFeeChart.xaxis.axisTicks = {show: false}
            this.networkFeeChart.xaxis.axisBorder = {show: false}
        }
    }










    /* Misc Helpers */



    
	/**
	 * Displays the features dedicated dialog to gather more information
	 * about the prediction.
	 */
     public displayFeaturesDialog(): void {
		this.dialog.open(FeaturesSumDialogComponent, {
			hasBackdrop: this._app.layout.value != "mobile", // Mobile optimization
			panelClass: "small-dialog",
				data: <IFeaturesSumDialogData>{
					sum: this.activeSum,
					features: this.activePrediction!.f,
					result: this.activePrediction!.r,
					model: this.epoch!.model
				}
		})
	}




    /**
     * Displays the keyzone state dialog.
     */
    public displayKeyZoneDialog(): void {
		this.dialog.open(KeyzoneStateDialogComponent, {
			hasBackdrop: this._app.layout.value != "mobile", // Mobile optimization
			panelClass: "large-dialog",
			data: <IKeyZonesStateDialogData> {
                state: this.state.keyzone,
                currentPrice: this.state.window.window[this.state.window.window.length - 1].c
            }
		})
    }




    

    /**
     * Checks if all the required data has been loaded.
     */
    private checkLoadState(): void {
        this.loaded = this.predictionsLoaded && this.stateLoaded;
    }
}