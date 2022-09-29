import { IPredictionModelCertificate } from "../_interfaces";
import { IEpochBuilderMetadata } from "../epoch-builder-metadata";



// Service
export interface IPredictionModelService {
    // Properties
    ids: string[],
    certificates: IPredictionModelCertificate[],
    md: IPredictionModelMetadata,
    
    // Initialization
    init(event: any|string, order: IPredictionModelsOrder, limit: number): Promise<void>,
    reset(): void
}





/**
 * Order Type
 * Prediction Models arent easy to evaluate as there are many factors that 
 * could determine their efficiency and therefore, when making decisions, 
 * they should be visualized in all available orders.
 * 1) ebe_points: certificates are ordered by the points received during
 * the epoch builder evaluation
 * 2) backtest_profit: certificates are ordered by the profit received
 * in the backtest process.
 * 3) backtest_accuracy: certificates are ordered by the accuracy received
 * in the test dataset evaluation.
 * 4) discovery_points: the total number of points collected during the 
 * backtest process.
 * 5) discovery_accuracy: the general accuracy received in the discovery
 * process.
 */
export type IPredictionModelsOrder = "ebe_points"|"backtest_profit"|"backtest_accuracy"|"discovery_points"|"discovery_accuracy";






/**
 * Metadata
 * This data is populated once all the certificates have been loaded, 
 * ordered and filtered.
 */
export interface IPredictionModelMetadata {
    // Epoch Builder Evaluation Points
    ebePoints: IEpochBuilderMetadata,

    // Backtest Profit
    backtestProfit: IEpochBuilderMetadata,

    // Backtest Accuracy
    backtestIncreaseAccuracy: IEpochBuilderMetadata,
    backtestDecreaseAccuracy: IEpochBuilderMetadata,
    backtestAccuracy: IEpochBuilderMetadata,

    // Backtest Positions
    backtestIncreasePositions: IEpochBuilderMetadata,
    backtestDecreasePositions: IEpochBuilderMetadata,
    backtestPositions: IEpochBuilderMetadata,

    // Backtest Fees
    backtestFee: IEpochBuilderMetadata,

    // Discovery Accuracy
    discoveryIncreaseAccuracy: IEpochBuilderMetadata,
    discoveryDecreaseAccuracy: IEpochBuilderMetadata,
    discoveryAccuracy: IEpochBuilderMetadata,

    // Discovery Predictions
    discoveryNeutralPredictions: IEpochBuilderMetadata,
    discoveryIncreasePredictions: IEpochBuilderMetadata,
    discoveryDecreasePredictions: IEpochBuilderMetadata,
    discoveryPredictions: IEpochBuilderMetadata,

    // Discovery Successful Predictions
    discoverySuccessfulIncreaseMean: IEpochBuilderMetadata,
    discoverySuccessfulDecreaseMean: IEpochBuilderMetadata,

    // Discovery Prediction Means
    discoveryIncreaseMean: IEpochBuilderMetadata,
    discoveryDecreaseMean: IEpochBuilderMetadata
}