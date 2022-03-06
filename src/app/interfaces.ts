export interface IAppComponent {
    // Nav Actions
    createNewInstance(): void,
    signOut(): void,

    // FCM
    enableFCM(): Promise<void>,
    fcmDragged(event: any): void,
}