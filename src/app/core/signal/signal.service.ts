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
}
