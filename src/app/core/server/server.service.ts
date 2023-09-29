import { Injectable } from "@angular/core";
import { ApiService } from "../api";
import { IServerService, IServerData, IServerResources, IAlarmsConfig } from "./interfaces";

@Injectable({
  providedIn: "root"
})
export class ServerService implements IServerService {

    constructor(
        private _api: ApiService
    ) { }






    /* Retrievers */




    




    /* Alarms */



	/**
	 * Updates the alarms configuration.
	 * @returns Promise<void>
	 */
    public setAlarmsConfiguration(alarms: IAlarmsConfig, otp: string): Promise<void> {
		return this._api.request("post","server/setAlarmsConfiguration", alarms, true, otp);
	}
}
