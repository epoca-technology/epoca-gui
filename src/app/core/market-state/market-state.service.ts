import { Injectable } from '@angular/core';
import { ApiService } from "../api";
import { IKeyZoneFullState, IMarketStateService, ITAIntervalID, ITAIntervalState } from './interfaces';

@Injectable({
  providedIn: 'root'
})
export class MarketStateService implements IMarketStateService {

    /**
	 * Technical Analysis States
	 * The names of each technical analysis suggested action.
	 */
    public readonly taStates: {[result: string|number]: string} = {
      "0": "Neutral",
      "1": "Buy",
      "2": "Strong Buy",
      "-1": "Sell",
      "-2": "Strong Sell"
    }

	/**
	 * Market States
	 * The names of the states each submodule can have when compared to
	 * the beginning of the window.
	 */
	public readonly marketStates: {[result: string|number]: string} = {
		"0": "Stateless",
		"1": "Increasing",
		"2": "Increasing Strongly",
		"-1": "Decreasing",
		"-2": "Decreasing Strongly"
	}


	/**
	 * Market State Icons
	 * The names of the svg icons that represent states.
	 */
	public readonly icons: {[result: string|number]: string} = {
		"0": "arrow_right",
		"1": "arrow_trend_up",
		"2": "arrow_turn_up",
		"-1": "arrow_trend_down",
		"-2": "arrow_turn_down"
	}


  	constructor(private _api: ApiService) { }





	
	/**
	 * Retrieves an up-to-date app bulk from the server.
	 * @returns Promise<ITAIntervalState>
	 */
	public getTAIntervalState(intervalID: ITAIntervalID): Promise<ITAIntervalState> { 
		return this._api.request("get","marketState/getTAIntervalState", {intervalID: intervalID}, true) 
	}



		


	/**
	 * Retrieves an up-to-date app bulk from the server.
	 * @returns Promise<IKeyZoneFullState>
	 */
	public calculateKeyZoneState(): Promise<IKeyZoneFullState> { 
		return this._api.request("get","marketState/calculateKeyZoneState", {}, true) 
	}
}
