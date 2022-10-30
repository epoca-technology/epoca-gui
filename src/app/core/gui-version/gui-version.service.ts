import { Injectable } from '@angular/core';
import { ApiService } from '../api';
import { IGuiVersionService } from './interfaces';

@Injectable({
  providedIn: 'root'
})
export class GuiVersionService implements IGuiVersionService {

    constructor(private _api: ApiService) { }




    /**
     * Retrieves the current GUI Version.
     * @returns Promise<string>
	 * @DEPRECATED This route has been moved to BulkDataRoute.getAppBulk 
     */
	/*public get(): Promise<string> {
		return this._api.request('get','guiVersion/get', {}, true);
	}*/





    /**
     * Updates the current GUI Version.
     * @returns Promise<void>
     */
    public update(version: string, otp: string): Promise<void> {
		return this._api.request('post','guiVersion/update', {version: version}, true, otp);
	}
}
