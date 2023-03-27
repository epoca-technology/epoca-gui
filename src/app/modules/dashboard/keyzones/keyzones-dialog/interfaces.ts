import { IKeyZone, IMinifiedKeyZone } from "../../../../core"


export interface IKeyZonesDialogComponent {
    showMore(above?: boolean): void,

    // Tab Management
    tabChanged(newIndex: number): Promise<void>,

    // Misc Helpers
    displayStateKeyZoneTooltip(keyzone: IMinifiedKeyZone, kind: "above"|"below"): void,
    displayKeyZone(zone: IKeyZone): void,
    displayPriceSnapshotsDialog(): void,
    displayLiquidityDialog(): void,
    displayInfoTooltip(): void,
    displayTooltip(): void,
    close(): void
}



export interface IKeyZoneDistance {
    [id: number]: number
}