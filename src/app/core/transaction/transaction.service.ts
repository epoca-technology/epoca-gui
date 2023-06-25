import { Injectable } from '@angular/core';
import { ApiService } from "../api";
import { UtilsService } from '../utils';
import { IAccountBalance, IAccountIncomeRecord, ITransactionService } from './interfaces';

@Injectable({
  providedIn: 'root'
})
export class TransactionService implements ITransactionService {

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
		return this._api.request("post","transaction/syncBalance", {}, true, otp);
	}





	/**
	 * Retrieves the current account balance.
	 * @returns Promise<IAccountBalance>
	 */
	public getBalance(): Promise<IAccountBalance> {
		return this._api.request("get","transaction/getBalance", {}, true);
	}









	/**************************
	 * Futures Income Records * 
	 **************************/









	/**
	 * Retrieves the list of income records for a given date range.
	 * @returns Promise<IAccountIncomeRecord[]>
	 */
	public listIncomeRecords(startAt: number, endAt: number): Promise<IAccountIncomeRecord[]> {
		return this._api.request("get","transaction/listIncomeRecords", {startAt: startAt, endAt: endAt}, true);
	}







	/**
	 * Syncs the futures account income records in the background
	 * @param otp
	 * @returns Promise<IAccountBalance>
	 */
	public syncIncome(otp: string): Promise<IAccountBalance> { 
		return this._api.request("post","transaction/syncIncome", {}, true, otp);
	}
}
