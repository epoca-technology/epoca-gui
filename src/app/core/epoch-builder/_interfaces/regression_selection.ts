import { IDiscoveryPayload } from "./discovery";
import { IModel } from "./model";





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
    discovery: IDiscoveryPayload
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