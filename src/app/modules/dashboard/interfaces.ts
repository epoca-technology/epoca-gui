import { IActivePosition, IBinancePositionSide } from "../../core";

export interface IDashboardComponent {
    // Position Management
    openPosition(side: IBinancePositionSide): void,
    increasePosition(side: IBinancePositionSide): void,
    closePosition(side: IBinancePositionSide): void,

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