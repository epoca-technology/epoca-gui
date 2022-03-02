import { Injectable } from '@angular/core';
import { getMessaging, getToken, Messaging} from "firebase/messaging"
import { UserService } from '../auth';
import { environment } from '../../../environments/environment';
import { INotificationService } from './interfaces';

@Injectable({
  providedIn: 'root'
})
export class NotificationService implements INotificationService {
    // FCM
	private fcm?: Messaging|undefined;
	public fcmSupported: boolean = false;
	
	// Vapid Key
	private readonly vapidKey: string = environment.firebaseConfig.vapidKey;



    constructor(
        private _user: UserService
    ) { 
		// Initialize Web FCM if available
		try {
			// Initialize the instance
			this.fcm = getMessaging();
			
			// Make sure the device supports service workers
			this.fcmSupported =
				window != undefined &&
				window.navigator != undefined &&
				window.navigator.serviceWorker != undefined;
			
			// Check if it is supported
			if (this.fcmSupported) {
				console.log('[FCM]: Initialized Successfully.');
			} else {
				console.log('[FCM]: The platform does not support service workers.');
			}
		} catch (e) {
			console.error('[FCM]: The platform does not support Firebase Messaging.', e);
		}
    }








    /**
     * Retrieves the FCM token and attempts to set it on the user. It returns the token string
     * when completes
     * @returns Promise<string>
     */
	public async getToken(): Promise<string> {
		// Make sure the platform is compatible
		if (this.fcm && this.fcmSupported) {
			// Retrieve the service worker registration
			const swRegistration: ServiceWorkerRegistration|undefined = await window.navigator.serviceWorker.getRegistration();
			
			// Make sure the registration was found
			if (swRegistration) {
				// Attempt to retrieve the token
				const token: string|undefined = await getToken(this.fcm, {
					vapidKey: this.vapidKey,
					serviceWorkerRegistration: swRegistration
				});
				
				// Make sure that a token was retrieved
				if (typeof token == "string" && token.length) {
					// Save the token
					await this._user.updateFCMToken(token);
					
					// Finally, return it
					return token;
				} else {
					throw new Error('[FCM]: No registration token available.')
				}
			} else {
				throw new Error('[FCM]: The service worker registration could not be found.')
			}
		} else {
			throw new Error('[FCM]: The platform does not support Service Workers or Firebase Messaging.');
		}
	}
}
