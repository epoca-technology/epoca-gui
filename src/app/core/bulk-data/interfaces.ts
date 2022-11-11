import { IApiError } from "../api-error"
import { IEpochRecord } from "../epoch"
import { IServerData, IServerResources } from "../server"
import { IPredictionState } from "../prediction"
import { IPrediction } from "../epoch-builder"




// Service
export interface IBulkDataService {
    // App Bulk Retrievers
    getAppBulk(): Promise<IAppBulk>,

    // Server Bulk Retrievers
    getServerDataBulk(): Promise<IServerDataBulk>,
    getServerResourcesBulk(): Promise<IServerResourcesBulk>
}








/**
 * App Bulk
 * The app bulk is an object containing all the data required by the
 * GUI to operate and stay in sync with the server.
 */
 export interface IAppBulk {
    // The current time of the server. The user's time should not be trusted
    serverTime: number,

    // The current version of the GUI
    guiVersion: string,

    // The record of the active epoch. If none is active, it will be undefined
    epoch: IEpochRecord|undefined,

    // The active prediction. If there isn't one, or an epoch isn't active, it will be undefined
    prediction: IPrediction|undefined,

    // The active prediction state. If there isn't one, or an epoch isn't active, it will be undefined
    predictionState: IPredictionState,

    // The active trading session metrics. If there isn't one, it will be undefined
    tradingSession: object|undefined, // @TODO

    // The active coin stacker session. If there isn't one, it will be undefined
    coinStackerSession: object|undefined // @TODO
}







/**
 * Server Data Bulk
 * The server data bulk is an object containing all the server data,
 * as well as the API Errors.
 */
export interface IServerDataBulk {
    // The server data object containing current state and resources
    serverData: IServerData,

    // The list of API errors
    apiErrors: IApiError[]
}





/**
 * Server Resources Bulk
 * The server resources bulk is an object containing a minified server resources object,
 * as well as the API Errors.
 */
 export interface IServerResourcesBulk {
    // The server data object containing current state and resources
    serverResources: IServerResources,

    // The list of API errors
    apiErrors: IApiError[]
}