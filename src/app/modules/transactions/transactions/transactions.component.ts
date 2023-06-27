import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import * as moment from "moment";
import { MatDialog } from "@angular/material/dialog";
import { IAccountIncomeRecord, IAccountIncomeType, ICandlestick, TransactionService, UtilsService } from '../../../core';
import { AppService, ChartService, ICandlestickChartOptions, ILayout, NavService } from "../../../services";
import { IDateRangeConfig } from '../../../shared/components/date-range-form-dialog';
import { IIncomeChartIntervalID } from './interfaces';
import { ITransactionListDialogConfig, TransactionListDialogComponent } from './transaction-list-dialog';

@Component({
  selector: 'app-transactions',
  templateUrl: './transactions.component.html',
  styleUrls: ['./transactions.component.scss']
})
export class TransactionsComponent implements OnInit, TransactionsComponent {
	// Layout
	public layout: ILayout = this._app.layout.value;
	private layoutSub?: Subscription;

    // Date Range
	public activeRange!: IDateRangeConfig;

    // Income Records
    public incomeRecords: IAccountIncomeRecord[] = [];
    public realizedPNLRecords: IAccountIncomeRecord[] = [];
    public commissionRecords: IAccountIncomeRecord[] = [];
    public fundingFeeRecords: IAccountIncomeRecord[] = [];

    // Income Totals
    public incomeTotal: number = 0;
    public realizedPNLTotal: number = 0;
    public commissionTotal: number = 0;
    public fundingFeeTotal: number = 0;

    // Income Charts
    public chartIntervals: IIncomeChartIntervalID[] = ["1h", "2h", "4h", "8h", "12h", "24h"];
    public chartInterval: IIncomeChartIntervalID = "1h";
    public incomeChart!: ICandlestickChartOptions;
    public realizedPNLChart!: ICandlestickChartOptions;
    public commissionChart!: ICandlestickChartOptions;
    public fundingFeeChart!: ICandlestickChartOptions;

	// Load State
	public loaded: boolean = false;

    constructor(
        public _nav: NavService,
        private _chart: ChartService,
        private _app: AppService,
        private _tx: TransactionService,
        private dialog: MatDialog,
        private _utils: UtilsService
    ) { }

    ngOnInit(): void {
        // Initialize layout
        this.layoutSub = this._app.layout.subscribe((nl: ILayout) => this.layout = nl);

        // Initialize the active range
        const ts: number = this._app.serverTime.value || Date.now();
        this.setCustomDateRange({
            startAt: moment(ts).subtract(15, "days").valueOf(),
            endAt: ts
        });
    }


    ngOnDestroy(): void {
        if (this.layoutSub) this.layoutSub.unsubscribe();
    }








    /**
     * Sets a date range and initializes the income insights entirely.
     * @param range 
     * @returns Promise<void>
     */
    public async setCustomDateRange(range?: IDateRangeConfig): Promise<void> {
        // If the range has been provided, update the property and build the insights
        if (range) { 
            this.activeRange = range;
        }

        // Otherwise, display the form
        else {
            // Calculate the range of the query
			const newRange: IDateRangeConfig|undefined = await this._nav.calculateDateRange(this.activeRange);

			// If a new range was set, update the local property
			if (newRange) {
				this.activeRange = newRange;
			} else {
				return;
			}
        }

        // Build the insights
        await this.buildIncomeInsights();
    }








