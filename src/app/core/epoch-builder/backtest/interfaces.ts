import { IBacktest, IEpochBuilderPositionPerformance, IModel } from "../_interfaces";
import { IEpochBuilderMetadata } from "../epoch-builder-metadata";



// Class
export interface IBacktestService {
    
}







/* Class Properties */

// Object containing all models by ID
export interface IModels { [modelID: string]: IModel }

// Object containing all the Backtest info by Model ID
export interface IBacktests { [modelID: string]: IBacktest }

// Object containing all the Performance info by Model ID
export interface IPerformances { [modelID: string]: IEpochBuilderPositionPerformance }

// The metadata for all the backtest results
export interface IBacktestMetadata {
    ebePoints: IEpochBuilderMetadata,
    points: IEpochBuilderMetadata,
    pointsHist: IEpochBuilderMetadata,
    pointsMedian: IEpochBuilderMetadata,
    longAccuracy: IEpochBuilderMetadata,
    shortAccuracy: IEpochBuilderMetadata,
    accuracy: IEpochBuilderMetadata,
    longPositions: IEpochBuilderMetadata,
    shortPositions: IEpochBuilderMetadata,
    positions: IEpochBuilderMetadata,
}







/**
 * Backtest Order Types
 * Evaluating models can be difficult due to the number of factors that
 * need to be taken into consideration. For this reason, it is recommended
 * that models are visualized in several orders to get a better idea of 
 * their performance.
 * 
 * The Backtest Results can be ordered in the following ways:
 * 1) ebe_points: points received in the Epoch Builder Evaluation.
 * 2) points: total points collected in the process.
 * 3) point_medians: the median of the points collected in the process.
 * 4) accuracy: the general accuracy of the models.
 */
 export type IBacktestOrder = "ebe_points"|"points"|"point_medians"|"accuracy";
