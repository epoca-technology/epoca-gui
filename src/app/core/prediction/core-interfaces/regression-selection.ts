import { IModel } from "./model";
import { IPositionExitCombinationID } from "./epoch";





/* Regression Selection Types at types/regression_selection_types.py */




/**
 * Model Result
 * The Selection Result for a single model. 
 */
export interface IModelResult {
    // The model's dict
    model: IModel,

    // The median of all the accumulated points within the combination
    points_median: number,

    // The history of the points median. It should be a list of 10 items representing
    // 10%,20%,30%,40%,50%,60%,70%,80%,90% and 100% of the points_hist
    points_median_hist: number[]

    // Positions
    long_num: number     // Number of closed long positions
    short_num: number    // Number of closed short positions

    // Accuracy
    long_acc: number     // Longs Accuracy
    short_acc: number    // Shorts Accuracy
    general_acc: number  // General Accuracy
}







/**
 * Combination Result
 * The result issued by a TakeProfit/StopLoss Combination.
 */
export interface ICombinationResult {
    // Combination
    combination_id: IPositionExitCombinationID

    // The total number of models within the combination (Not just the selected)
    models_num: number

    // The mean of the selected models' points medians
    points_mean: number

    // The list of ordered model results
    model_results: IModelResult[]
}





/**
 * Regression Selection File
 * The result of a RegressionSelection that contains all the information related
 * to the selection and the models in it.
 */
export interface IRegressionSelectionFile {
    // Universally Unique Identifier (uuid4)
    id: string
    
    // The number of models that were selected based on their points medians
    models_limit: number

    // The data range covered in the backtest results
    start: number
    end: number

    // The number of models that were put through the selection
    models_num: number

    // The list of ordered combination results 
    results: ICombinationResult[]
}