import { Injectable } from '@angular/core';
import { Database, getDatabase, DatabaseReference, ref } from 'firebase/database';
import { IDatabaseService } from './interfaces';

@Injectable({
  providedIn: 'root'
})
export class DatabaseService implements IDatabaseService {


	// Firebase Database
	public readonly firebaseDB: Database = getDatabase();
	public readonly firebaseDBRef: DatabaseReference = ref(this.firebaseDB);

	constructor() { }













	/* Firebase Refs & Paths */




	/**
	 * Retrieves the API Secret Path.
	 * @param uid 
	 * @returns string
	 */
	public getApiSecretPath(uid: string): string { return `apiSecret/${uid}/s` }





	/**
	 * Retrieves the path for the API Secret.
	 * @param uid 
	 * @returns DatabaseReference
	 */
	public getApiSecretRef(uid: string): DatabaseReference { 
		return ref(this.firebaseDB, this.getApiSecretPath(uid));
	}





	/**
	 * Retrieves the path for the App Bulk.
	 * @returns DatabaseReference
	 */
	public getAppBulkRef(): DatabaseReference { 
		return ref(this.firebaseDB, "appBulk");
	}
}
