import { IModel, IModelTypeName, IBacktest, IBacktestPerformance} from "../../prediction";




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
    accuracyMD: IAccuracyMetadata,
    positionsMD: IPositionsMetadata,
    durationMD: IDurationMetadata,

    // Initialization
    init(event: any): Promise<void>,
    resetBacktestResults(): void,
}












/* Service Specific Types */

/* Main Properties */

// Models
export interface IModels {
    [modelID: string]: IModel
}

export interface IModelTypeNames {
    [modelID: string]: IModelTypeName
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



/* Accuracy */

export interface IAccuracyMetadata {
    long: IBacktestMetadata,
    short: IBacktestMetadata,
    general: IBacktestMetadata,
}


/* Positions */

export interface IPositionsMetadata extends IAccuracyMetadata { }



/* Duration */

export interface IDurationMetadata extends IBacktestMetadata { }







