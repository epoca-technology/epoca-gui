import { Injectable } from '@angular/core';
import { ICandlestick } from './interfaces';
import { ApiService } from '../api';
import { ICandlestickService } from './interfaces';

@Injectable({
  providedIn: 'root'
})
export class CandlestickService implements ICandlestickService {

	// The number of minutes on each candlestick interval
	public readonly predictionCandlestickInterval: number = 30;

	constructor(
		private _api: ApiService
	) { }








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
            'get','candlestick/getForPeriod', 
            {
                start: start,
                end: end,
                intervalMinutes: intervalMinutes
            }, 
            true
        );
	}



    
}
