import { IKeyZoneStateEvent } from "../../../../../core";



export interface IKeyZonesEventsDialogComponent {
    loadHist(range: IKZEventHistoryRange): Promise<void>,
    displayKeyZoneEventContext(evt: IKeyZoneStateEvent): void,
    displayTooltip(): void,
    close(): void
}






export type IKZEventHistoryRangeID = "24h"|"48h"|"72h"|"1w"|"2w"|"1m"|"custom";
export interface IKZEventHistoryRange {
    id: IKZEventHistoryRangeID,
    name: string
}