import { IHTTPMethod } from "../external-request";


export interface IApiService {
    // Properties
    url: string,

    // Request
    request(
        method: IHTTPMethod,
		path: string,
		body?: {[key: string]: any},
        requiresAuth?: boolean,
        otp?: string,
        retried?: boolean
	): Promise<any>
}






/* API Response */
export interface IAPIResponse {
    success: boolean,
    data?: any,
    error?: string 
}