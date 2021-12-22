import {HttpHeaders, HttpParams, HttpResponse} from '@angular/common/http';
import {Observable} from 'rxjs';


// Service
export interface IExternalRequestService {
    request(
		method: IHTTPMethod,
		url: string,
		body?: IRequestBody|null,
		options?: IRequestOptions): Observable<HttpResponse<any>|any>
}


// HTTP Methods
export type IHTTPMethod = 'post'|'get'|'put'|'delete';


// Request Body
export interface IRequestBody {
	[key: string]: any
}



// Request Options
export interface IRequestOptions {
	headers?: HttpHeaders | {
		[header: string]: string | string[];
	};
	observe?: 'body';
	params?: HttpParams | {
		[param: string]: string | string[];
	};
	reportProgress?: boolean;
	responseType?: 'json';
	withCredentials?: boolean;
}



// Headers Config
export interface IHeadersConfig {
	[name: string]: string|string[]
}