import { ICandlestick } from "../candlestick";


export interface IForecastService {
    forecast(
        start: number, 
        end: number, 
        intervalMinutes?: number, 
        zoneSize?: number, 
        zoneMergeDistanceLimit?: number,
   ): Promise<IForecastResult>
}




/* Config */
export interface IForecastConfig {
    intervalMinutes?: number,
    includeCandlesticksInResponse?: boolean,
}

export interface IKeyZonesConfig {
    zoneSize?: number,
    zoneMergeDistanceLimit?: number,
}






/* Key Zones State */
export interface IKeyZonesState {
    // Close price of the last candlestick
    price: number,

    // Key Zones
    zones: IKeyZone[],
    zonesAbove: IKeyZone[],
    zonesBelow: IKeyZone[],

    // Resistance
    resistanceDominance: number,
    touchedResistance: boolean,
    brokeResistance: boolean,

    // Support
    supportDominance: number,
    touchedSupport: boolean,
    brokeSupport: boolean,
}






/* Key Zones */
export interface IKeyZonePriceRange {
    start: number,                  // Start Price (Highest High or Lowest Low)
    end: number,                    // End Price (+/- zoneSize% from start price)
}

export interface IKeyZone extends IKeyZonePriceRange {
    id: number,                     // Candlestick Open Timestamp
    reversals: IReversal[],         // List of reversals that took place at the zone, ordered by date ascending
    volume: number,                 // The accumulated volume that has been processed within the zone
    volumeScore: number,            // Score from 0 to 10 based on the volume traded
    mutated: boolean,               // Changed it's type from resistance to support or viceversa
} 








/**
 * Reversals
 * Resistance: Price touches a resistance zone and reverses.
 * Support: Price touches a support zone and reverses.
 */
export interface IReversal {
    id: number,                     // Candlestick Open Timestamp
    type: IReversalType
}

export type IReversalType = 'resistance'|'support';














/* Forecast Result */



// Forecast Result
export interface IForecastResult {
    start: number,                  // First Candlestick's Open Time
    end: number,                    // Last Candlestick's Close Time
    result: ITendencyForecast,
    state: IKeyZonesState,
    candlesticks?: ICandlestick[]   // Only exists if includeCandlesticksInResponse is set to true
}






// Tendency
export type ITendencyForecast = 1|0|-1;