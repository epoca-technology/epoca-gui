import { Injectable, NgZone } from '@angular/core';
import {
    Auth, 
    initializeAuth, 
    indexedDBLocalPersistence, 
    onAuthStateChanged, 
    User, 
    onIdTokenChanged,
    signInWithCustomToken,
    signOut,
} from "firebase/auth";
import { onValue, get, DataSnapshot, child } from "firebase/database";
import { BehaviorSubject } from 'rxjs';
import { UtilsService } from '../utils';
import { DatabaseService } from '../database';
import { IAuthService, IAuthority } from './interfaces';


@Injectable({
  providedIn: 'root'
})
export class AuthService implements IAuthService {
    // Auth Instance
    private readonly auth: Auth; 

	// Auth Status
	public uid: BehaviorSubject<string|null|undefined>;
    private user?: User|null;

    // ID Token
    private idToken?: string|undefined;

    // API Secret
    private apiSecretInitialized: boolean = false;
    private apiSecretConnection?: Function;
    private apiSecret?: string|undefined;

    constructor(
        private _db: DatabaseService,
        private _utils: UtilsService,
        private ngZone: NgZone
    ) { 
        // Initialize the Auth
        this.auth = initializeAuth(this._db.firebaseDB.app, {persistence: [indexedDBLocalPersistence], popupRedirectResolver: undefined});

        // Initialize the uid observable
        this.uid =  new BehaviorSubject<string|null|undefined>(undefined);

        // Listen to auth changes and propagate changes inside of Angular's zone
        onAuthStateChanged(this.auth, (fbUser: User|null) => {
                this.ngZone.run(() => {
                    if (fbUser && fbUser.uid) { 
                        // Propagate the UID
                        this.uid.next(fbUser.uid) ;
                        this.user = fbUser;

                        // Initialize the API Secret in case it hasn't been
                        if (!this.apiSecretInitialized) this.initializeAPISecret(); 
                    } 
                    else { 
                        // The user is not authenticated
                        this.uid.next(null);
                        this.user = null;

                        // Deactivate the API Secret connection if any
                        this.deactivateAPISecret();
                    }
                });
            }, e => console.error(e)
        );

        // Listen to ID Token changes and populate the local property
        onIdTokenChanged(this.auth, async (user: User|null) => { if (user) this.idToken = await user.getIdToken() }, e => console.error(e) );
    }








    
    /* Auth Management */








    /**
     * Attempts to sign in in a persistent way.
     * @param signInToken 
     * @returns Promise<void>
     */
    public async signIn(signInToken: string): Promise<void> {
        // Make sure the provided token is valid
        if (typeof signInToken != "string") {
            console.log(signInToken);
            throw new Error('The provided sign in token is invalid. Please try again.');
        }

        // Attempt to sign in persistently
        try { await signInWithCustomToken(this.auth, signInToken) }
        catch (e) {
            // Log the error and allow a small delay
            console.error(`Error when trying to sign in (1). Attempting again in a few seconds.`, e);
            await this._utils.asyncDelay(5);

            // Attempt again
            try { await signInWithCustomToken(this.auth, signInToken) }
            catch (e) {
                // Log the error and allow a small delay
                console.error(`Error when trying to sign in (2). Attempting again in a few seconds.`, e);
                await this._utils.asyncDelay(5);
    
                // Attempt one last time again
                await signInWithCustomToken(this.auth, signInToken)
            }
        }
    }






    /**
     * Destroys the current session.
     * @returns Promise<void>
     */
    public async signOut(): Promise<void> { await signOut(this.auth) }














    /* ID Token */



    /**
     * Attempts to retrieve the user's API Secret from the local property. If this one is not set,
     * it will retrieve it from the Firebase DB.
     * @returns Promise<string>
     */
     public async getIDToken(): Promise<string> {
        // Check if the property is set
        if (typeof this.idToken == "string") return this.idToken;

        // Otherwise, retrieve it from the DB
        return await this.getRefreshedIDToken();
    }






    /**
     * This function is invoked if for some reason the secret retrieved from the
     * real time connection is no longer valid.
     * It sets the API secret to undefined, so future requests extract the secret
     * manually until the realtime connection is restored.
     * @returns void
     */
    public idTokenInvalid(): void { this.idToken = undefined }







    /**
     * Returns a refreshed ID Token from the authenticated user.
     * @returns Promise<string>
     */
    private getRefreshedIDToken(): Promise<string> {
        // Make sure the user is authenticated
        if (!this.user) {
            throw new Error('Cannot retrieve the ID Token because the firebase user is not set.');
        }

        return this.user.getIdToken(true);
    }













    /* API Secret */






    /**
     * Initializes the API Secret DB Connection.
     * @returns void
     */
    private initializeAPISecret(): void {
        this.apiSecretConnection = onValue( this._db.getApiSecretRef(this.user!.uid), (snapshot: DataSnapshot) => {
                this.ngZone.run(() => {
                    const snapVal: string|null = snapshot.val();
                    if (snapVal) { 
                        this.apiSecret = snapVal;
                        this.apiSecretInitialized = true;
                     } else {
                        this.apiSecret = undefined;
                        console.error('The user does not have an API Secret assigned.');
                     }
                });
            },
            e => console.error(e)
        );
    }






    /**
     * Closes the API Secret connection with the DB.
     * @returns void
     */
    private deactivateAPISecret(): void {
        if (this.apiSecretInitialized && typeof this.apiSecretConnection == "function") this.apiSecretConnection();
        this.apiSecret = undefined;
        this.apiSecretInitialized = false; 
    }









    /**
     * Attempts to retrieve the user's API Secret from the local property. If this one is not set,
     * it will retrieve it from the Firebase DB.
     * @returns Promise<string>
     */
    public async getAPISecret(): Promise<string> {
        // Check if the property is set
        if (typeof this.apiSecret == "string") return this.apiSecret;

        // Otherwise, retrieve it from the DB
        return await this.getAPISecretFromFirebase();
    }






    /**
     * This function is invoked if for some reason the secret retrieved from the
     * real time connection is no longer valid.
     * It sets the API secret to undefined, so future requests extract the secret
     * manually until the realtime connection is restored.
     * @returns void
     */
    public apiSecretIsInvalid(): void { this.apiSecret = undefined }








    /**
     * Retrieves the API Secret from the Firebase DB.
     * @returns Promise<string>
     */
    private async getAPISecretFromFirebase(): Promise<string> {
        // Make sure the user is authenticated
        if (!this.user) {
            throw new Error('Cannot download the API Secret because the firebase user is not set.');
        }

        // Retrieve the secret from the db
        const snap: DataSnapshot = await get(child(this._db.firebaseDBRef, this._db.getApiSecretPath(this.user.uid)));
        const snapVal: string|null = snap.val();

        // Make sure the value is valid
        if (typeof snapVal != "string") {
            throw new Error(`The retrieved API Secret (${snapVal}) is not a valid string.`);
        }

        // Return the scret
        return snapVal;
    }
}
