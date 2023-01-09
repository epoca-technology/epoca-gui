import { IBinancePositionSide, IPositionSideHealth } from "../../../../core"



export interface IPositionHealthDialogComponent {
    displayHealthDetailsDialog(): void,
    close(): void
}




export interface IPositionHealthDialogData {
    side: IBinancePositionSide,
    health: IPositionSideHealth
}