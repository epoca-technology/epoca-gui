import { IActivePosition, IBinancePositionSide } from "../../core";

export interface IDashboardComponent {
    // Position Management
    openPosition(side: IBinancePositionSide): void,
    increasePosition(side: IBinancePositionSide): void,
    closePosition(side: IBinancePositionSide, chunkSize: number): void,

    // Misc Helpers
    toggleTrendChart(): Promise<void>,
    displayStrategyFormDialog(): void,
    displayBalanceDialog(): void,
    displayPositionDialog(position: IActivePosition): void,
    displayStrategyBuilderDialog(side: IBinancePositionSide): void,
    displayFeaturesDialog(): void,
    displayKeyZoneDialog(): void
    
    // Nav Actions
    createNewInstance(): void,
    signOut(): void
}







/**
 * The position close chunk sizes.
 */
export interface IPositionCloseChunkSize {
    1: number,
    0.75: number,
    0.66: number,
    0.5: number,
    0.33: number,
    0.25: number
}