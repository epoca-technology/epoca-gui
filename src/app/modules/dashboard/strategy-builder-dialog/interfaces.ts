import { 
    IActivePosition, 
    IBinancePositionSide, 
    IPositionStrategy, 
    IKeyZoneState, 
    IPositionStrategyLevel
} from "../../../core";




export interface IStrategyBuilderDialogComponent { 
    // Actions
    initStrategy(): void,
    levelUp(): void,
    processLevelUp(): void,
    cancelLevelUp(): void,
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




export interface IStateItem {
    levelNumber: number,
    level: IPositionStrategyLevel,
    nextLevel: IPositionStrategyLevel|undefined,
    entry: number,
    target: number,
    increase: number,
    liquidation: number
}