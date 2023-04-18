import { Injectable } from '@angular/core';
import { ApiService } from "../api";
import { 
	ICoinsCompressedState,
	ICoinsConfiguration,
	ICoinsSummary,
	ICoinState,
	IKeyZoneFullState, 
	IKeyZonesConfiguration, 
	IKeyZoneStateEvent, 
	ILiquidityState, 
	IMarketStateService, 
	ISplitStateID, 
	ITrendStateConfiguration, 
	IVolumeState, 
	IWindowStateConfiguration
} from './interfaces';



@Injectable({
  providedIn: 'root'
})
export class MarketStateService implements IMarketStateService {
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
	 * Coin State Icons
	 * The names of the svg icons that represent coin state events.
	 */
	public readonly coinStateIcons: {[result: string|number]: string} = {
		"0": "",
		"1": "rotate_right",
		"2": "rotate_right",
		"-1": "rotate_left",
		"-2": "rotate_left"
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
	 * KeyZones
	 * The colors are based on the position from the price and the intensity
	 * of the volume.
	 */
	public readonly kzAbove: {[volIntensity: number]: string} = { 0: "#E0F2F1", 1: "#80CBC4", 2: "#26A69A", 3: "#00897B", 4: "#004D40" }
	public readonly kzBelow: {[volIntensity: number]: string} = { 0: "#FFEBEE", 1: "#EF9A9A", 2: "#EF5350", 3: "#E53935", 4: "#B71C1C" }
	public readonly kzVolIntensityIcons: {[volIntensity: number]: string} = {
		0: "battery_empty",
		1: "battery_quarter",
		2: "battery_half",
		3: "battery_three_quarters",
		4: "battery_full",
	};



  	constructor(private _api: ApiService) { }









	/**********************
	 * General Retrievers *
	 **********************/


	
	/**
	 * Retrieves the current volume state.
	 * @returns Promise<IVolumeState>
	 */
	public getFullVolumeState(): Promise<IVolumeState> { 
		return this._api.request("get","marketState/getFullVolumeState", {}, true) 
	}








	/**
	 * Retrieves the liquidity state from the server.
	 * @param currentPrice
	 * @returns Promise<ILiquidityState>
	 */
	public getLiquidityState(currentPrice: number): Promise<ILiquidityState> { 
		return this._api.request("get","marketState/getLiquidityState", {currentPrice: currentPrice}, true) 
	}















	/*********************
	 * Window Management *
	 *********************/





	/**
	 * Retrieves the window configuration from the server.
	 * @returns Promise<IWindowStateConfiguration>
	 */
	public getWindowConfiguration(): Promise<IWindowStateConfiguration> { 
		return this._api.request("get","marketState/getWindowConfiguration", {}, true) 
	}






    /**
     * Updates the Window's configuration.
     * @param newConfiguration 
     * @param otp 
     * @returns Promise<void>
     */
    public updateWindowConfiguration(newConfiguration: IWindowStateConfiguration, otp: string): Promise<void> { 
        return this._api.request("post", "marketState/updateWindowConfiguration", {newConfiguration: newConfiguration}, true, otp);
    }









	


	/***********************
	 * KeyZones Management *
	 ***********************/



		


	/**
	 * Retrieves the keyzone state from the server.
	 * @returns Promise<IKeyZoneFullState>
	 */
	public calculateKeyZoneState(): Promise<IKeyZoneFullState> { 
		return this._api.request("get","marketState/calculateKeyZoneState", {}, true) 
	}


		


	/**
	 * Retrieves the list of keyzone state events that occured within
	 * the given date range.
	 * @param startAt
	 * @param endAt
	 * @returns Promise<IKeyZoneStateEvent[]>
	 */
	public listKeyZoneEvents(startAt: number, endAt: number): Promise<IKeyZoneStateEvent[]> { 
		return this._api.request("get","marketState/listKeyZoneEvents", {startAt: startAt, endAt: endAt}, true) 
	}




	/**
	 * Retrieves the keyzones configuration from the server.
	 * @returns Promise<IKeyZonesConfiguration>
	 */
	public getKeyZonesConfiguration(): Promise<IKeyZonesConfiguration> { 
		return this._api.request("get","marketState/getKeyZonesConfiguration", {}, true) 
	}






    /**
     * Updates the KeyZones' configuration.
     * @param newConfiguration 
     * @param otp 
     * @returns Promise<void>
     */
    public updateKeyZonesConfiguration(newConfiguration: IKeyZonesConfiguration, otp: string): Promise<void> { 
        return this._api.request("post", "marketState/updateKeyZonesConfiguration", {newConfiguration: newConfiguration}, true, otp);
    }











	/*********************
	 * Trend Management *
	 *********************/





	/**
	 * Retrieves the trend configuration from the server.
	 * @returns Promise<ITrendStateConfiguration>
	 */
	public getTrendConfiguration(): Promise<ITrendStateConfiguration> { 
		return this._api.request("get","marketState/getTrendConfiguration", {}, true) 
	}






    /**
     * Updates the Trend's configuration.
     * @param newConfiguration 
     * @param otp 
     * @returns Promise<void>
     */
    public updateTrendConfiguration(newConfiguration: ITrendStateConfiguration, otp: string): Promise<void> { 
        return this._api.request("post", "marketState/updateTrendConfiguration", {newConfiguration: newConfiguration}, true, otp);
    }
















	/********************
	 * Coins Management *
	 ********************/






	/**
	 * Retrieves Coins Summary including all supported and installed coins
	 * @returns Promise<ICoinsSummary>
	 */
	public getCoinsSummary(): Promise<ICoinsSummary> { 
		return this._api.request("get","marketState/getCoinsSummary", {}, true) 
	}





    /**
     * Installs a coin into the system by symbol.
     * @param symbol 
     * @param otp 
     * @returns Promise<ICoinsSummary>
     */
    public installCoin(symbol: string, otp: string): Promise<ICoinsSummary> { 
        return this._api.request("post", "marketState/installCoin", {symbol: symbol}, true, otp);
    }






    /**
     * Uninstalls a coin from the system by symbol.
     * @param symbol 
     * @param otp 
     * @returns Promise<ICoinsSummary>
     */
    public uninstallCoin(symbol: string, otp: string): Promise<ICoinsSummary> { 
        return this._api.request("post", "marketState/uninstallCoin", {symbol: symbol}, true, otp);
    }







	/**
	 * Retrieves the full state of a coin by symbol.
	 * @param symbol
	 * @returns Promise<ICoinState>
	 */
	public getCoinFullState(symbol: string): Promise<ICoinState> { 
		return this._api.request("get","marketState/getCoinFullState", {symbol: symbol}, true) 
	}







	/**
	 * Retrieves the compressed state for all the coins.
	 * @param symbol
	 * @returns Promise<ICoinsCompressedState>
	 */
	public getCoinsCompressedState(): Promise<ICoinsCompressedState> { 
		return this._api.request("get","marketState/getCoinsCompressedState", {}, true) 
	}





	/**
	 * Retrieves the coins' configuration from the server.
	 * @returns Promise<ICoinsConfiguration>
	 */
	public getCoinsConfiguration(): Promise<ICoinsConfiguration> { 
		return this._api.request("get","marketState/getCoinsConfiguration", {}, true) 
	}






    /**
     * Updates the Coins's configuration.
     * @param newConfiguration 
     * @param otp 
     * @returns Promise<void>
     */
    public updateCoinsConfiguration(newConfiguration: ICoinsConfiguration, otp: string): Promise<void> { 
        return this._api.request("post", "marketState/updateCoinsConfiguration", {newConfiguration: newConfiguration}, true, otp);
    }






	/**
	 * Retrieves the base asset name based on the symbol.
	 * F.e: BTCUSDT -> BTC
	 * @param symbol 
	 * @returns string
	 */
	public getBaseAssetName(symbol: string): string {
		if (typeof symbol == "string" && symbol.length >= 5) {
			return symbol.replace("USDT", "");
		} else { return symbol }
	}

}
