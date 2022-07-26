// Expose the Core Interfaces
export * from './core-interfaces/arima';
export * from './core-interfaces/backtest';
export * from './core-interfaces/classification_training_data';
export * from './core-interfaces/classification';
export * from './core-interfaces/epoch';
export * from './core-interfaces/interpreter';
export * from './core-interfaces/keras-models';
export * from './core-interfaces/model-evaluation';
export * from './core-interfaces/model';
export * from './core-interfaces/regression-selection';
export * from './core-interfaces/regression';

// Import required interfaces
import { IPredictionResultName, IModel, IModelType } from "./core-interfaces/model";






// Prediction Service
export interface IPredictionService {
    // Properties
    resultNames: {[result: string]: IPredictionResultName},
    



    // Models
    getModelTypeName(model: IModel): IModelType,
}











