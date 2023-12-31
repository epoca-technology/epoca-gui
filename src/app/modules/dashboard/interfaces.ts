import { 
    IBinancePositionSide,
    ISplitStateID, 
} from "../../core";

export interface IDashboardComponent {
    // Window Management
    displayZoomMenu(): void,

    // Position Actions
    openPosition(side: IBinancePositionSide): void,

    // Misc Dialogs
    displayPositionHeadlinesDialog(): void,
    displayBalanceDialog(): void,
    displayPositionRecordDialog(id: string): void,

    // Market State Dialogs
    displayWindowDialog(id: ISplitStateID): void,
    displayVolumeDialog(): void,
    displayKeyZonesDialog(): void,
    displayCoinDialog(symbol?: string): void,
    displayLiquidityDialog(): void,
    displayKeyZoneEventsHistory(): void,
    displayReversalState(): void,

    // Coins Grid Management
    activateFirstCoinsPage(symbols?: string[]): void,
    activateNextCoinsPage(): void,

    // Tooltips
    windowTooltip(): void,
    
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



