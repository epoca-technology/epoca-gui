import { IActivePosition, IPositionStrategy } from "../../../core";


export interface IActivePositionDialogComponent { 
    
}





export interface IActivePositionDialogData {
    // The position strategy
    strategy: IPositionStrategy,

    // The active position
    position: IActivePosition
}