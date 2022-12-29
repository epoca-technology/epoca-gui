import { IActivePosition, ICandlestick, IPositionStrategy } from "../../../core";


export interface IActivePositionDialogComponent { 
    close(): void
}





export interface IActivePositionDialogData {
    // The position strategy
    strategy: IPositionStrategy,

    // The active position
    position: IActivePosition,

    // The candlesticks within the current window
    window: ICandlestick[]
}