import { Injectable } from '@angular/core';
import { HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { ExternalRequestService, IHeadersConfig, IHTTPMethod } from '../external-request';
import { IApiService, IAPIResponse } from './interfaces';
import { lastValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService implements IApiService {
    // API URL
    private readonly url: string = environment.localServer ? environment.apiURL.local: environment.apiURL.external;




    constructor(
        private _request: ExternalRequestService
    ) { }











	
	/*
	* Sends a request to the API following requirements
	* @param method - The method to be used, defaults to 'post'
	* @param path - path of the url / if http params needed must be specified here
	* @param body? - params to send
	* @return Promise<any>
	* */
	public async request(
        method: IHTTPMethod,
		path: string,
		body?: {[key: string]: any},
	): Promise<any> {
		// Init main values
		const finalBody: any = body || {};
		const headersConfig: IHeadersConfig = {
			'Content-Type': 'application/json'
		};
		
		// Build URL
		const url: string = `${this.url}/${path}`;
		
		// Initialize http options
		const httpOptions = {
			headers: new HttpHeaders(headersConfig)
		};
		
		// Send Request to Server
		return lastValueFrom(this._request.request(method, url, finalBody, httpOptions))
				.then((apiResponse: IAPIResponse) => {
					if (apiResponse && apiResponse.success) {
						return apiResponse.data;
					} else {
						throw new Error(apiResponse && apiResponse.error ? apiResponse.error: 'The request received an incomplete API Response object.');
					}
				});
	}
}
