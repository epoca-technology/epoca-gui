import { Injectable } from '@angular/core';
import { IMarketStateService } from './interfaces';

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


  	constructor() { }
}
