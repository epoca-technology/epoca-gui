import { IKeyZoneState, IReversal } from "../../../core";






export interface IKeyZoneStateDialogComponent {
    showMore(above?: boolean): void,
    displayReversals(reversals: IReversal[]): void,
    close(): void
}



export interface IKeyZonesStateDialogData {
    state: IKeyZoneState,
    currentPrice: number
}


export interface IKeyZoneDistance {
    [id: number]: number
}