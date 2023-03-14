import { Injectable } from "@angular/core";
import { ApiService } from "../api";
import { IPrediction, IPredictionResultName } from "../epoch-builder";
import { IPredictionCandlestick, IPredictionService } from "./interfaces";

@Injectable({
  providedIn: "root"
})
export class PredictionService implements IPredictionService {

	// Prediction Result Names
	public readonly resultNames: {[result: string]: IPredictionResultName} = {
		 "1": "Long",
		"-1": "Short",
		 "0": "Neutral"
	}

	// Prediction Result Image Paths
	public readonly resultImagePaths: {[result: string]: string} = {
		"1": "/assets/img/prediction_badges/long.png",
	   "-1": "/assets/img/prediction_badges/short.png",
		"0": "/assets/img/prediction_badges/neutral.png"
   	}




  	constructor(
		private _api: ApiService
	) { }








	/**********************
	 * Prediction Records *
	 **********************/



	/**
	 * Retrieves a list of predictions based on provided params.
	 * @returns Promise<IPrediction[]>
	 */
	public listPredictions(
		epochID: string,
		startAt: number,
		endAt: number
	 ): Promise<IPrediction[]> {
		return this._api.request(
			"get","prediction/listPredictions", 
			{
				epochID: epochID,
				startAt: startAt,
				endAt: endAt
			}, 
			true
		);
	}









	/***************************
	 * Prediction Candlesticks *
	 ***************************/




	/**
	 * Retrieves a list of prediction candlesticks based on provided params.
	 * @returns Promise<IPrediction[]>
	 */
	 public listPredictionCandlesticks(
		epochID: string,
		startAt: number,
		endAt: number
	 ): Promise<IPredictionCandlestick[]> {
		return this._api.request(
			"get","prediction/listPredictionCandlesticks", 
			{
				epochID: epochID,
				startAt: startAt,
				endAt: endAt
			}, 
			true
		);
	}
}
