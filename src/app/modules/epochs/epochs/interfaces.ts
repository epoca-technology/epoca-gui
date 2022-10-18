


export interface IEpochsComponent {
    // Initializer
    initializeEpochData(epochID?: string): Promise<void>,

    // Install Manager
    install(): void,
    uninstall(): void
}