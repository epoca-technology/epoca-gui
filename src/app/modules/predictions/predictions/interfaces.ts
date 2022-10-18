


export interface IPredictionsComponent {
    initializeEpochData(epochID?: string): Promise<void>,
    loadPredictions(): Promise<void>,
    
}