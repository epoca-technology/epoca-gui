import { Injectable } from '@angular/core';
import { IPredictionResultName, IPredictionService, IModelTypeName } from './interfaces';

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
	 * Given the number of single models contained, it will return the Model's type 
	 * name.
	 * @param singleModelCount 
	 * @returns IModelTypeName
	 */
	public getModelTypeName(singleModelCount: number): IModelTypeName {
		if (singleModelCount == 0) { return 'Decision Model'}
		else if (singleModelCount == 1) { return 'Single Model'}
		else { return 'Multi Model'}
	}






}
