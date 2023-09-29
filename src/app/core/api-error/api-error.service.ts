import { Injectable } from "@angular/core";
import { ApiService } from "../api";
import { IApiError } from "./interfaces";

@Injectable({
  providedIn: "root"
})
export class ApiErrorService {

    constructor(private _api: ApiService) { }





    /* Retrievers */




    






    /* Cleaner */






    /**
     * Deletes all the api errors from the database.
     * @returns Promise<IApiError[]>
     */
    public deleteAll(otp: string): Promise<IApiError[]> { 
        return this._api.request("post","apiError/deleteAll", {}, true, otp);
    }
}
