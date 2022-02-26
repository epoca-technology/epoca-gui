import { IHTTPMethod } from "../external-request";


export interface IApiService {
    request(
        method: IHTTPMethod,
		path: string,
		body?: {[key: string]: any},
	): Promise<any>
}






/* API Response */
export interface IAPIResponse {
    success: boolean,
    data?: any,
    error?: string 
}