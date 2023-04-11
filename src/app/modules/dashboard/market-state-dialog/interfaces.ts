import { 
    ISplitStateID, 
    ITrendState, 
    IWindowState 
} from "../../../core";



export interface IMarketStateDialogComponent {
    // Coin Initializer
    initCoin(): Promise<void>,

    // Series Split
    applySplit(id: ISplitStateID): void,

    // Misc Helpers
    displayInfoTooltip(): void,
    displayTooltip(): void,
    close(): void
}



export type IMarketStateModule = "window"|"trend"|"volume"|"coin";


export interface IMarketStateDialogConfig {
    module: IMarketStateModule,
    split?: ISplitStateID,
    windowState?: IWindowState,
    trendState?: ITrendState,
    symbol?: string
}