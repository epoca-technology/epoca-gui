import { Injectable } from '@angular/core';
import { ApiService } from '../api';
import { IIPBlacklistService, IIPBlacklistRecord } from './interfaces';

@Injectable({
  providedIn: 'root'
})
export class IpBlacklistService implements IIPBlacklistService{

    constructor(private _api: ApiService) { }


    /* Retrievers */





    /**
     * Retrieves a list of all the existing blacklisted ips in the db.
     * @returns Promise<IIPBlacklistRecord[]>
     */
     public getAll(): Promise<IIPBlacklistRecord[]> { return this._api.request('get','ipBlacklist/getAll', {}, true) }










    /* IP Management */







    /**
     * Registers an IP in the blacklist and retrieves the fresh list of ips.
     * @param ip 
     * @param notes 
     * @param otp 
     * @returns Promise<IIPBlacklistRecord[]>
     */
    public registerIP(ip: string, notes: string|undefined, otp: string): Promise<IIPBlacklistRecord[]> { 
        return this._api.request('post','ipBlacklist/registerIP', {ip: ip, notes: notes}, true, otp);
    }







    /**
     * Updates the records notes and retrieves the fresh list of ips.
     * @param ip 
     * @param newNotes 
     * @param otp 
     * @returns Promise<IIPBlacklistRecord[]>
     */
     public updateNotes(ip: string, newNotes: string, otp: string): Promise<IIPBlacklistRecord[]> { 
        return this._api.request('post','ipBlacklist/updateNotes', {ip: ip, newNotes: newNotes}, true, otp);
    }








    /**
     * Unregisters an IP and retrieves the fresh list of ips.
     * @param ip 
     * @param otp 
     * @returns Promise<IIPBlacklistRecord[]>
     */
     public unregisterIP(ip: string, otp: string): Promise<IIPBlacklistRecord[]> { 
        return this._api.request('post','ipBlacklist/unregisterIP', {ip: ip}, true, otp);
    }
}
