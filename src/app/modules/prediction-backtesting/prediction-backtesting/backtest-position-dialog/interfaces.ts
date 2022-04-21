import { IBacktestPosition, IModel } from "../../../../core";


export interface IBacktestPositionDialogComponent {
    close(): void
}




export interface IBacktestPositionDialogData {
    model: IModel,
    position: IBacktestPosition
}