import { Injectable } from '@angular/core';
import { IPredictionResultName, IPredictionService, IModelType, IModel } from './interfaces';

@Injectable({
  providedIn: 'root'
})
export class PredictionService implements IPredictionService {

	// Prediction Result Names
	public readonly resultNames: {[result: string]: IPredictionResultName} = {
		 '1': 'Long',
		'-1': 'Short',
		 '0': 'Neutral',
	}



  	constructor() { }










	/* Models */





	/**
	 * Given the a model, it will return the type name based on its configuration.
	 * @param model 
	 * @returns IModelType
	 */
	public getModelTypeName(model: IModel): IModelType {
		// Check if it is an ArimaModel
		if (
			model.arima_models && 
			model.arima_models.length == 1 && 
			!model.regression_models &&
			!model.classification_models &&
			!model.consensus_model
		) {
			return 'ArimaModel';
		}

		// Check if it is a RegressionModel
		else if (
			!model.arima_models && 
			model.regression_models && 
			model.regression_models.length == 1 &&
			!model.classification_models &&
			!model.consensus_model
		) {
			return 'RegressionModel';
		}

		// Check if it is a ClassificationModel
		else if (
			!model.arima_models && 
			!model.regression_models && 
			model.classification_models && 
			model.classification_models.length == 1 &&
			!model.consensus_model
		) {
			return 'ClassificationModel';
		}

		// Check if it is a ConsensusModel
		else if (
			(model.arima_models || model.regression_models || model.classification_models) &&
			model.consensus_model
		) {
			return 'ConsensusModel';
		}

		// Otherwise, crash the program
		else {
			console.log(model);
			throw new Error("Could not find the model type name for the provided model.");
		}
	}






}
