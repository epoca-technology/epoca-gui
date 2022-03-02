

export interface INotificationService {
    // Properties
    fcmSupported: boolean,

    // FCM TOken
    getToken(): Promise<string>,
}