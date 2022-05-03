import { Injectable } from '@angular/core';
import { IPredictionResultName, IPredictionService, IModelTypeName, IModel } from './interfaces';

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
	 * @returns IModelTypeName
	 */
	public getModelTypeName(model: IModel): IModelTypeName {
		// Check if it is an ArimaModel
		if (model.arima_models.length == 1) {
			return 'ArimaModel';
		}

		// Check if it is a DecisionModel
		else if (
			model.arima_models.length >= 5 && 
			model.decision_models && 
			model.decision_models.length == 1
		) {
			return 'DecisionModel';
		}

		// Check if it is a MultiDecisionModel
		else if (
			model.arima_models.length >= 5 && 
			model.decision_models && 
			model.decision_models.length > 1
		) {
			return 'MultiDecisionModel';
		}

		// Otherwise, crash the program
		else {
			console.log(model);
			throw new Error("Could not find the model type name for the provided model.");
		}
	}






}
