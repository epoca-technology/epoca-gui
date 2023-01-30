import { ICandlestick } from "../candlestick";
import { IEpochRecord } from "../epoch";
import { IPrediction, IPredictionModelCertificate, IRegressionTrainingCertificate } from "../epoch-builder";
import { IPredictionCandlestick } from "../prediction";



// Service
export interface ILocalDatabaseService {
    // Properties
    dbName: string,
    compatible?: boolean,
    initError?: string,

    // Database Management
    initialize(): Promise<void>,
    delete(): Promise<void>,
    getTablesInfo(): Promise<ILocalTableInfo[]>,

    // User Preferences
    getUserPreferences(): Promise<IUserPreferences>,
    saveUserPreferences(pref: IUserPreferences): Promise<void>,
    getDefaultUserPreferences(): IUserPreferences,

    /* Data Caching */

    // Epoch
    getEpochRecord(epochID: string): Promise<IEpochRecord|undefined>,

    // Certificates
    getPredictionModelCertificate(id: string): Promise<IPredictionModelCertificate>,
    getRegressionCertificate(id: string): Promise<IRegressionTrainingCertificate>,

    // Candlesticks
    getCandlesticksForPeriod(start: number, end: number, serverTime: number, intervalMinutes?: number): Promise<ICandlestick[]>,

    // Epoch Prediction Candlesticks
    listPredictionCandlesticks(
		epochID: string, 
		startAt: number, 
		endAt: number, 
		epochInstalled: number,
		serverTime: number
	): Promise<IPredictionCandlestick[]>,
}






/**
 * User Preferences
 * A persistent object containing user input configurations to enhance
 * the interaction experience.
 */
export interface IUserPreferences {
    // If enabled, sound features will be enabled throughout the app
    sound: boolean,

    // If enabled, it will display the split trend chart by default
    splitTrendChart: boolean,

    // If enabled, it will display the PNL(ROE%) on the position button rather than the Position Health info
    positionButtonPNL: boolean
}





/**
 * Local Table Information
 * An object with general information regarding a table.
 */
export interface ILocalTableInfo {
    name: string,
    records: number
}




/**
 * Local Data
 * The data is stored in an object that contains the identifier and
 * the data property which can contain anything.
 */
export type ILocalData = ILocalDataObject|undefined;
export interface ILocalDataObject {
	id?: number|string,
	data: any
}
