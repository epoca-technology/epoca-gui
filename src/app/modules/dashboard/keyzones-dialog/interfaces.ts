import { IReversal } from "../../../core"


export interface IKeyZonesDialogComponent {
    showMore(above?: boolean): void,
    displayReversals(reversals: IReversal[]): void,
    close(): void
}



export interface IKeyZoneDistance {
    [id: number]: number
}