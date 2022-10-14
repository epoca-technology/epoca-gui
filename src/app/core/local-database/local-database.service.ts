import { Injectable } from "@angular/core";
import Dexie from "dexie";
import { EpochService, IEpochRecord, IEpochSummary } from "../epoch";
import { IPredictionModelCertificate, IRegressionTrainingCertificate } from "../epoch-builder";
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
	public compatible?: boolean;
	public initError?: string;

	// Tables
	private userPreferences?: Dexie.Table;
	private epochRecords?: Dexie.Table;
	private epochSummaries?: Dexie.Table;
	private predictionModelCertificates?: Dexie.Table;
	private regressionCertificates?: Dexie.Table;



  	constructor(
		private _epoch: EpochService,
	) { 
		this.initialize()
			.then(() => { this.compatible = true })
			.catch(e => {
				console.log(e);
				this.compatible = false;
				this.initError = e.message;
			});
	}






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
			// Initialize DB
			this.db = new Dexie(this.dbName);
			this.db.version(1).stores({
				userPreferences: "++id",
				epochRecords: "++id, realID",
				epochSummaries: "++id, realID",
				predictionModelCertificates: "++id, realID",
				regressionCertificates: "++id, realID",
			});
			
			// Open the database
			await this.db.open();
			
			// Initialize Tables
			this.userPreferences = this.db.table("userPreferences");
			this.epochRecords = this.db.table("epochRecords");
			this.epochSummaries = this.db.table("epochSummaries");
			this.predictionModelCertificates = this.db.table("predictionModelCertificates");
			this.regressionCertificates = this.db.table("regressionCertificates");
		} else {
			throw new Error("The window object does not contain the indexedDB property.");
		}
	} 





	

	
	/*
	* Deletes the entire database. If it hadn't been initialized,
	* it throws the init error.
	* @returns Promise<void>
	* */
	public async delete(): Promise<void> {
		// If it is not compatible, throw the init error
		if (!this.compatible) throw new Error(this.initError);
		
		// Attempt to write
		await this.db!.delete();
	}







	/**
	 * Retrieves a list of table records containing general info
	 * about them.
	 * @returns Promise<ILocalTableInfo[]> 
	 */
	public async getTablesInfo(): Promise<ILocalTableInfo[]> {
		// If it is not compatible, throw the init error
		if (!this.compatible) throw new Error(this.initError);

		return [
			{ name: "userPreferences", records: await this.userPreferences!.count()},
			{ name: "epochRecords", records: await this.epochRecords!.count()},
			{ name: "epochSummaries", records: await this.epochSummaries!.count()},
			{ name: "predictionModelCertificates", records: await this.predictionModelCertificates!.count()},
			{ name: "regressionCertificates", records: await this.regressionCertificates!.count()},
		];
	}







	/* User Preferences */





	/**
	 * Retrieves the User Preference Object. If it hasn't been set,
	 * it returns the default object.
	 * @returns Promise<IUserPreferences>
	 */
	public async getUserPreferences(): Promise<IUserPreferences> {
		// Init the default obj
		const pref: IUserPreferences = { sound: false };

		// If it is not compatible, return the default obj
		if (!this.compatible) return pref;

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
		// If it is not compatible, end it
		if (!this.compatible) return;
		
		// Attempt to write
		try {
			await this.userPreferences!.put(<ILocalData> { id: 0, data: pref });
		} catch (e) { console.error(e) }
	}







	/* Data Caching */



	/**
	 * Retrieves, stores and returns an epoch record if the browser 
	 * is compatible.
	 * @param epochID 
	 * @returns Promise<IEpochRecord|undefined>
	 */
	 public async getEpochRecord(epochID: string): Promise<IEpochRecord|undefined> {
		// If it is not compatible, return the original call right away
		if (!this.compatible) return this._epoch.getEpochRecord(epochID);

		/**
		 * Check if the record is currently stored, in the case of an error when interacting
		 * with the db, handle it and return the original call.
		 */
		try {
			// Read the data and return it if found
			const localData: ILocalData = await this.epochRecords!.where("realID").equals(epochID).first();
			if (localData && localData.data) { return localData.data } 

			// If it isn't found, retrieve it, store it and return it
			else { 
				// Perform the request
				const record: IEpochRecord|undefined = await this._epoch.getEpochRecord(epochID);

				// Attempt to save it if found
				if (record) {
					try {
						await this.epochRecords!.add(<ILocalData> { realID: epochID, data: record });
					} catch (e) { console.error(e) }
				}

				// Finally, return it
				return record; 
			}
		} catch (e) {
			console.error(e);
			return this._epoch.getEpochRecord(epochID);
		}
	}






	/**
	 * Retrieves, stores and returns an epoch summary if the browser 
	 * is compatible.
	 * @param epochID 
	 * @returns Promise<IEpochSummary>
	 */
	public async getEpochSummary(epochID: string): Promise<IEpochSummary> {
		// If it is not compatible, return the original call right away
		if (!this.compatible) return this._epoch.getEpochSummary(epochID);

		/**
		 * Check if the record is currently stored, in the case of an error when interacting
		 * with the db, handle it and return the original call.
		 */
		try {
			// Read the data and return it if found
			const localData: ILocalData = await this.epochSummaries!.where("realID").equals(epochID).first();
			if (localData && localData.data) { return localData.data } 

			// If it isn't found, retrieve it, store it and return it
			else { 
				// Perform the request
				const summary: IEpochSummary = await this._epoch.getEpochSummary(epochID);

				// Attempt to save it
				try {
					await this.epochSummaries!.add(<ILocalData> { realID: epochID, data: summary });
				} catch (e) { console.error(e) }

				// Finally, return it
				return summary; 
			}
		} catch (e) {
			console.error(e);
			return this._epoch.getEpochSummary(epochID);
		}
	}





	/**
	 * Retrieves, stores and returns a prediction model certificate if the browser 
	 * is compatible.
	 * @param id 
	 * @returns Promise<IPredictionModelCertificate>
	 */
	 public async getPredictionModelCertificate(id: string): Promise<IPredictionModelCertificate> {
		// If it is not compatible, return the original call right away
		if (!this.compatible) return this._epoch.getPredictionModelCertificate(id);

		/**
		 * Check if the record is currently stored, in the case of an error when interacting
		 * with the db, handle it and return the original call.
		 */
		try {
			// Read the data and return it if found
			const localData: ILocalData = await this.predictionModelCertificates!.where("realID").equals(id).first();
			if (localData && localData.data) { return localData.data } 

			// If it isn't found, retrieve it, store it and return it
			else { 
				// Perform the request
				const cert: IPredictionModelCertificate = await this._epoch.getPredictionModelCertificate(id);

				// Attempt to save it
				try {
					await this.predictionModelCertificates!.add(<ILocalData> { realID: id, data: cert });
				} catch (e) { console.error(e) }

				// Finally, return it
				return cert; 
			}
		} catch (e) {
			console.error(e);
			return this._epoch.getPredictionModelCertificate(id);
		}
	}





	/**
	 * Retrieves, stores and returns a regression training certificate if the browser 
	 * is compatible.
	 * @param id 
	 * @returns Promise<IRegressionTrainingCertificate>
	 */
	 public async getRegressionCertificate(id: string): Promise<IRegressionTrainingCertificate> {
		// If it is not compatible, return the original call right away
		if (!this.compatible) return this._epoch.getRegressionCertificate(id);

		/**
		 * Check if the record is currently stored, in the case of an error when interacting
		 * with the db, handle it and return the original call.
		 */
		try {
			// Read the data and return it if found
			const localData: ILocalData = await this.regressionCertificates!.where("realID").equals(id).first();
			if (localData && localData.data) { return localData.data } 

			// If it isn't found, retrieve it, store it and return it
			else { 
				// Perform the request
				const cert: IRegressionTrainingCertificate = await this._epoch.getRegressionCertificate(id);

				// Attempt to save it
				try {
					await this.regressionCertificates!.add(<ILocalData> { realID: id, data: cert });
				} catch (e) { console.error(e) }

				// Finally, return it
				return cert; 
			}
		} catch (e) {
			console.error(e);
			return this._epoch.getRegressionCertificate(id);
		}
	}

}
