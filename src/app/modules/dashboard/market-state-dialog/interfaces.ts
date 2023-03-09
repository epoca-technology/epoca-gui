import { IExchangeLongShortRatioID, IExchangeOpenInterestID, ISplitStateID, IWindowState } from "../../../core";



export interface IMarketStateDialogComponent {
    // Series Split
    applySplit(id: ISplitStateID): void,

    // Misc Helpers
    close(): void
}



export type IMarketStateModule = "window"|"volume"|"open_interest"|"long_short_ratio";


export interface IMarketStateDialogConfig {
    module: IMarketStateModule,
    split?: ISplitStateID,
    windowState?: IWindowState,
    exchangeID: IExchangeOpenInterestID|IExchangeLongShortRatioID
}