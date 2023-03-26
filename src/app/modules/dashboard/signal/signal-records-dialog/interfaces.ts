

export interface ISignalRecordsDialogComponent {
    tabChanged(newIndex: number): void,
    loadHist(range: IRecordHistoryRange): Promise<void>,
    displayTooltip(): void,
    close(): void
}


export type IIRecordHistoryRangeID = "24h"|"48h"|"72h"|"1w"|"2w"|"1m";
export interface IRecordHistoryRange {
    id: IIRecordHistoryRangeID,
    name: string
}