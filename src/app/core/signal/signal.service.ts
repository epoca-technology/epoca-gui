import { Injectable } from '@angular/core';
import { ApiService } from '../api';
import { ISignalPolicies, ISignalRecord } from './interfaces';

@Injectable({
  providedIn: 'root'
})
export class SignalService {

	constructor(private _api: ApiService) { }





	/******************************
	 * Signal Policies Management *
	 ******************************/




	/**
	 * Retrieves the signal policies.
	 * @returns Promise<ISignalSidePolicies>
	 */
	public getPolicies(): Promise<ISignalPolicies> {
		return this._api.request(
			"get","signal/getPolicies", 
			{ }, 
			true
		);
	}






    /**
     * Updates the signal policies.
     * @param newStrategy
     * @param otp
     * @returns Promise<void>
     */
    public updatePolicies(newPolicies: ISignalPolicies, otp: string): Promise<void> { 
        return this._api.request("post","signal/updatePolicies", {
			newPolicies: newPolicies,
		}, true, otp);
    }









	/******************
	 * Signal Records *
	 ******************/




	/**
	 * Retrieves the signal records for a given date range
	 * @param startAt
	 * @param endAt
	 * @returns Promise<ISignalRecord[]>
	 */
	public getSignalRecords(startAt: number, endAt: number): Promise<ISignalRecord[]> {
		return this._api.request(
			"get","signal/getSignalRecords", 
			{ startAt: startAt, endAt: endAt }, 
			true
		);
	}
}