    /**
     * Builds the income insights for a pre-set date range.
     * @returns Promise<void>
     */
    private async buildIncomeInsights(): Promise<void> {
        // Initialize loading state
        this.loaded = false;

        // Initialize the build
        try {
            // Retrieve income records from the server
            this.incomeRecords = await this._tx.listIncomeRecords(this.activeRange.startAt, this.activeRange.endAt);

            // Reset local properties
            this.resetInsight();

            // Iterate over each income record, separating them by type as well as calculating the totals
            for (let income of this.incomeRecords) {
                if (income.it == "REALIZED_PNL")   { 
                    this.realizedPNLRecords.push(income);
                    this.realizedPNLTotal += income.v;
                } else if (income.it == "COMMISSION") { 
                    this.commissionRecords.push(income);
                    this.commissionTotal += income.v;
                } else if (income.it == "FUNDING_FEE") { 
                    this.fundingFeeRecords.push(income);
                    this.fundingFeeTotal += income.v;
                }
                this.incomeTotal += income.v;
            }

            // Finally, build the income charts
            this.buildIncomeCharts(this.chartInterval);
        } catch (e) { this._app.error(e) }

        // Update loading state
        this.loaded = true;
    }







    /**
     * Builds the income charts as well as the totals based
     * on a given interval
     * @param interval 
     */
    public buildIncomeCharts(interval: IIncomeChartIntervalID): void {
        // Set the interval and the minutes that will be used to calculate each candlestick
        this.chartInterval = interval;

        // Build the candlesticks
        this.incomeChart = this._chart.getCandlestickChartOptions(
            this.buildCandlesticks(this.incomeRecords), 
            undefined, false, true, undefined, 400
        );
        this.incomeChart.chart.zoom = {enabled: false};
        this.realizedPNLChart = this._chart.getCandlestickChartOptions(
            this.buildCandlesticks(this.realizedPNLRecords), 
            undefined, false, true, undefined, 400
        );
        this.realizedPNLChart.chart.zoom = {enabled: false};
        this.commissionChart = this._chart.getCandlestickChartOptions(
            this.buildCandlesticks(this.commissionRecords), 
            undefined, false, true, undefined, 400
        );
        this.commissionChart.chart.zoom = {enabled: false};
        this.fundingFeeChart = this._chart.getCandlestickChartOptions(
            this.buildCandlesticks(this.fundingFeeRecords), 
            undefined, false, true, undefined, 400
        );
        this.fundingFeeChart.chart.zoom = {enabled: false};
    }






    /**
     * Builds the candlesticks history based on a given income type.
     * @param records 
     * @returns ICandlestick[]
     */
    private buildCandlesticks(records: IAccountIncomeRecord[]): ICandlestick[] {
        // Only proceed if there are records
        if (this.incomeRecords.length && records.length) {
            // Init the minutes per candlestick
            const intervalMins: number = this.fromIntervalIDToMinutes(this.chartInterval);

            // Init the list
            let candlesticks: ICandlestick[] = [];

            // Init the accumulator
            let accum: number = 0;

            // Init the first interval
            let ot: number = this.incomeRecords[0].t;
            let ct: number = moment(ot).add(intervalMins, "minutes").valueOf();

            // Build the candlesticks one by one
            const histEnd: number = this.calculateHistEnd();
            while (ot <= histEnd) {
                // Build the candlestick
                const newCandlestick: ICandlestick = this.buildCandlestickForInterval(
                    accum,
                    ot,
                    ct,
                    records.filter((r) => r.t >= ot && r.t <= ct)
                );

                // Append the candlestick to the list and update the accumulator
                candlesticks.push(newCandlestick);
                accum = newCandlestick.c;

                // The close time becomes the new open
                ot = ct;
                ct = moment(ot).add(intervalMins, "minutes").valueOf();
            }

            // Finally, return the list
            return candlesticks;
        } else { return [ ] }
    } 












    /* Misc Helpers */


    


    /**
     * Resets the insight local properties prior to loading
     * a new date range.
     */
    private resetInsight(): void {
        this.realizedPNLRecords = [];
        this.commissionRecords = [];
        this.fundingFeeRecords = [];
        this.incomeTotal = 0;
        this.realizedPNLTotal = 0;
        this.commissionTotal = 0;
        this.fundingFeeTotal = 0;
    }






