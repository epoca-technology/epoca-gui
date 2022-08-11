// Import component required interfaces
import { IPredictionResultName, IModel, IModelType } from "../epoch-builder";






// Prediction Service
export interface IPredictionService {
    // Properties
    resultNames: {[result: string]: IPredictionResultName},
    



    // Models
    getModelTypeName(model: IModel): IModelType,
}











