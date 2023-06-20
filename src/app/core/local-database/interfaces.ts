import { IReversalCoinsStates, IReversalState } from "../market-state";
import { IPositionRecord } from "../position";



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

    // Reversal State Management
    getReversalState(id: number): Promise<IReversalState>,
    getReversalCoinsStates(id: number, endTS: number|null): Promise<IReversalCoinsStates>,

    // Position Record Management
    getPositionRecord(id: string): Promise<IPositionRecord>,
}






/**
 * User Preferences
 * A persistent object containing user input configurations to enhance
 * the interaction experience.
 */
export interface IUserPreferences {
    // If enabled, sound features will be enabled throughout the app
    sound: boolean,
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
