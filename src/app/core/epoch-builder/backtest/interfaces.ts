import { IModel, IModelType, IBacktest, IBacktestPerformance} from "../../prediction";




/* Backtest Related */


// Backtest Service
export interface IBacktestService {
    // Main Properties
    modelIDs: string[],
    models: IModels,
    modelTypeNames: IModelTypeNames,
    backtests: IBacktests,
    performances: IPerformances,

    // General Section Metadata Properties
    pointsMD: IPointsMetadata,
    pointsHistoryMD: IPointsHistoryMetadata,
    pointsMedianMD: IPointsMedianMetadata,
    accuracyMD: IAccuracyMetadata,
    positionsMD: IPositionsMetadata,

    // Initialization
    init(event: any, order: IBacktestOrder, limit?: number): Promise<void>,
    resetBacktestResults(): void,
}












/* Service Specific Types */

/* Main Properties */

// Models
export interface IModels {
    [modelID: string]: IModel
}

export interface IModelTypeNames {
    [modelID: string]: IModelType
}


// Backtests
export interface IBacktests {
    [modelID: string]: IBacktest
}


// Performances
export interface IPerformances {
    [modelID: string]: IBacktestPerformance
}



/* General Sections Metadata Data */

export interface IGeneralSectionMetadataValue { id: string, value: number }



export interface IBacktestMetadata {
    min: IGeneralSectionMetadataValue,
    max: IGeneralSectionMetadataValue
}


/* Points */

export interface IPointsMetadata extends IBacktestMetadata { }


export interface IPointsHistoryMetadata extends IBacktestMetadata { }


export interface IPointsMedianMetadata extends IBacktestMetadata { }


/* Accuracy */

export interface IAccuracyMetadata {
    long: IBacktestMetadata,
    short: IBacktestMetadata,
    general: IBacktestMetadata,
}


/* Positions */

export interface IPositionsMetadata extends IAccuracyMetadata { }






/**
 * Order Types
 * Models arent easy to evaluate as there are many factors that 
 * could determine their efficiency and therefore, when making decisions, 
 * trained models should be visualized with all 3 orders.
 * 1) points: backtests are ordered by the points collected.
 * 2) point_medians: backtests are ordered by the median of the points collected.
 * 3) acc: backtests are ordered by their general accuracy
 */
 export type IBacktestOrder = "points"|"point_medians"|"acc";


