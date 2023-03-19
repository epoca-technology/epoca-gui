import { IKeyZone } from "../../../core"


export interface IKeyZonesDialogComponent {
    showMore(above?: boolean): void,

    // Tab Management
    tabChanged(newIndex: number): Promise<void>,

    // Misc Helpers
    displayKeyZone(zone: IKeyZone): void,
    displayLiquidityDialog(): void,
    displayInfoTooltip(): void,
    displayTooltip(): void,
    close(): void
}



export interface IKeyZoneDistance {
    [id: number]: number
}