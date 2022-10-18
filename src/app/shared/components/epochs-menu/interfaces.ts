


// Service
export interface IEpochsMenuComponent {
    // Loader
    loadEpochs(): Promise<void>,

    // Search
    enableSearch(): void,
    disableSearch(): void,
    performSearch(): Promise<void>,

    // Activator
    activateEpoch(epochID: string): void
}