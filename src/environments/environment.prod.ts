import { IEnvironment } from "../app/core";
export const environment: IEnvironment = {
	production: true,
	guiVersion: '0.0.1',
	firebaseConfig: {
		credentials: {
            apiKey: "AIzaSyAZd0yugAXBHLnC5MKu1oMhnFvvpZn94d0",
            authDomain: "projectplutus-prod.firebaseapp.com",
            projectId: "projectplutus-prod",
            storageBucket: "projectplutus-prod.appspot.com",
            messagingSenderId: "192265974678",
            appId: "1:192265974678:web:6d5ebd1518f7e73176e3b7"
		},
		vapidKey: 'BMVi9vH_H_e3RTgfXXbS9SsCg5A-1YpmRaRmmW9xPmUsofcP4FPEdOqFfIWtQ-ZLfNJMc0YHeLof832xpgXGz2o'
	},
    apiURL: {
        useLocal: true,
        local: 'http://localhost:8075',
        external: ''
    },
    recaptchaKey: '6LcKVT8eAAAAAA5GsQCepHT5nDnSo3ays2FXZ__N',
    pgAdminURL: 'http://localhost:8080/',
    dozzleURL: 'http://localhost:8085/'
};