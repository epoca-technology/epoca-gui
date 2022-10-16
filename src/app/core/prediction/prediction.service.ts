import { Injectable } from "@angular/core";
import { ApiService } from "../api";
import { IPrediction, IPredictionResultName, IPredictionResultIcon } from "../epoch-builder";
import { IPredictionService } from "./interfaces";

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

	// Prediction Result Icons
	public readonly resultIconNames: {[result: string]: IPredictionResultIcon} = {
		"1": "trending_up",
	   "-1": "trending_down",
		"0": "trending_flat"
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







	/* Retrievers */




	/**
	 * Retrieves the active prediction. If there isn't an active one,
	 * it returns undefined.
	 * @returns Promise<IPrediction|undefined>
	 */
	/*public getActive(): Promise<IPrediction|undefined> {
		return this._api.request("get","prediction/getActive", {}, true);
	}*/






	/**
	 * Retrieves a list of predictions based on provided params.
	 * @returns Promise<IPrediction[]>
	 */
	public listPredictions(
		epochID: string,
		limit: number,
		startAt: number,
		endAt: number
	 ): Promise<IPrediction[]> {
		return this._api.request(
			"get","prediction/getActive", 
			{
				epochID: epochID,
				limit: limit,
				startAt: startAt,
				endAt: endAt,
			}, 
			true
		);
	}
}
