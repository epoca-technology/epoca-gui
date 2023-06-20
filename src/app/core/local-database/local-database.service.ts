import { Injectable } from "@angular/core";
import Dexie from "dexie";
import { UtilsService } from "../utils";
import { IPositionRecord, PositionService } from "../position";
import { IReversalCoinsStates, IReversalState, MarketStateService } from "../market-state";
import { 
	ILocalDatabaseService,
	ILocalData,
	IUserPreferences,
	ILocalTableInfo
} from "./interfaces";




@Injectable({
  providedIn: "root"
})
export class LocalDatabaseService implements ILocalDatabaseService {
	// Database Name
	public readonly dbName: string = "LocalDatabase";

	// Database Instance
	private db?: Dexie;

	// Database State
	public initialized: boolean = false;
	public initError?: string;

	// Tables
	private userPreferences?: Dexie.Table;
	private reversalStates?: Dexie.Table;
	private reversalCoinsStates?: Dexie.Table;
	private positionRecords?: Dexie.Table;



  	constructor(
		private _ms: MarketStateService,
		private _position: PositionService,
		private _utils: UtilsService
	) { }






	/* Database Management */




	/**
	 * Initializes the Indexed Database and all the required tables.
	 * If for any reason it cannot be initialized, it will be marked
	 * as incompatible.
	 * @returns Promise<void>
	 */
	public async initialize(): Promise<void> {
		// Make sure indexed db exists in the window
		if (window && window.indexedDB) {
			// Attempt to initialize and open the DB
			try {
				// Initialize DB
				this.db = new Dexie(this.dbName);
				this.db.version(1).stores({
					userPreferences: "id",
					reversalStates: "id",
					reversalCoinsStates: "id",
					positionRecords: "id",
				});
				
				// Open the database
				await this.db.open();
				
				// Initialize Tables
				this.userPreferences = this.db.table("userPreferences");
				this.reversalStates = this.db.table("reversalStates");
				this.reversalCoinsStates = this.db.table("reversalCoinsStates");
				this.positionRecords = this.db.table("positionRecords");

				// Update the init state
				this.initialized = true;
			} catch (e) {
				console.log(e);
				this.initError = this._utils.getErrorMessage(e);
			}
		} else {
			this.initError = "The window object does not contain the indexedDB property.";
		}
	} 





	

	
	/*
	* Deletes the entire database. If it hadn't been initialized,
	* it throws the init error.
	* @returns Promise<void>
	* */
	public async delete(): Promise<void> {
		// Attempt to initialize the db in case it hadn't been
		if (!this.initialized) await this.initialize();

		// If it is not compatible, throw the init error
		if (!this.initialized) throw new Error(this.initError);
		
		// Attempt to write
		await this.db!.delete();
	}







	/**
	 * Retrieves a list of table records containing general info
	 * about them.
	 * @returns Promise<ILocalTableInfo[]> 
	 */
	public async getTablesInfo(): Promise<ILocalTableInfo[]> {
		// Attempt to initialize the db in case it hadn't been
		if (!this.initialized) await this.initialize();

		// If it is not compatible, throw the init error
		if (!this.initialized) throw new Error(this.initError);

		return [
			{ name: "userPreferences", records: await this.userPreferences!.count()},
			{ name: "reversalStates", records: await this.reversalStates!.count()},
			{ name: "reversalCoinsStates", records: await this.reversalCoinsStates!.count()},
			{ name: "positionRecords", records: await this.positionRecords!.count()},
		];
	}







	/* User Preferences */





	/**
	 * Retrieves the User Preference Object. If it hasn't been set,
	 * it returns the default object.
	 * @returns Promise<IUserPreferences>
	 */
	public async getUserPreferences(): Promise<IUserPreferences> {
		// Attempt to initialize the db in case it hadn't been
		if (!this.initialized) await this.initialize();

		// Init the default obj
		const pref: IUserPreferences = this.getDefaultUserPreferences();

		// If it is not compatible, return the default obj
		if (!this.initialized) return pref;

		try {
			// Read the data and return it if found, otherwise, return the default obj
			const localData: ILocalData = await this.userPreferences!.where("id").equals(0).first();
			if (localData && localData.data) { return localData.data } else { return pref }
		} catch (e) {
			console.error(e);
			return pref;
		}
	}




	/**
	 * Saves the preferences obj into the database.
	 * @param pref
	 * @returns Promise<void>
	 */
	public async saveUserPreferences(pref: IUserPreferences): Promise<void> {
		// Attempt to initialize the db in case it hadn't been
		if (!this.initialized) await this.initialize();

		// If it is not compatible, end it
		if (!this.initialized) return;
		
		// Attempt to write
		try {
			await this.userPreferences!.put(<ILocalData> { id: 0, data: pref });
		} catch (e) { console.error(e) }
	}




