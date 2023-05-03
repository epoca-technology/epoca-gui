import { IApiError } from "../api-error"
import { IEpochRecord } from "../epoch"
import { IServerData, IServerResources } from "../server"
import { IPrediction } from "../epoch-builder"
import { 
    ICoinsState,
    IKeyZoneState,
    IMarketState, 
    IMinifiedLiquidityState, 
    IMinifiedReversalState, 
    ISplitStates, 
    IStateType,
    IVolumeStateIntensity, 
} from "../market-state"
import { IActivePositionHeadlines } from "../position";
import { ICandlestick } from "../candlestick"
import { IPredictionCandlestick } from "../prediction"




// Service
export interface IBulkDataService {
    // App Bulk Retrievers
    getAppBulk(epochID: string|undefined): Promise<IAppBulk>,

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

    /**
     * The record of the active epoch which can come in several states. 
     * IEpochRecord: There is an active epoch that has not been yet retrieved by the client.
     * undefined: No epoch is currently active
     * "keep": The client's epoch is up to date and can be kept
     */
    epoch: IEpochRecord|"keep"|undefined,

    // The active prediction. If there isn't one, or an epoch isn't active, it will be undefined
    prediction: IPrediction|undefined,

    // The list of active position headlines
    positions: IActivePositionHeadlines,

    // The active market state.
    marketState: IMarketState,

    // The number of api errors in existance
    apiErrors: number,

    // The minimum score requirement for a KeyZone to issue an event
    keyzoneEventScoreRequirement: number
}





/**
 * App Bulk Stream
 * A compressed version of the App Bulk that is updated at a high
 * frequency.
 */
export interface IAppBulkStream {
    // The active prediction. If there isn't one, or an epoch isn't active, it will be undefined
    prediction: IPrediction|undefined,

    // The list of active position headlines
    positions: IActivePositionHeadlines,

    // The active market state.
    marketState: ICompressedMarketState,

    // The number of api errors in existance
    apiErrors: number,
}




/**
 * Compressed Market State
 * In order to reduce the bandwidth, the market state is compressed
 * and then decompressed when downloaded from the GUI.
 */
export interface ICompressedMarketState {
    window: ICompressedWindowState,
    volume: IVolumeStateIntensity,
    liquidity: IMinifiedLiquidityState,
    keyzones: IKeyZoneState,
    trend: ICompressedTrendState,
    coins: ICoinsState,
    coinsBTC: ICoinsState,
    reversal: IMinifiedReversalState
}

export interface ICompressedWindowState {
    // The state of the window
    s: IStateType,

    // The split states payload
    ss: ISplitStates,
    
    // The current prediction candlestick
    w: ICandlestick
}

export interface ICompressedTrendState {
    // The state of the trend
    s: IStateType,

    // The split states payload
    ss: ISplitStates,

    // The current epoch prediction candlestick
    w: IPredictionCandlestick
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