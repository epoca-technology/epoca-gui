import { IKeyZone } from "../../../core"


export interface IKeyZonesDialogComponent {
    showMore(above?: boolean): void,
    displayKeyZone(zone: IKeyZone): void,
    close(): void
}



export interface IKeyZoneDistance {
    [id: number]: number
}