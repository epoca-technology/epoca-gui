import { ISplitStateSeriesItem } from "../../../../core";

export interface IReversalStateDialogComponent {
    
    syncReversalState(): Promise<void>,
    displayKeyZoneEventInfoDialog(): void,
    displayCoinsStateSummaryDialog(kind: "initial"|"event"|"final"): Promise<void>,
    displayReversalEventInfoDialog(): void,
    displayTooltip(): void,
    displayInfoTooltip(): void,
    close(): void
}





export interface IReversalStateUnpackedScore { 
    general: ISplitStateSeriesItem[], 
    volume: ISplitStateSeriesItem[],
    liquidity: ISplitStateSeriesItem[],
    coins: ISplitStateSeriesItem[],
    coins_btc: ISplitStateSeriesItem[],
}