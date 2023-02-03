import { IActivePosition, IPositionSideHealth, IPositionStrategy } from "../../../core";


export interface IActivePositionDialogComponent { 
    close(): void
}





export interface IActivePositionDialogData {
    // The position strategy
    strategy: IPositionStrategy,

    // The active position
    position: IActivePosition,

    // The health of the active position
    health: IPositionSideHealth,

    // The current spot price
    spotPrice: number
}