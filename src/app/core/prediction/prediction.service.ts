import { Injectable } from '@angular/core';
import { IPredictionResultName } from '../epoch-builder';
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





}
