import { IBarChartOptions } from "../chart";



export interface IEpochBuilderViewService {

}




// EBE Points View
export interface IEBEPointsView {
    points: IBarChartOptions
}



// Discovery View
export interface IDiscoveryView {
    accuracy: IBarChartOptions,
    predictions: IBarChartOptions,
    successfulPredictions: IBarChartOptions,
    increasePredictionRanges: IBarChartOptions
    decreasePredictionRanges: IBarChartOptions
}