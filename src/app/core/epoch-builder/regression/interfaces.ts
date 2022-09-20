import { IRegressionTrainingCertificate } from "../_interfaces";
import { IEpochBuilderMetadata } from "../epoch-builder-metadata";



// Service
export interface IKerasRegressionService {
    // Properties
    ids: string[],
    certificates: IRegressionTrainingCertificate[],
    md: IRegressionMetadata,
    
    // Initialization
    init(event: any|string, order: IRegressionsOrder, limit: number): Promise<void>,
    reset(): void
}





/**
 * Order Type
 * Trained models arent easy to evaluate as there are many factors that 
 * could determine their efficiency and therefore, when making decisions, 
 * trained models should be visualized in all available orders.
 * 1) ebe_points: certificates are ordered by the points received during
 * the epoch builder evaluation
 * 2) mae: certificates are ordered by the mean absolute error received
 * in the test dataset evaluation.
 * 3) mse: certificates are ordered by the mean squared error received
 * in the test dataset evaluation.
 * 4) discovery_points: the total number of points collected during the 
 * discovery process.
 * 5) discovery_accuracy: the general accuracy received in the discovery
 * process.
 */
export type IRegressionsOrder = "ebe_points"|"mae"|"mse"|"discovery_points"|"discovery_accuracy";






/**
 * Metadata
 * This data is populated once all the certificates have been loaded, 
 * ordered and filtered.
 */
export interface IRegressionMetadata {
    // Epoch Builder Evaluation Points
    ebePoints: IEpochBuilderMetadata,

    // Test Dataset Evaluations
    testDatasetMAE: IEpochBuilderMetadata,
    testDatasetMSE: IEpochBuilderMetadata,

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
    discoveryDecreaseMean: IEpochBuilderMetadata,

    // Training Epochs
    epochs: IEpochBuilderMetadata,
}