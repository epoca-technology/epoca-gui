import { IBinancePositionSide, IPositionSideHealth } from "../../../../core"


export interface IPositionHpCalculatorDialogComponent {
    // Tooltips
    

    // Misc Helpers
    close(): void
}



export interface IPositionHpCalculatorDialogData {
    side: IBinancePositionSide,
    health: IPositionSideHealth
}



export interface IHPResult {
    id: string,
    name: string,
    points: number,
    maxPoints: number,
    percentage: number
}