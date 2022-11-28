import { IActivePosition } from "../../core";

export interface IDashboardComponent {
    

    // Misc Helpers
    toggleTrendChart(): Promise<void>,
    displayStrategyFormDialog(): void,
    displayBalanceDialog(): void,
    displayPositionDialog(position: IActivePosition): void,
    displayFeaturesDialog(): void,
    displayKeyZoneDialog(): void
    
    // Nav Actions
    createNewInstance(): void,
    signOut(): void
}