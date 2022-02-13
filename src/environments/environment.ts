// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.
import { IEnvironment } from "../app/core";
export const environment: IEnvironment = {
	production: false,
	guiVersion: '0.0.1',
	firebaseConfig: {
		credentials: {
			apiKey: "AIzaSyBKcvKZTGo7hsYXreWpcpHuwo6UZff6Nfg",
			authDomain: "projectplutus-dev.firebaseapp.com",
			projectId: "projectplutus-dev",
			storageBucket: "projectplutus-dev.appspot.com",
			messagingSenderId: "228969576009",
			appId: "1:228969576009:web:7b516f6c4d248255177198"
		},
		vapidKey: 'BItlFQ-1CPZi-SYVd4I8OIDQ2OCV6kWQIZVvbCt78DW-LRoTxu38X3XpqF8h_x0Xj7lEapd8GXe9HOF6265YfSA'
	},
    apiURL: {
        useLocal: true,
        local: 'http://localhost:5075',
        external: ''
    },
    recaptchaKey: '6Lcd57sdAAAAAKe5F9X93Sw_Yagh4GZ3J5-T1PuT',
    pgAdminURL: 'http://localhost:8080/',
    dozzleURL: 'http://localhost:8085/'
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
