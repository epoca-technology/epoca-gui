import { IAccountIncomeRecord, IAccountIncomeType } from "../../../../core";



export interface ITransactionListDialogComponent {
    displayRecord(record: IExtendedAccountIncomeRecord): void,
    close(): void
}




export interface ITransactionListDialogConfig {
    incomeType: IAccountIncomeType|undefined,
    records: IAccountIncomeRecord[]
}




export interface IExtendedAccountIncomeRecord extends IAccountIncomeRecord {
    accum: number
}