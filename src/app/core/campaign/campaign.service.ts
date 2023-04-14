import { Injectable } from '@angular/core';
import { ApiService } from "../api";
import { UtilsService } from '../utils';
import { IAccountBalance, ICampaignService } from './interfaces';

@Injectable({
  providedIn: 'root'
})
export class CampaignService implements ICampaignService{



	constructor(
		private _api: ApiService,
		private _utils: UtilsService
	) { }




















	/***************************
	 * Futures Account Balance *
	 ***************************/





	/**
	 * Syncs the futures account balance and retrieves an updated copy.
	 * @param otp
	 * @returns Promise<IAccountBalance>
	 */
	public syncBalance(otp: string): Promise<IAccountBalance> { 
		return this._api.request("post","campaign/syncBalance", {}, true, otp);
	}





	/**
	 * Retrieves the current account balance.
	 * @returns Promise<IAccountBalance>
	 */
	public getBalance(): Promise<IAccountBalance> {
		return this._api.request("get","campaign/getBalance", {}, true);
	}
}
