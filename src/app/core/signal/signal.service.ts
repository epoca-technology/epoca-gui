import { Injectable } from '@angular/core';
import { ApiService } from "../api";
import { IPredictionCancellationPolicies, ISignalService } from './interfaces';

@Injectable({
  providedIn: 'root'
})
export class SignalService implements ISignalService {

  	constructor(private _api: ApiService) { }




	/**
	 * Retrieves the updated server resources
	 * @returns Promise<IServerResources>
	 */
    public getPolicies(): Promise<IPredictionCancellationPolicies> {
		return this._api.request("get","signal/getPolicies", {}, true);
	}





	/**
	 * Updates the alarms configuration.
	 * @returns Promise<void>
	 */
    public updatePolicies(policies: IPredictionCancellationPolicies, otp: string): Promise<void> {
		return this._api.request("post","signal/updatePolicies", policies, true, otp);
	}
}
