import { ICompressedTrainingData, IModel, ITrainingDataDatasetSummary } from "../_interfaces";


export interface IClassificationTrainingDataService {
    // Properties
    id: string,
    regressionSelectionID: string,
    description: string,
    creationStart: number,
    creationEnd: number,
    start: number,
    end: number,
    steps: number,
    priceChangeRequirement: number,
    regressions: IModel[],
    includeRSI: boolean,
    includeAROON: boolean,
    featuresNum: number,
    increaseOutcomeNum: number,
    decreaseOutcomeNum: number,
    datasetSummary: ITrainingDataDatasetSummary,
    trainingData: ICompressedTrainingData,
    trainingDataFeatures: string[],
    trainingDataFeaturesAndLabel: string[],

    // Initialization
    init(event: any|string): Promise<void>,
    reset(): void
}