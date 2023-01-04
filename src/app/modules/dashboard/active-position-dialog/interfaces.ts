import { IActivePosition, ICandlestick, IPositionSideHealth, IPositionStrategy } from "../../../core";


export interface IActivePositionDialogComponent { 
    displayHealthDialog(): void,
    close(): void
}





export interface IActivePositionDialogData {
    // The position strategy
    strategy: IPositionStrategy,

    // The active position
    position: IActivePosition,

    // The health of the active position
    health: IPositionSideHealth,

    // The candlesticks within the current window
    window: ICandlestick[]
}