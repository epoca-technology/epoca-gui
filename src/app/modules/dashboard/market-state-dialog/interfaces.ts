import { 
    ISplitStateID, 
    IWindowState 
} from "../../../core";



export interface IMarketStateDialogComponent {
    // Coin Initializer
    initCoin(): Promise<void>,

    // Volume Initializer
    initVolume(): Promise<void>,

    // Series Split
    applySplit(id: ISplitStateID): void,

    // Misc Helpers
    displayInfoTooltip(): void,
    displayTooltip(): void,
    close(): void
}



export type IMarketStateModule = "window"|"volume"|"coin"|"coinBTC";


export interface IMarketStateDialogConfig {
    module: IMarketStateModule,
    split?: ISplitStateID,
    windowState?: IWindowState,
    symbol?: string
}