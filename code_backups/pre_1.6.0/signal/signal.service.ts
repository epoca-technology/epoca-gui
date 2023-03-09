import { Injectable } from '@angular/core';
import { ApiService } from '../api';
import { IBinancePositionSide } from '../position';
import { ISignalService, ISignalSidePolicies } from './interfaces';

@Injectable({
  providedIn: 'root'
})
export class SignalService implements ISignalService {

	constructor(private _api: ApiService) { }




	

	/**
	 * Retrieves the signal policies for a given side.
	 * @returns Promise<ISignalSidePolicies>
	 */
	public getPolicies(side: IBinancePositionSide): Promise<ISignalSidePolicies> {
		return this._api.request(
			"get","signal/getPolicies", 
			{ side: side }, 
			true
		);
	}






    /**
     * Updates the signal policies for the given side.
     * @param side
     * @param newStrategy
     * @param otp
     * @returns Promise<void>
     */
    public updatePolicies(side: IBinancePositionSide, newPolicies: ISignalSidePolicies, otp: string): Promise<void> { 
        return this._api.request("post","signal/updatePolicies", {
			side: side,
			newPolicies: newPolicies,
		}, true, otp);
    }
}
