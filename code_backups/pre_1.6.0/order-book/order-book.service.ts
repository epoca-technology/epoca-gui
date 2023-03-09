import { Injectable } from '@angular/core';
import { ApiService } from "../api";
import { IOrderBookService, IOrderBook } from './interfaces';

@Injectable({
  providedIn: 'root'
})
export class OrderBookService implements IOrderBookService{

    constructor(
		private _api: ApiService
	) { }




	/**
	 * Retrieves order book at the last known state. Invoking this
	 * endpoint does not force a sync.
	 * @returns Promise<IOrderBook|undefined>
	 */
	 public getBook(): Promise<IOrderBook|undefined> {
		return this._api.request(
			"get","orderBook/get", 
			{}, 
			true
		);
	}
}
