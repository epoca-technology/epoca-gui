import { IBacktestPosition, IPredictionModelConfig } from "../../../../core";




export interface IPredictionModelBacktestPositionDialogComponent {
    close(): void
}



export interface IBacktestPositionDialogData {
    model: IPredictionModelConfig,
    position: IBacktestPosition
}