    /**
     * Converts an interval ID into minutes.
     * @param interval 
     * @returns number
     */
    private fromIntervalIDToMinutes(interval: IIncomeChartIntervalID): number {
        switch (interval) {
            case "1h":
                return 60;
            case "2h":
                return 120;
            case "4h":
                return 240;
            case "8h":
                return 480;
            case "12h":
                return 720;
            case "24h":
                return 1440;
            default:
                throw new Error(`The interval ${interval} is invalid.`);
        }
    }






    /**
     * Calculates the end of the income history candlesticks
     * based on the latest time between the date range and the
     * last income record.
     * @returns number
     */
    private calculateHistEnd(): number {
        return this.activeRange.endAt > this.incomeRecords[this.incomeRecords.length - 1].t ? 
            this.activeRange.endAt: this.incomeRecords[this.incomeRecords.length - 1].t;
    }





    /**
     * Builds a candlestick for a single interval based on all the records
     * within the range.
     * @param accum 
     * @param openTime 
     * @param closeTime 
     * @param records 
     * @returns ICandlestick
     */
    private buildCandlestickForInterval(
        accum: number, 
        openTime: number, 
        closeTime: number,
        records: IAccountIncomeRecord[]
    ): ICandlestick {
        // Init the values
        const open: number = accum;
        let high: number = accum;
        let low: number = accum;

        // Iterate over each record and update the values
        for (let rec of records) {
            // Update the accumulator
            accum += rec.v;

            // Update the high if applies
            high = accum > high ? accum: high;

            // Update the low if applies
            low = accum < low ? accum: low;
        }

        // Finally, return the candlestick
        return {
            ot: openTime,
            ct: closeTime,
            o: <number>this._utils.outputNumber(open, {dp: 3, ru: true}),
            h: <number>this._utils.outputNumber(high, {dp: 3, ru: true}),
            l: <number>this._utils.outputNumber(low, {dp: 3, ru: true}),
            c: <number>this._utils.outputNumber(accum, {dp: 3, ru: true}),
            v: 0
        }
    }











    /*******************
     * General Actions *
     *******************/





    /**
     * Displays the position headlines for the active date range.
     */
    public displayPositionHeadlines(): void {
        this._nav.displayPositionHeadlinesDialog(this.activeRange);
    }







    /**
     * Syncs the income records if the action is confirmed.
     * @returns Promise<void>
     */
    public async syncIncome(): Promise<void> {
        this._nav.displayConfirmationDialog({
            title: `Sync Income`,
            content: `
                <p class='align-center'>
                    If you confirm the action, the income records will be synced via Binance's API. 
                </p>
                <p class='align-center light-text ts-s'>
                    Take into consideration that the process may take ~5 minutes.
                </p>
            `,
            otpConfirmation: true
        }).afterClosed().subscribe(
            async (otp: string|undefined) => {
                if (otp) {
                    try {
                        // Perform Action
                        await this._tx.syncIncome(otp);

                        // Notify
                        this._app.success(`The income is being synced and should finish in about 5 minutes.`);
                    } catch(e) { this._app.error(e) }
                }
            }
        );
    }








    /**
     * Displays the income records dialogs based on an income type. If none 
     * is provided, it will display the entire income list.
     * @param incomeType?
     */
    public displayIncomeRecords(incomeType?: IAccountIncomeType): void {
        // Select the records that will be passed
        let records: IAccountIncomeRecord[] = [];
        if (incomeType == "REALIZED_PNL") {
            records = this.realizedPNLRecords.slice();
        } else if (incomeType == "COMMISSION") {
            records = this.commissionRecords.slice();
        } else if (incomeType == "FUNDING_FEE") {
            records = this.fundingFeeRecords.slice();
        } else {
            records = this.incomeRecords.slice();
        }

        // Display the dialog
		this.dialog.open(TransactionListDialogComponent, {
			hasBackdrop: this._app.layout.value != "mobile", // Mobile optimization
			panelClass: "medium-dialog",
			data: <ITransactionListDialogConfig>{
                incomeType: incomeType,
                records: records
            }
		})
    }
}
