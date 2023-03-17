import { 
    ISplitStateID, 
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
    displayTrendDialog(id: ISplitStateID): void,
    displayVolumeDialog(): void,
    displayLiquidityDialog(): void,
    displayKeyZonesDialog(): void,
    displayCoinDialog(symbol: string): void,

    // Coins Grid Management
    activateFirstCoinsPage(symbols?: string[]): void,
    activateNextCoinsPage(): void,

    // Tooltips
    windowTooltip(): void,
    volumeTooltip(): void,
    
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



