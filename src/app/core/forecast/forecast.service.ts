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
	* @param zoneSize? 
	* @param zoneMergeDistanceLimit? 
	* @param priceActionCandlesticksRequirement? 
	* @returns Promise<IForecastResult>
	*/
	 public forecast(
		 start: number, 
		 end: number, 
		 zoneSize?: number, 
		 zoneMergeDistanceLimit?: number,
		 priceActionCandlesticksRequirement?: number,
	): Promise<IForecastResult> {
		return this._api.request('get','forecast/forecast', {
			start: start,
			end: end,
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
            if (above && z.s > price) { zones.push(z) } 
            
            // Build zones that are below the price
            else if (!above && z.e < price) { zones.push(z)}
        });

        /**
         * Order the zones based on the proximity to the price.
         * Zones Above: Order ascending by price
         * Zones Below: Order descending by price
         */
        if (above) { zones.sort((a, b) => { return a.s - b.s}) } 
        else { zones.sort((a, b) => { return b.s - a.s}) }

        // Return the zones
        return zones;
    }
}
