import { Injectable } from '@angular/core';
import { ApiService } from '../api';
import { IForecastService, IForecastResult, IKeyZone } from './interfaces';

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
	* @param priceActionCandlesticksRequirement? 
	* @returns Promise<IForecastResult>
	*/
	 public forecast(
		 start: number, 
		 end: number, 
		 intervalMinutes?: number, 
		 zoneSize?: number, 
		 zoneMergeDistanceLimit?: number,
		 priceActionCandlesticksRequirement?: number,
	): Promise<IForecastResult> {
		return this._api.request('get','forecast/forecast', {
			start: start,
			end: end,
			intervalMinutes: intervalMinutes,
			zoneSize: zoneSize,
			zoneMergeDistanceLimit: zoneMergeDistanceLimit,
			priceActionCandlesticksRequirement: priceActionCandlesticksRequirement,
		});
	}

  









    /**
     * Retrieves all the key zones from the current price.
     * @param price 
     * @param kz 
     * @param above 
     * @returns IKeyZone[]
     */
     public getZonesFromPrice(price: number, kz: IKeyZone[], above: boolean): IKeyZone[] {
        // Init the zones
        let zones: IKeyZone[] = [];

        // Build the zones based on the type
        kz.forEach((z) => { 
            // Build zones that are above the price
            if (above && z.start > price) { zones.push(z) } 
            
            // Build zones that are below the price
            else if (!above && z.end < price) { zones.push(z)}
        });

        /**
         * Order the zones based on the proximity to the price.
         * Zones Above: Order ascending by price
         * Zones Below: Order descending by price
         */
        if (above) { zones.sort((a, b) => { return a.start - b.start}) } 
        else { zones.sort((a, b) => { return b.start - a.start}) }

        // Return the zones
        return zones;
    }
}
