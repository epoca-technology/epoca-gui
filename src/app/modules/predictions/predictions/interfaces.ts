import { IPrediction } from "../../../core"



export interface IPredictionsComponent {
    // Initializer
    initializeEpochData(epochID?: string): Promise<void>,

    // View Management
    activateView(view: IView): Promise<void>,
    activateCandlesticks(days?: number): Promise<void>,
    
    // Predictions Loader
    viewMore(): Promise<void> 
    loadPredictions(): Promise<void>,

    // Prediction Starring
    starAction(pred: IPrediction): Promise<void>
}




export type IView = "line"|"candlesticks"|"grid";