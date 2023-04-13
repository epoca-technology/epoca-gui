


export interface IPredictionsComponent {
    // Initializer
    initializeEpochData(epochID?: string): Promise<void>,

    // View Management
    loadCandlesticks(range: IPredsHistoryRange): Promise<void>
}




export type IPredsHistoryRangeID = "24h"|"48h"|"72h"|"1w"|"2w"|"1m"|"3m"|"custom";
export interface IPredsHistoryRange {
    id: IPredsHistoryRangeID,
    name: string
}