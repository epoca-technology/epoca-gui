import { 
    IExchangeOpenInterestID, 
    IExchangeLongShortRatioID, 
    ISplitStateID, 
    ITAIntervalID 
} from "../../core";

export interface IDashboardComponent {
    // Window Management
    displayZoomMenu(): void,

    // Adjustments Management
    displayAdjustmentsMenu(): void,

    // Misc Dialogs
    displayBalanceDialog(): void,
    displayActivePredictionDialog(): void,

    // Market State Dialogs
    displayWindowDialog(id: ISplitStateID): void,
    displayVolumeDialog(): void,
    displayTechnicalAnalysisDialog(taInterval: ITAIntervalID): void,
    displayLiquidityDialog(): void,
    displayKeyZonesDialog(): void,
    displayOpenInterestDialog(id: IExchangeOpenInterestID): void,
    displayLongShortRatioDialog(id: IExchangeLongShortRatioID): void,

    // Tooltips
    windowTooltip(): void,
    //predictionModelTooltip(): void,
    volumeTooltip(): void,
    technicalsTooltip(): void,
    openInterestTooltip(): void,
    longShortRatioTooltip(): void,
    
    // Nav Actions
    createNewInstance(): void,
    signOut(): void
}






/**
 * Window Zoom
 */
export type IWindowZoomID = "xs"|"s"|"m"|"l"|"xl";
export interface IWindowZoomPrices {
    // The highest & lowest prices that should be displayed
    highest: number,
    lowest: number,

    // The high and low prices in which the range will be recalculated
    highLimit: number,
    lowLimit: number,
}
export interface IWindowZoom extends IWindowZoomPrices {
    // The identifier of the zoom
    id: IWindowZoomID,
    
    // The Size of the zoom
    size: number,
}