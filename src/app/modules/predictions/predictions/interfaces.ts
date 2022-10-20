import { IPrediction } from "../../../core"



export interface IPredictionsComponent {
    // Initializer
    initializeEpochData(epochID?: string): Promise<void>,

    // Predictions Loader
    viewMore(): Promise<void> 
    loadPredictions(): Promise<void>,

    // Prediction Starring
    starAction(pred: IPrediction): Promise<void>
}