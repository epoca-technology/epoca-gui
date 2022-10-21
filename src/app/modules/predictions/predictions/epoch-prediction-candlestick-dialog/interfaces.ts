import { 
    IEpochRecord, 
    IPrediction, 
    IPredictionCandlestick
} from "../../../../core"



export interface IEpochPredictionCandlestickDialogComponent {
    tabChanged(newIndex: number): Promise<void>,
    displayPrediction(pred: IPrediction): void,
    close(): void
}




export interface IPredictionCandlestickDialogData {
    candlestick: IPredictionCandlestick,
    epoch: IEpochRecord
}