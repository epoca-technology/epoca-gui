import { Injectable } from '@angular/core';
import { IPredictionResultName, IModelType, IModel } from '../epoch-builder';
import { IPredictionService } from './interfaces';

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












	








	/* Misc Helpers */









	/**
	 * Given the a model, it will return the type name based on its configuration.
	 * @param model 
	 * @returns IModelType
	 */
	public getModelTypeName(model: IModel): IModelType {
		// Check if it is a KerasRegressionModel
		if (
			model.keras_regressions && 
			model.keras_regressions.length == 1 &&
			!model.xgb_regressions &&
			!model.xgb_classifications &&
			!model.consensus
		) {
			return "KerasRegressionModel";
		}

		// Check if it is a XGBRegressionModel
		else if (
			model.xgb_regressions && 
			model.xgb_regressions.length == 1 &&
			!model.keras_regressions &&
			!model.xgb_classifications &&
			!model.consensus
		) {
			return "XGBRegressionModel";
		}

		// Check if it is a KerasClassificationModel
		else if (
			model.keras_classifications && 
			model.keras_classifications.length == 1 &&
			!model.keras_regressions &&
			!model.xgb_regressions &&
			!model.xgb_classifications &&
			!model.consensus
		) {
			return "KerasClassificationModel";
		}

		// Check if it is a XGBClassificationModel
		else if (
			model.xgb_classifications && 
			model.xgb_classifications.length == 1 &&
			!model.keras_regressions &&
			!model.xgb_regressions &&
			!model.keras_classifications &&
			!model.consensus
		) {
			return "XGBClassificationModel";
		}

		// Check if it is a ConsensusModel
		else if (
			(model.keras_regressions || model.xgb_regressions || model.keras_classifications || model.xgb_classifications) &&
			model.consensus
		) {
			return "ConsensusModel";
		}

		// Otherwise, crash the program
		else {
			console.log(model);
			throw new Error("Could not find the model type name for the provided model.");
		}
	}
}
