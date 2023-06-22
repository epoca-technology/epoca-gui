import { IBinancePositionSide } from "../../../../core";


export interface IPositionRecordDialogComponent {

    // Data Loader
    refreshPositionRecord(): Promise<void>,

    // Position Actions
    increasePosition(side: IBinancePositionSide): void,
    closePosition(): Promise<void>,
    
    // Misc Helpers
    displayPositionInfoDialog(): void,
    displayTooltip(): void,
    close(): void
}