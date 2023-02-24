import { Injectable } from "@angular/core";
import { ApiService } from "../api";
import { IBackgroundTaskInfo } from "../background-task";
import { ICandlestick, ICandlestickService } from "./interfaces";

@Injectable({
  providedIn: "root"
})
export class CandlestickService implements ICandlestickService {

	// The number of minutes on each candlestick interval
	public readonly predictionCandlestickInterval: number = 15;

	constructor(
		private _api: ApiService
	) { }







	/* Candlesticks General Endpoints */



	/**
	 * Retrieves the candlesticks for a given period from the API.
	 * @param start 
	 * @param end 
	 * @param intervalMinutes?
	 * @returns Promise<ICandlestick[]>
	 */
	public getForPeriod(start: number, end: number, intervalMinutes?: number): Promise<ICandlestick[]> {
		// If the interval was not provided, set the prediction interval
		if (typeof intervalMinutes != "number") intervalMinutes = this.predictionCandlestickInterval;

		// Send the request to the API
		return this._api.request(
            "get","candlestick/getForPeriod", 
            {
                start: start,
                end: end,
                intervalMinutes: intervalMinutes
            }, 
            true
        );
	}





	/* Prediction Candlesticks File Endpoints */



	/**
	 * Retrieves the prediction candlesticks" file"s task.
	 * @returns Promise<IBackgroundTaskInfo>
	 */
	public getPredictionFileTask(): Promise<IBackgroundTaskInfo> {
		return this._api.request("get","candlestick/getPredictionFileTask", {}, true);
	}




    /**
     * Creates the background task that will manage the building and uploading
	 * of the prediction candlesticks file.
     * @returns Promise<IBackgroundTaskInfo>
     */
    public generatePredictionCandlesticksFile(otp: string): Promise<IBackgroundTaskInfo> { 
        return this._api.request("post","candlestick/generatePredictionCandlesticksFile", {}, true, otp);
    }








	/* Candlesticks Bundle File Endpoints */




	/**
	 * Retrieves the candlesticks bundle file"s task.
	 * @returns Promise<IBackgroundTaskInfo>
	 */
	public getBundleFileTask(): Promise<IBackgroundTaskInfo> {
		return this._api.request("get","candlestick/getBundleFileTask", {}, true);
	}




    /**
     * Creates the background task that will manage the building and uploading
	 * of the candlesticks bundle file.
     * @returns Promise<IBackgroundTaskInfo>
     */
    public generateCandlesticksBundleFile(otp: string): Promise<IBackgroundTaskInfo> { 
        return this._api.request("post","candlestick/generateCandlesticksBundleFile", {}, true, otp);
    }

}
