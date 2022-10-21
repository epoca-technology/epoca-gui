import { Injectable } from "@angular/core";
import Dexie from "dexie";
import * as moment from "moment";
import { UtilsService } from "../utils";
import { EpochService, IEpochRecord, IEpochSummary } from "../epoch";
import { CandlestickService, ICandlestick } from "../candlestick";
import { IPredictionCandlestick, PredictionService } from "../prediction";
import { IPrediction, IPredictionModelCertificate, IRegressionTrainingCertificate } from "../epoch-builder";
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
	private epochRecords?: Dexie.Table;
	private epochSummaries?: Dexie.Table;
	private predictionModelCertificates?: Dexie.Table;
	private regressionCertificates?: Dexie.Table;
	private predictionCandlesticks?: Dexie.Table;
	private predictions?: Dexie.Table;
	private starredPredictions?: Dexie.Table;
	private epochPredictionCandlesticks?: Dexie.Table;



  	constructor(
		private _epoch: EpochService,
		private _candlestick: CandlestickService,
		private _prediction: PredictionService,
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
					userPreferences: "++id",
					epochRecords: "++id, realID",
					epochSummaries: "++id, realID",
					predictionModelCertificates: "++id, realID",
					regressionCertificates: "++id, realID",
					predictionCandlesticks: "++id, realID",
					predictions: "++id, realID",
					starredPredictions: "++id, realID",
					epochPredictionCandlesticks: "++id, realID",
				});
				
				// Open the database
				await this.db.open();
				
				// Initialize Tables
				this.userPreferences = this.db.table("userPreferences");
				this.epochRecords = this.db.table("epochRecords");
				this.epochSummaries = this.db.table("epochSummaries");
				this.predictionModelCertificates = this.db.table("predictionModelCertificates");
				this.regressionCertificates = this.db.table("regressionCertificates");
				this.predictionCandlesticks = this.db.table("predictionCandlesticks");
				this.predictions = this.db.table("predictions");
				this.starredPredictions = this.db.table("starredPredictions");
				this.epochPredictionCandlesticks = this.db.table("epochPredictionCandlesticks");

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
			{ name: "epochRecords", records: await this.epochRecords!.count()},
			{ name: "epochSummaries", records: await this.epochSummaries!.count()},
			{ name: "predictionModelCertificates", records: await this.predictionModelCertificates!.count()},
			{ name: "regressionCertificates", records: await this.regressionCertificates!.count()},
			{ name: "predictionCandlesticks", records: await this.predictionCandlesticks!.count()},
			{ name: "predictions", records: await this.predictions!.count()},
			{ name: "starredPredictions", records: await this.starredPredictions!.count()},
			{ name: "epochPredictionCandlesticks", records: await this.epochPredictionCandlesticks!.count()},
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
		const pref: IUserPreferences = { sound: false };

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







	/* Data Caching */










	/********************
	 * Epoch Management *
	 ********************/




	/**
	 * Retrieves, stores and returns an epoch record if the browser 
	 * is compatible.
	 * @param epochID 
	 * @returns Promise<IEpochRecord|undefined>
	 */
	 public async getEpochRecord(epochID: string): Promise<IEpochRecord|undefined> {
		// Attempt to initialize the db in case it hadn't been
		if (!this.initialized) await this.initialize();

		// If it is not compatible, return the original call right away
		if (!this.initialized) return this._epoch.getEpochRecord(epochID);

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

				// Attempt to save it if found and it has been uninstalled
				if (record && typeof record.uninstalled == "number") {
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
		// Attempt to initialize the db in case it hadn't been
		if (!this.initialized) await this.initialize();

		// If it is not compatible, return the original call right away
		if (!this.initialized) return this._epoch.getEpochSummary(epochID);

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

				// Attempt to save it if it has been uninstalled
				if (typeof summary.record.uninstalled == "number") {
					try {
						await this.epochSummaries!.add(<ILocalData> { realID: epochID, data: summary });
					} catch (e) { console.error(e) }
				}

				// Finally, return it
				return summary; 
			}
		} catch (e) {
			console.error(e);
			return this._epoch.getEpochSummary(epochID);
		}
	}





	/***************************
	 * Certificates Management *
	 ***************************/





	/**
	 * Retrieves, stores and returns a prediction model certificate if the browser 
	 * is compatible.
	 * @param id 
	 * @returns Promise<IPredictionModelCertificate>
	 */
	 public async getPredictionModelCertificate(id: string): Promise<IPredictionModelCertificate> {
		// Attempt to initialize the db in case it hadn't been
		if (!this.initialized) await this.initialize();

		// If it is not compatible, return the original call right away
		if (!this.initialized) return this._epoch.getPredictionModelCertificate(id);

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
		// Attempt to initialize the db in case it hadn't been
		if (!this.initialized) await this.initialize();

		// If it is not compatible, return the original call right away
		if (!this.initialized) return this._epoch.getRegressionCertificate(id);

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






	/***************************
	 * Candlesticks Management *
	 ***************************/





	/**
	 * Retrieves the candlesticks for a given period. Prior to sending a request
	 * to the server, it will check if the data is in the db. If not, it will 
	 * retrieve it and store it.
	 * @param start 
	 * @param end 
	 * @param serverTime 
	 * @param intervalMinutes?
	 * @returns Promise<ICandlestick[]>
	 */
	public async getCandlesticksForPeriod(start: number, end: number, serverTime: number, intervalMinutes?: number): Promise<ICandlestick[]> {
		// Attempt to initialize the db in case it hadn't been
		if (!this.initialized) await this.initialize();

		// If it is not compatible, return the original call right away
		if (!this.initialized) return this._candlestick.getForPeriod(start, end, intervalMinutes);

		// Make sure the user is interacting with the prediction candlesticks
		if (typeof intervalMinutes != "number" || intervalMinutes == this._candlestick.predictionCandlestickInterval) {
			try {
				// Make sure the beginning of the range exists
				const firstRecordEnd: number = moment(start).add(30, "minutes").valueOf() - 1;
				const firstRecord: ILocalData[] = await this.predictionCandlesticks!.where("realID").between(start, firstRecordEnd, true, true).sortBy("realID");
				if (firstRecord.length) {
					// Retrieve the head
					const head: ILocalData[] = await this.predictionCandlesticks!.where("realID").between(start, end, true, true).sortBy("realID");

					// Check if the head contains the entire query. If so, return it right away
					if (end <= head[head.length - 1]!.data.ct) { 
						return head.map((localData) => localData!.data); 
					}

					// Otherwise, complete the records and save them afterwards
					else {
						// Retrieve the tail
						const tail: ICandlestick[] = await this._candlestick.getForPeriod(head[head.length - 1]!.data.ot + 1, end, intervalMinutes);

						// Save it
						await this.saveCandlesticks(tail, serverTime);

						// Finally, return both, the head and the tail
						return head.map((localData) => localData!.data).concat(tail);
					}
				}

				// Otherwise, fallback to the original request
				else {
					// Retrieve the candlesticks
					const candlesticks: ICandlestick[] = await this._candlestick.getForPeriod(start, end, intervalMinutes);
					
					// Save them if any was found
					if (candlesticks.length) await this.saveCandlesticks(candlesticks, serverTime);

					// Finally, return them
					return candlesticks;
				}
			} catch (e) { 
				console.log(e);
				return this._candlestick.getForPeriod(start, end, intervalMinutes);
			}
		} 

		// Otherwise, fallback to the original request
		else { 
			return this._candlestick.getForPeriod(start, end, intervalMinutes);
		}
	}






	/**
	 * Given a list of candlesticks, it will check if the candlestick has been 
	 * finalized and that they don't already exist prior to saving them.
	 * This function is safe to invoke, if any errors they will just be logged.
	 * @param candlesticks 
	 * @param serverTime 
	 * @returns Promise<void>
	 */
	private async saveCandlesticks(candlesticks: ICandlestick[], serverTime: number): Promise<void> {
		try {
			// Calculate the minimum close time the candlesticks should have in order to be considered finalized
			const finalizedTS: number = moment(serverTime).subtract(30, "minutes").valueOf();

			// Init the list of candlesticks that will be saved
			let saveable: ILocalData[] = [];
			for (let candle of candlesticks) {
				// Make sure the candlestick is finalized
				if (candle.ct <= finalizedTS) {
					// Make sure the candlestick doesn't already exist
					const rec: ILocalData|undefined = await this.predictionCandlesticks!.where("realID").equals(candle.ot).first();
					if (!rec) saveable.push({ realID: candle.ot, data: candle });
				}
			}

			// Check if there are candlesticks that should be saved
			if (saveable.length) await this.predictionCandlesticks!.bulkAdd(saveable);
		} catch (e) { console.log(e) }
	}




	



	/**************************
	 * Predictions Management *
	 **************************/





	/**
	 * Retrieves the predictions for a given period. Prior to sending a request
	 * to the server, it will check if the data is in the db. If not, it will 
	 * retrieve it and store it.
	 * @param epochID 
	 * @param startAt 
	 * @param endAt 
	 * @param epochInstalled
	 * @returns Promise<IPrediction[]>
	 */
	public async listPredictions(
		epochID: string,
		startAt: number,
		endAt: number,
		epochInstalled: number
	 ): Promise<IPrediction[]> {
		// Attempt to initialize the db in case it hadn't been
		if (!this.initialized) await this.initialize();

		// If it is not compatible, return the original call right away
		if (!this.initialized) return this._prediction.listPredictions(epochID, startAt, endAt);

		// If the start is earlier than the installation of the epoch, replace it
		if (startAt <= epochInstalled) startAt = moment(epochInstalled).add(5, "minutes").valueOf();

		// Retrieve the predictions safely
		try {
			// Make sure the beginning of the range exists
			const firstRecordEnd: number = moment(startAt).add(1, "minute").valueOf();
			let firstRecord: ILocalData[] = await this.predictions!.where("realID").between(startAt, firstRecordEnd, true, true).sortBy("realID");
			if (firstRecord.length) {
				// Retrieve the head and reverse it
				let head: ILocalData[] = await this.predictions!.where("realID").between(startAt, endAt, true, true).sortBy("realID");

				// Check if the head contains the entire query. If so, return it right away
				if (endAt <= moment(head[head.length - 1]!.data.t).add(2, "minutes").valueOf()) {
					return head.map((localData) => localData!.data); 
				}

				// Otherwise, complete the records and save them afterwards
				else {
					// Retrieve the tail
					const tail: IPrediction[] = await this._prediction.listPredictions(
						epochID, 
						head[head.length - 1]!.data.t, 
						endAt
					);
					
					// Save it
					await this.savePredictions(tail);

					// Finally, return both, the head and the tail
					return head.map((localData) => localData!.data).concat(tail);
				}
			}

			// Otherwise, fallback to the original request
			else {
				// Retrieve the predictions
				const preds: IPrediction[] = await this._prediction.listPredictions(epochID, startAt, endAt);
				
				// Save them if any was found
				if (preds.length) await this.savePredictions(preds);

				// Finally, return them
				return preds;
			}
		} catch (e) { 
			console.log(e);
			return this._prediction.listPredictions(epochID, startAt, endAt);
		}
	}









	/**
	 * Given a list of predictions, it will check if the prediction currently 
	 * exists prior to saving
	 * This function is safe to invoke, if any errors they will just be logged.
	 * @param preds
	 * @returns Promise<void>
	 */
	 private async savePredictions(preds: IPrediction[]): Promise<void> {
		try {
			// Init the list of predictions that will be saved
			let saveable: ILocalData[] = [];
			for (let pred of preds) {
				// Make sure the prediction doesn't already exist
				const rec: ILocalData|undefined = await this.predictions!.where("realID").equals(pred.t).first();
				if (!rec) saveable.push({ realID: pred.t, data: pred });
			}

			// Check if there are candlesticks that should be saved
			if (saveable.length) await this.predictions!.bulkAdd(saveable);
		} catch (e) { console.log(e) }
	}









	/**********************************
	 * Starred Predictions Management *
	 **********************************/




	/**
	 * Adds a prediction to the starred table.
	 * @param pred 
	 * @returns Promise<void>
	 */
	public async starPrediction(pred: IPrediction): Promise<void> {
		// Attempt to initialize the db in case it hadn't been
		if (!this.initialized) await this.initialize();

		// If it is not compatible, return the original call right away
		if (!this.initialized) return;

		// Save the record safely
		try {
			await this.starredPredictions!.add({ realID: pred.t, data: pred });
		} catch (e) { console.log(e) }
	}





	/**
	 * Deletes a prediction from the starred table.
	 * @param pred 
	 * @returns Promise<void>
	 */
	public async unstarPrediction(pred: IPrediction): Promise<void> {
		// Attempt to initialize the db in case it hadn't been
		if (!this.initialized) await this.initialize();

		// If it is not compatible, return the original call right away
		if (!this.initialized) return;

		// Save the record safely
		try {
			await this.starredPredictions!.where("realID").equals(pred.t).delete();
		} catch (e) { console.log(e) }
	}







	/**
	 * Retrieves the list of starred predictions.
	 * @returns Promise<IPrediction[]>
	 */
	public async getStarredPredictions(): Promise<IPrediction[]> {
		// Attempt to initialize the db in case it hadn't been
		if (!this.initialized) await this.initialize();

		// If it is not compatible, return the original call right away
		if (!this.initialized) return [];

		try {
			// Retrieve the predictions
			const localData: ILocalData[] = await this.starredPredictions!.orderBy("realID").reverse().toArray();

			// Return the list of predictions
			return localData.map((ld) => ld!.data);
		} catch (e) {
			console.log(e);
			return [];
		}
	}












	/**************************************
	 * Prediction Candlesticks Management *
	 **************************************/





	/**
	 * Retrieves the prediction candlesticks for a given period. Prior to sending a request
	 * to the server, it will check if the data is in the db. If not, it will 
	 * retrieve it and store it.
	 * @param epochID 
	 * @param startAt 
	 * @param endAt 
	 * @param epochInstalled 
	 * @param serverTime
	 * @returns Promise<IPredictionCandlestick[]>
	 */
	 public async listPredictionCandlesticks(
		epochID: string, 
		startAt: number, 
		endAt: number, 
		epochInstalled: number,
		serverTime: number
	): Promise<IPredictionCandlestick[]> {
		// Attempt to initialize the db in case it hadn't been
		if (!this.initialized) await this.initialize();

		// If it is not compatible, return the original call right away
		if (!this.initialized) return this._prediction.listPredictionCandlesticks(epochID, startAt, endAt);

		// If the start is earlier than the installation of the epoch, replace it
		if (startAt <= epochInstalled) startAt = moment(epochInstalled).add(5, "minutes").valueOf();

		try {
			// Make sure the beginning of the range exists
			const firstRecordEnd: number = moment(startAt).add(30, "minutes").valueOf() - 1;
			const firstRecord: ILocalData[] = await this.epochPredictionCandlesticks!.where("realID").between(startAt, firstRecordEnd, true, true).sortBy("realID");
			if (firstRecord.length) {
				// Retrieve the head
				const head: ILocalData[] = await this.epochPredictionCandlesticks!.where("realID").between(startAt, endAt, true, true).sortBy("realID");

				// Check if the head contains the entire query. If so, return it right away
				if (endAt <= moment(head[head.length - 1]!.data.ct).add(2, "minutes").valueOf()) { 
					return head.map((localData) => localData!.data); 
				}

				// Otherwise, complete the records and save them afterwards
				else {
					// Retrieve the tail
					const tail: IPredictionCandlestick[] = await this._prediction.listPredictionCandlesticks(
						epochID, 
						head[head.length - 1]!.data.ot + 1, 
						endAt
					);

					// Save it
					await this.savePredictionCandlesticks(tail, serverTime);

					// Finally, return both, the head and the tail
					return head.map((localData) => localData!.data).concat(tail);
				}
			}

			// Otherwise, fallback to the original request
			else {
				// Retrieve the candlesticks
				const candlesticks: IPredictionCandlestick[] = await this._prediction.listPredictionCandlesticks(epochID, startAt, endAt);
				
				// Save them if any was found
				if (candlesticks.length) await this.savePredictionCandlesticks(candlesticks, serverTime);

				// Finally, return them
				return candlesticks;
			}
		} catch (e) { 
			console.log(e);
			return this._prediction.listPredictionCandlesticks(epochID, startAt, endAt);
		}
	}






	/**
	 * Given a list of prediction candlesticks, it will check if the candlestick has been 
	 * finalized and that they don't already exist prior to saving them.
	 * This function is safe to invoke, if any errors they will just be logged.
	 * @param candlesticks 
	 * @param serverTime 
	 * @returns Promise<void>
	 */
	private async savePredictionCandlesticks(candlesticks: IPredictionCandlestick[], serverTime: number): Promise<void> {
		try {
			// Calculate the minimum close time the candlesticks should have in order to be considered finalized
			const finalizedTS: number = moment(serverTime).subtract(30, "minutes").valueOf();

			// Init the list of candlesticks that will be saved
			let saveable: ILocalData[] = [];
			for (let candle of candlesticks) {
				// Make sure the candlestick is finalized
				if (candle.ct <= finalizedTS) {
					// Make sure the candlestick doesn't already exist
					const rec: ILocalData|undefined = await this.epochPredictionCandlesticks!.where("realID").equals(candle.ot).first();
					if (!rec) saveable.push({ realID: candle.ot, data: candle });
				}
			}

			// Check if there are candlesticks that should be saved
			if (saveable.length) await this.epochPredictionCandlesticks!.bulkAdd(saveable);
		} catch (e) { console.log(e) }
	}

}
