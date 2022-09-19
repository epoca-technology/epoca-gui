import { IKerasRegressionTrainingCertificate } from "../_interfaces";
import { IEpochBuilderMetadata } from "../epoch-builder-metadata";



// Service
export interface IKerasRegressionService {
    // Properties
    ids: string[],
    certificates: IKerasRegressionTrainingCertificate[],
    md: IKerasRegressionMetadata,
    
    // Initialization
    init(event: any|string, order: IKerasRegressionsOrder, limit: number): Promise<void>,
    reset(): void
}





/**
 * Order Type
 * Trained models arent easy to evaluate as there are many factors that 
 * could determine their efficiency and therefore, when making decisions, 
 * trained models should be visualized in all available orders.
 * 1) ebe_points: certificates are ordered by the points received during
 * the epoch builder evaluation
 * 2) discovery_accuracy: certificates are ordered by the accuracy obtained
 * during the discovery.
 */
export type IKerasRegressionsOrder = "mae"|"mse"|"ebe_points"|"discovery_accuracy";






/**
 * Metadata
 * This data is populated once all the certificates have been loaded, 
 * ordered and filtered.
 */
export interface IKerasRegressionMetadata {
    // Epoch Builder Evaluation Points
    ebePoints: IEpochBuilderMetadata,

    // Single Shot Test Datasets
    singleShotMAE: IEpochBuilderMetadata,
    singleShotMSE: IEpochBuilderMetadata,

    // Autoregressive Test Datasets
    autoregressiveMAE: IEpochBuilderMetadata,
    autoregressiveMSE: IEpochBuilderMetadata,

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
    discoverySuccessfulMean: IEpochBuilderMetadata,

    // Discovery Prediction Means
    discoveryIncreaseMean: IEpochBuilderMetadata,
    discoveryDecreaseMean: IEpochBuilderMetadata,

    // Training Epochs
    epochs: IEpochBuilderMetadata,
}