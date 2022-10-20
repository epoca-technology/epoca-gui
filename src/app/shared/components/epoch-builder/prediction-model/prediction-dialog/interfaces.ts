import { IEpochRecord, IPrediction, IPredictionModelConfig } from "src/app/core";



export interface IPredictionDialogComponent {
    close(): void
}



export interface IPredictionDialogData {
    model: IPredictionModelConfig,
    prediction: IPrediction,
    outcome?: boolean,
    epoch?: IEpochRecord,
}