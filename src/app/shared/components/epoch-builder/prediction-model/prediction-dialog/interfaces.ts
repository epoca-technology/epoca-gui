import { IEpochRecord, IPrediction, IPredictionModelConfig } from "src/app/core";



export interface IPredictionDialogComponent {
    displayTooltip(): void,
    close(): void
}



export interface IPredictionDialogData {
    model: IPredictionModelConfig,
    prediction: IPrediction
}