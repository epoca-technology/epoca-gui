import { IAccountIncomeType } from "../../../core";
import { IDateRangeConfig } from "../../../shared/components/date-range-form-dialog";


export interface ITransactionsComponent {
    setCustomDateRange(range?: IDateRangeConfig): Promise<void>,
    buildIncomeCharts(interval: IIncomeChartIntervalID): void,
    displayPositionHeadlines(): void,
    syncIncome(): Promise<void>,
    displayIncomeRecords(incomeType?: IAccountIncomeType): void
}






export type IIncomeChartIntervalID = "1h"|"2h"|"4h"|"8h"|"12h"|"24h";