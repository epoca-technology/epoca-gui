import { IPredictionModelConfig, IPredictionResult } from "../../../../../../core";



export interface IFeaturesSumDialogComponent {
    close(): void
}



export interface IFeaturesSumDialogData {
    sum: number,
    features: number[],
    result: IPredictionResult,
    model: IPredictionModelConfig
}