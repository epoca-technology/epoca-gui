import { 
    IActivePosition, 
    IBinancePositionSide, 
    IPositionStrategy, 
    IKeyZoneState 
} from "../../../core";




export interface IStrategyBuilderDialogComponent { 
    // Actions
    levelUp(): void,
    levelDown(): void,
    
    // Misc Helpers
    displayKeyZoneDialog(): void,
    cancel(): void
}



export type IView = "chart"|"init"|"increase";


export interface IStrategyBuilderDialogData { 
    currentPrice: number,
    keyZones: IKeyZoneState,
    side: IBinancePositionSide,
    strategy: IPositionStrategy,
    position: IActivePosition|undefined
}



export interface IStrategyColors {
    entry: string,
    target: string,
    increase: string,
    liquidation: string
}