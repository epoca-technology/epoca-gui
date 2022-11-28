import { Injectable } from "@angular/core";
import { ApiService } from "../api";
import { IAppBulk, IBulkDataService, IServerDataBulk, IServerResourcesBulk } from "./interfaces";

@Injectable({
  providedIn: "root"
})
export class BulkDataService implements IBulkDataService {

	constructor(private _api: ApiService) { }





	/* App Bulk Retrievers */




	/**
	 * Retrieves an up-to-date app bulk from the server.
	 * @returns Promise<IAppBulk>
	 */
	public getAppBulk(epochID: string|undefined): Promise<IAppBulk> { 
		return this._api.request("get","bulkData/getAppBulk", {epochID: String(epochID)}, true) 
	}








	/* Server Bulk Retrievers */







	/**
	 * Retrieves an up-to-date server data bulk.
	 * @returns Promise<IServerDataBulk>
	 */
	public getServerDataBulk(): Promise<IServerDataBulk> { 
		return this._api.request("get","bulkData/getServerDataBulk", {}, true) 
	}






	/**
	 * Retrieves an up-to-date server resources bulk.
	 * @returns Promise<IServerResourcesBulk>
	 */
	public getServerResourcesBulk(): Promise<IServerResourcesBulk> { 
		return this._api.request("get","bulkData/getServerResourcesBulk", {}, true) 
	}




}
