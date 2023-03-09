import { Injectable } from '@angular/core';
import { ApiService } from "../api";
import { 
	IExchangeLongShortRatioID,
	IExchangeLongShortRatioState,
	IExchangeOpenInterestID,
	IExchangeOpenInterestState,
	IKeyZoneFullState, 
	IMarketStateService, 
	ISplitStateID, 
	ITAIntervalID, 
	ITAIntervalState, 
	IVolumeState 
} from './interfaces';



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

	
	/**
	 * Split IDs
	 * List of splits applied to datasets.
	 */
	public readonly splits: ISplitStateID[] = ["s100", "s75", "s50", "s25", "s15", "s10", "s5", "s2"];
    public splitNames: {[splitID: string]: string} = {
        s100: "100%",
        s75: "75%",
        s50: "50%",
        s25: "25%",
        s15: "15%",
        s10: "10%",
        s5: "5%",
        s2: "2%",
    }


	/**
	 * Open Interest
	 * List of exchanges that offer their open interest through public APIs
	 */
	public readonly openInterestExchanges: IExchangeOpenInterestID[] = ["binance", "bybit", "huobi", "okx"];
	public readonly openInterestExchangeNames: {[exchangeID: string]: string} = {
		binance: "Binance",
		bybit: "ByBit",
		huobi: "Huobi",
		okx: "OKX",
	};


	/**
	 * Long/Short Ratio
	 * List of exchanges that offer their long/short ratio through public APIs
	 */
	public readonly longShortRatioExchanges: IExchangeLongShortRatioID[] = ["binance", "binance_tta", "binance_ttp", "huobi_tta", "huobi_ttp"];
	public readonly longShortRatioExchangeNames: {[exchangeID: string]: string} = {
		binance: "Binance",
		binance_tta: "Binance TTA",
		binance_ttp: "Binance TTP",
		huobi_tta: "Huobi TTA",
		huobi_ttp: "Huobi TTP",
	};







  	constructor(private _api: ApiService) { }





	
	/**
	 * Retrieves the current volume state.
	 * @returns Promise<ITAIntervalState>
	 */
	public getFullVolumeState(): Promise<IVolumeState> { 
		return this._api.request("get","marketState/getFullVolumeState", {}, true) 
	}



	
	/**
	 * Retrieves the current technicals for a given interval.
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
		




	/**
	 * Retrieves the open interest state for a given exchange.
	 * @param exchangeID
	 * @returns Promise<IExchangeOpenInterestState>
	 */
	public getOpenInterestStateForExchange(exchangeID: IExchangeOpenInterestID): Promise<IExchangeOpenInterestState> { 
		return this._api.request("get","marketState/getOpenInterestStateForExchange", {exchangeID: exchangeID}, true) 
	}
		




	/**
	 * Retrieves the long/short ratio state for a given exchange.
	 * @param exchangeID
	 * @returns Promise<IExchangeLongShortRatioState>
	 */
	public getLongShortRatioStateForExchange(exchangeID: IExchangeLongShortRatioID): Promise<IExchangeLongShortRatioState> { 
		return this._api.request("get","marketState/getLongShortRatioStateForExchange", {exchangeID: exchangeID}, true) 
	}
}
