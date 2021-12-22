import { IHTTPMethod } from "../external-request";


export interface IApiService {
    request(
        method: IHTTPMethod,
		path: string,
		body?: {[key: string]: any},
	): Promise<any>
}





export interface IApiURL {
    useLocal: boolean,
    local: string,
    external: string
}