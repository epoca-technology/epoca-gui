


/* Environment */
export interface IEnvironment {
    production: boolean,
    firebaseConfig: IFirebaseConfig,
    localServer: boolean,
    apiURL: IURL
    pgAdmin: IURL,
    dozzle: IURL,
    recaptchaKey: string,
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


// URL
export interface IURL {
    local: string,
    external: string
}