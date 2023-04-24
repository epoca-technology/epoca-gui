

export interface ISignalRecordsDialogComponent {
    loadHist(range: IRecordHistoryRange): Promise<void>,
    displayTooltip(): void,
    close(): void
}


export type IIRecordHistoryRangeID = "12h"|"24h"|"48h"|"72h"|"1w"|"2w"|"1m"|"custom";
export interface IRecordHistoryRange {
    id: IIRecordHistoryRangeID,
    name: string
}