import { Injectable } from '@angular/core';
import { ApiService } from '../api';
import { IServerService, IServerData, IServerResources } from './interfaces';

@Injectable({
  providedIn: 'root'
})
export class ServerService implements IServerService {

    constructor(
        private _api: ApiService
    ) { }






    /* Retrievers */





	/**
	 * Retrieves the server data object that contains both, info &
     * resources
	 * @returns Promise<IServerData>
	 */
     public getServerData(): Promise<IServerData> {
		return this._api.request('get','server/getServerData', {});
	}








	/**
	 * Retrieves the updated server resources
	 * @returns Promise<IServerResources>
	 */
     public getServerResources(): Promise<IServerResources> {
		return this._api.request('get','server/getServerResources', {});
	}
}
