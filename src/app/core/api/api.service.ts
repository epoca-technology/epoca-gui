import { Injectable } from '@angular/core';
import { HttpHeaders } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { environment } from 'src/environments/environment';
import { IApiService, IAPIResponse } from './interfaces';
import { ExternalRequestService, IHeadersConfig, IHTTPMethod } from '../external-request';
import { AuthService } from '../auth';
import { UtilsService } from '../utils';

@Injectable({
  providedIn: 'root'
})
export class ApiService implements IApiService {
    // API URL
    private readonly url: string = environment.localServer ? environment.apiURL.local: environment.apiURL.external;




    constructor(
        private _request: ExternalRequestService,
        private _auth: AuthService,
        private _utils: UtilsService
    ) { }











	
	/*
	* Sends a request to the API following requirements
	* @param method - The method to be used, defaults to 'post'
	* @param path - path of the url / if http params needed must be specified here
	* @param body? - params to send
	* @param requiresAuth?
	* @param otp?
	* @param retried?
	* @return Promise<any>
	* */
	public async request(
        method: IHTTPMethod,
		path: string,
		body?: {[key: string]: any},
        requiresAuth?: boolean,
        otp?: string,
        retried?: boolean
	): Promise<any> {
		// Init values
		const finalBody: any = body || {};
        const finalOTP: string = otp || '';
        let idToken: string = '';
        let apiSecret: string = '';

        // Check if the request requires auth
        if (requiresAuth) {
            // Retrieve the ID Token and the API Secret
            const values: [string, string] = await Promise.all([
                this._auth.getIDToken(),
                this._auth.getAPISecret(),
            ]);
            idToken = values[0];
            apiSecret = values[1];
        }

        // Build the Headers
		const headersConfig: IHeadersConfig = {
			'Content-Type': 'application/json',
            'id-token': idToken,
            'api-secret': apiSecret,
            'otp': finalOTP,
		};
		
		// Build URL
		const url: string = `${this.url}/${path}`;
		
		// Initialize http options
		const httpOptions = {
			headers: new HttpHeaders(headersConfig)
		};

        // Send the request
        const apiResponse: IAPIResponse = await lastValueFrom(this._request.request(method, url, finalBody, httpOptions));

        // Check if the request was successful
        if (apiResponse && apiResponse.success) {
            // Return the response data if any
            return apiResponse.data;
        } 
        
        // If the request was unsuccessful, check if the error can be fixed and try again if so
        else {
            // Init error values
            const errorMessage: string = apiResponse && apiResponse.error ? apiResponse.error: 'The request received an incomplete API Response object.';

            // If it hasn't retried, check if the error can be fixed
            if (requiresAuth && !retried) {
                // Retrieve the error code
                const code: number = this._utils.getCodeFromApiError(errorMessage);

                // Check if the ID Token needs to be refreshed
                // @TODO

                // Check if the API Secret needs to be refreshed
                if (
                    code == 9003 || // The uid (${uid}) provided an api secret with an invalid format: ${secret}.
                    code == 9004    // The uid (${uid}) provided an api secret that didnt match the one stored locally: ${secret}.
                ) {
                    // Mark the secret as invalid
                    this._auth.apiSecretIsInvalid();

                    // Retry the request
                    return await this.request(method, path, body, requiresAuth, otp, true);
                }
            }

            // Throw the API Error
            throw new Error(errorMessage);
        }
	}
}
