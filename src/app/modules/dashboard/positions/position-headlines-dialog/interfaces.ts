


export interface IPositionHeadlinesDialogComponent {
    loadHist(range: IPosRecordHistoryRange): Promise<void>,
    displayTooltip(): void,
    close(): void
}



export type IIPosRecordHistoryRangeID = "24h"|"48h"|"72h"|"1w"|"2w"|"1m"|"custom";
export interface IPosRecordHistoryRange {
    id: IIPosRecordHistoryRangeID,
    name: string
}