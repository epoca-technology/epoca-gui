import { HttpClient, HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { IExternalRequestService, IHTTPMethod, IRequestBody, IRequestOptions } from './interfaces';
import {Observable, throwError} from "rxjs";
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ExternalRequestService implements IExternalRequestService {

    constructor(private http: HttpClient) { }







	/*
	* Sends a post|get|put|delete request
	* and handles the error accordingly
	* @param method
	* @param url
	* @param body?
	* @param options? - set { observe: 'response' } to get a full HttpResponse
	* @returns Observable<HttpResponse<any>>
	* */
	public request(
		method: IHTTPMethod,
		url: string,
		body?: IRequestBody|null,
		options?: IRequestOptions): Observable<HttpResponse<any>|any> {
		switch (method) {
			case 'post':
				return this.http.post(url, body, options).pipe(catchError(ExternalRequestService.handleError));
			case 'get':
                if (options && body) options.params = body;
				return this.http.get(url, options).pipe(catchError(ExternalRequestService.handleError));
			case 'put':
				return this.http.put(url, body, options).pipe(catchError(ExternalRequestService.handleError));
			case 'delete':
				return this.http.delete(url, options).pipe(catchError(ExternalRequestService.handleError));
            default:
                throw new Error(`[ExternalRequest]: An invalid HTTP method (${method}) has been provided.`)
		}
	}







	
	/*
	* Handles an error that could've been caused
	* by the server returning a 404 or 500 or
	* something could've gone wrong on the
	* client side
	* @param error
	*
	* */
	private static handleError(error: HttpErrorResponse) {
		return throwError(() => { throw error });
	};
}
