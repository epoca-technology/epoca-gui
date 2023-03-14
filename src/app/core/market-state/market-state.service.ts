import { Injectable } from '@angular/core';
import { ApiService } from "../api";
import { 
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
	 * KeyZone Colors
	 * The colors are based on the position from the price and the intensity
	 * of the volume.
	 */
	public readonly kzAbove: {[volIntensity: number]: string} = { 0: "#B2DFDB", 1: "#26A69A", 2: "#004D40" }
	public readonly kzBelow: {[volIntensity: number]: string} = { 0: "#FFCDD2", 1: "#F44336", 2: "#B71C1C" }




  	constructor(private _api: ApiService) { }





	
	/**
	 * Retrieves the current volume state.
	 * @returns Promise<ITAIntervalState>
	 */
	public getFullVolumeState(): Promise<IVolumeState> { 
		return this._api.request("get","marketState/getFullVolumeState", {}, true) 
	}








	/**
	 * Retrieves the liquidity state from the server
	 * @returns Promise<IKeyZoneFullState>
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
}
