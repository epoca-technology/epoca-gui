import { IApiURL } from "../api";




/* Environment */
export interface IEnvironment {
    production: boolean,
    firebaseConfig: IFirebaseConfig,
    apiURL: IApiURL
    recaptchaKey: string,
    pgAdmin: IApiURL,
    dozzle: IApiURL
}



// Firebase Config
export interface IFirebaseConfig {
    credentials: IFirebaseCredentials,
    vapidKey: string
}


// Firebase Credentials
export interface IFirebaseCredentials {
    apiKey: string,
    authDomain: string,
    projectId: string,
    storageBucket: string,
    messagingSenderId: string,
    appId: string
}