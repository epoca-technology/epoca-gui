import { Injectable } from '@angular/core';
import { ICandlestick } from '.';
import { ApiService, ICryptoCurrencySymbol } from '..';
import { ICandlestickService } from './interfaces';

@Injectable({
  providedIn: 'root'
})
export class CandlestickService implements ICandlestickService {

	constructor(
		private _api: ApiService
	) { }








	/**
	 * Retrieves the candlesticks for a given period from the API.
	 * @param symbol 
	 * @param start 
	 * @param end 
	 * @param intervalMinutes 
	 * @returns Promise<ICandlestick[]>
	 */
	public getForPeriod(symbol: ICryptoCurrencySymbol, start: number, end: number, intervalMinutes: number): Promise<ICandlestick[]> {
		return this._api.request('get','candlestick/getForPeriod', {
			symbol: symbol,
			start: start,
			end: end,
			intervalMinutes: intervalMinutes
		});
	}



    
}
