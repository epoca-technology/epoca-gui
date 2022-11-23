


export interface IPredictionsComponent {
    // Initializer
    initializeEpochData(epochID?: string): Promise<void>,

    // View Management
    activateCandlesticks(days?: number): Promise<void>
}