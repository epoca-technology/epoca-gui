import { Injectable } from '@angular/core';
import { ApiService } from '../api';
import { IApiError } from './interfaces';

@Injectable({
  providedIn: 'root'
})
export class ApiErrorService {

    constructor(private _api: ApiService) { }





    /* Retrievers */




    /**
     * Retrieves a list of all the existing api errors in the db.
     * @returns Promise<IApiError[]>
     */
     public getAll(): Promise<IApiError[]> { return this._api.request('get','apiError/getAll', {}, true) }








    /* Cleaner */






    /**
     * Deletes all the api errors from the database.
     * @returns Promise<IApiError[]>
     */
     public deleteAll(otp: string): Promise<IApiError[]> { 
        return this._api.request('post','apiError/deleteAll', {}, true, otp);
    }
}
