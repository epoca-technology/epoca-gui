import { Injectable } from '@angular/core';
import { ApiService } from "../api";
import { 
	ICoinsSummary,
	ICoinState,
	IKeyZoneFullState, 
	ILiquidityState, 
	IMarketStateService, 
	ISplitStateID, 
	IVolumeState 
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
	 * Retrieves the liquidity state from the server
	 * @returns Promise<ILiquidityState>
	 */
	public getLiquidityState(): Promise<ILiquidityState> { 
		return this._api.request("get","marketState/getLiquidityState", {}, true) 
	}


		


	/**
	 * Retrieves the keyzone state from the server.
	 * @returns Promise<IKeyZoneFullState>
	 */
	public calculateKeyZoneState(): Promise<IKeyZoneFullState> { 
		return this._api.request("get","marketState/calculateKeyZoneState", {}, true) 
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