	/**
	 * Retrieves the default user preferences object.
	 * @returns IUserPreferences
	 */
	public getDefaultUserPreferences(): IUserPreferences { 
		return { 
			sound: false,
		};
	}















	/* Data Caching */











	/*****************************
	 * Reversal State Management *
	 *****************************/



	/**
	 * Retrieves, stores and returns a reversal state. Note that it 
	 * is only stored if the reversal has been ended.
	 * @param id 
	 * @returns Promise<IReversalState>
	 */
	public async getReversalState(id: number): Promise<IReversalState> {
		// Attempt to initialize the db in case it hadn't been
		if (!this.initialized) await this.initialize();

		// If it is not compatible, return the original call right away
		if (!this.initialized) return this._ms.getReversalState(id);

		/**
		 * Check if the record is currently stored, in the case of an error when interacting
		 * with the db, handle it and return the original call.
		 */
		try {
			// Read the data and return it if found
			const localData: ILocalData = await this.reversalStates!.where("id").equals(id).first();
			if (localData && localData.data) { return localData.data } 

			// If it isn't found, retrieve it, store it and return it
			else { 
				// Perform the request
				const record: IReversalState = await this._ms.getReversalState(id);

				// Attempt to save it if the reversal has ended
				if (record.end) {
					try {
						await this.reversalStates!.put(<ILocalData> { id: id, data: record });
					} catch (e) { console.error(e) }
				}

				// Finally, return it
				return record; 
			}
		} catch (e) {
			console.error(e);
			return this._ms.getReversalState(id);
		}
	}







	/**
	 * Retrieves, stores and returns a reversal coins' states. Note that it 
	 * is only stored if the reversal has been ended.
	 * @param id 
	 * @param endTS 
	 * @returns Promise<IReversalCoinsStates>
	 */
	public async getReversalCoinsStates(id: number, endTS: number|null): Promise<IReversalCoinsStates> {
		// Attempt to initialize the db in case it hadn't been
		if (!this.initialized) await this.initialize();

		// If it is not compatible, return the original call right away
		if (!this.initialized) return this._ms.getReversalCoinsStates(id);

		/**
		 * Check if the record is currently stored, in the case of an error when interacting
		 * with the db, handle it and return the original call.
		 */
		try {
			// Read the data and return it if found
			const localData: ILocalData = await this.reversalCoinsStates!.where("id").equals(id).first();
			if (localData && localData.data) { return localData.data } 

			// If it isn't found, retrieve it, store it and return it
			else { 
				// Perform the request
				const record: IReversalCoinsStates = await this._ms.getReversalCoinsStates(id);

				// Attempt to save it if the reversal has ended
				if (endTS) {
					try {
						await this.reversalCoinsStates!.put(<ILocalData> { id: id, data: record });
					} catch (e) { console.error(e) }
				}

				// Finally, return it
				return record; 
			}
		} catch (e) {
			console.error(e);
			return this._ms.getReversalCoinsStates(id);
		}
	}











	/******************************
	 * Position Record Management *
	 ******************************/





	/**
	 * Retrieves, stores and returns a position record. Note that it 
	 * is only stored if the position has been closed.
	 * @param id 
	 * @returns Promise<IPositionRecord>
	 */
	public async getPositionRecord(id: string): Promise<IPositionRecord> {
		// Attempt to initialize the db in case it hadn't been
		if (!this.initialized) await this.initialize();

		// If it is not compatible, return the original call right away
		if (!this.initialized) return this._position.getPositionRecord(id);

		/**
		 * Check if the record is currently stored, in the case of an error when interacting
		 * with the db, handle it and return the original call.
		 */
		try {
			// Read the data and return it if found
			const localData: ILocalData = await this.positionRecords!.where("id").equals(id).first();
			if (localData && localData.data) { return localData.data } 

			// If it isn't found, retrieve it, store it and return it
			else { 
				// Perform the request
				const record: IPositionRecord = await this._position.getPositionRecord(id);

				// Attempt to save it if the position has been closed
				if (record.close) {
					try {
						await this.positionRecords!.put(<ILocalData> { id: id, data: record });
					} catch (e) { console.error(e) }
				}

				// Finally, return it
				return record; 
			}
		} catch (e) {
			console.error(e);
			return this._position.getPositionRecord(id);
		}
	}

}
