import { ISelectedRegression, IModelType } from "../_interfaces";
import { IEpochBuilderMetadata } from "../epoch-builder-metadata";


export interface IRegressionSelectionService {
    // Properties
    id: string,
    creation: number,
    price_change_mean: number,
    selection: ISelectedRegression[],
    regressionIDs: string[],
    modelTypes: {[modelID: string]: IModelType},
    md: IRegressionSelectionMetadata,

    // Initialization
    init(event: any|string): Promise<void>,
    reset(): void
}




/**
 * Metadata
 * This data is populated once all the regression selection file has been loaded.
 */
 export interface IRegressionSelectionMetadata {
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
    discoveryDecreaseMean: IEpochBuilderMetadata
}