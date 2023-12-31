import { Injectable } from '@angular/core';
import { ApiService } from '../api';
import { IGuiVersionService } from './interfaces';

@Injectable({
  providedIn: 'root'
})
export class GuiVersionService implements IGuiVersionService {

    constructor(private _api: ApiService) { }



    /**
     * Updates the current GUI Version.
     * @returns Promise<void>
     */
    public update(version: string, otp: string): Promise<void> {
		return this._api.request('post','guiVersion/update', {version: version}, true, otp);
	}
}
