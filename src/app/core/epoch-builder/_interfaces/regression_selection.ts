import { IDiscoveryPayload } from "./discovery";
import { IModel } from "./model";
import { IModelEvaluation } from "./model_evaluation";




/* Regression Selection Types at types/regression_selection_types.py */






/**
 * Selected Regression
 * All the insights regarding the selected RegressionModel.
 */
export interface ISelectedRegression {
    // The identifier of the model
    id: string,

    // The selected RegressionModel
    model: IModel,

    // The discovery of the Regression
    discovery: IDiscoveryPayload,

    // The evaluation of the Regression
    evaluation: IModelEvaluation,

    /**
     * The history of the points median. It should be a list of 10 items representing
     * 10%,20%,30%,40%,50%,60%,70%,80%,90% and 100% of the points_hist
     */
    points_median_hist: number[]
}




/**
 * Regression Selection File
 * The result of a RegressionSelection that contains all the information related
 * to the selection and the models in it.
 */
export interface IRegressionSelectionFile {
    // Universally Unique Identifier (uuid4)
    id: string,

    // The date in which the regression selection was created
    creation: number,
    
    // The mean of all the discoveries successful_mean
    price_change_mean: number,

    // The list of selected regressions
    selection: ISelectedRegression[]
}