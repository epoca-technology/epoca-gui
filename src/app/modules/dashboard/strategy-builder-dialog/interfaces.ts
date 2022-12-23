import { 
    IActivePosition, 
    IBinancePositionSide, 
    IPositionStrategy, 
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
    cancel(): void
}



export type IView = "chart"|"init"|"increase";


export interface IStrategyBuilderDialogData { 
    currentPrice: number,
    side: IBinancePositionSide,
    strategy: IPositionStrategy,
    position: IActivePosition|undefined
}



export interface IStrategyColors {
    market: string,
    entry: string,
    target: string,
    stopLoss: string,
    increase: string,
    liquidation: string
}




export interface IStateItem {
    margin: number,
    levelNumber: number,
    level: IPositionStrategyLevel,
    nextLevel: IPositionStrategyLevel|undefined,
    market: number,
    entry: number,
    target: number,
    stopLoss: number,
    increase: number,
    liquidation: number
}