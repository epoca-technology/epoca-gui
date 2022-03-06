import { Injectable } from '@angular/core';
import { ApiService } from '../api';
import { IDatabaseManagementService, IDatabaseSummary } from './interfaces';

@Injectable({
  providedIn: 'root'
})
export class DatabaseManagementService implements IDatabaseManagementService {

    constructor(private _api: ApiService) { }



    /* Database Summary */




    /**
     * Retrieves the DB Summary.
     * @returns Promise<IDatabaseSummary>
     */
     public getDatabaseSummary(): Promise<IDatabaseSummary> {
		return this._api.request('get','database/getDatabaseSummary', {}, true);
	}







}
