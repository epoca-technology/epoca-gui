


export interface IPositionHeadlinesDialogComponent {
    loadHist(range: IPosRecordHistoryRange): Promise<void>,
    displayPositionActionPayloadsDialog(): void,
    displayTooltip(): void,
    close(): void
}



export type IIPosRecordHistoryRangeID = "1w"|"2w"|"1m"|"2m"|"3m"|"6m"|"9m"|"1y"|"custom";
export interface IPosRecordHistoryRange {
    id: IIPosRecordHistoryRangeID,
    name: string
}