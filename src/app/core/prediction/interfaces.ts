// Expose the Core Interfaces
export * from './core-interfaces';

// Import required interfaces
import { IPredictionResultName, IModel, IModelTypeName } from "./core-interfaces";






// Prediction Service
export interface IPredictionService {
    // Properties
    resultNames: {[result: string]: IPredictionResultName},
    



    // Models
    getModelTypeName(model: IModel): IModelTypeName,
}











