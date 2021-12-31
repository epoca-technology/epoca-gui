import { Injectable } from '@angular/core';
import { ApiService } from '../api';
import { IForecastService, IForecastResult } from './interfaces';

@Injectable({
  providedIn: 'root'
})
export class ForecastService implements IForecastService {


	// Forecast Text
	public readonly forecastResultText: {[tendencyForecast: string]: string} = { '1': 'Long','0': 'Neutral','-1': 'Short' }




	constructor(
		private _api: ApiService
	) { }




	/**
	 * Retrieves the forecast for a given period based on provided params.
	* @param start 
	* @param end 
	* @param intervalMinutes?
	* @param zoneSize? 
	* @param zoneMergeDistanceLimit? 
	* @returns Promise<IForecastResult>
	*/
	 public forecast(
		 start: number, 
		 end: number, 
		 intervalMinutes?: number, 
		 zoneSize?: number, 
		 zoneMergeDistanceLimit?: number,
	): Promise<IForecastResult> {
		return this._api.request('get','forecast/forecast', {
			start: start,
			end: end,
			intervalMinutes: intervalMinutes,
			zoneSize: zoneSize,
			zoneMergeDistanceLimit: zoneMergeDistanceLimit,
		});
	}

  
}
