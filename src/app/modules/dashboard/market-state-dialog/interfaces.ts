import { 
    IPredictionCandlestick, 
    ISplitStateID, 
    ITrendState, 
    IWindowState 
} from "../../../core";



export interface IMarketStateDialogComponent {
    // Series Split
    applySplit(id: ISplitStateID): void,

    // Misc Helpers
    close(): void
}



export type IMarketStateModule = "window"|"trend"|"volume";


export interface IMarketStateDialogConfig {
    module: IMarketStateModule,
    split?: ISplitStateID,
    windowState?: IWindowState,
    trendState?: ITrendState,
    trendWindow?: IPredictionCandlestick[]
}