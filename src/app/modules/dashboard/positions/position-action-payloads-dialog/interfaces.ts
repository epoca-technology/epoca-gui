


export interface IPositionActionPayloadsDialogComponent {
    tabChanged(newIndex: number): void,
    loadHist(range: IPosPRecordHistoryRange): Promise<void>,
    displayTooltip(): void,
    close(): void,
}





export type IPosPRecordHistoryRangeID = "24h"|"48h"|"72h"|"1w"|"2w"|"1m"|"custom";
export interface IPosPRecordHistoryRange {
    id: IPosPRecordHistoryRangeID,
    name: string
}