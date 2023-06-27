import { IKeyZoneStateEvent } from "../../../../core";



export interface IKeyZonesEventsDialogComponent {
    loadHist(alterRange?: boolean): Promise<void>,
    displayKeyZoneEventContext(evt: IKeyZoneStateEvent): void,
    displayTooltip(): void,
    close(): void
}




