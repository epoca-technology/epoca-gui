import { ITAIntervalID } from "../../core";

export interface IDashboardComponent {

    // Adjustments Management
    displayAdjustmentsMenu(): void,

    // Misc Dialogs
    displayBalanceDialog(): void,
    displayActivePredictionDialog(): void,
    displayTechnicalAnalysisDialog(taInterval: ITAIntervalID): void,
    displayKeyZonesDialog(): void,


    // Tooltips
    windowTooltip(): void,
    predictionModelTooltip(): void,
    volumeTooltip(): void,
    technicalsTooltip(): void,
    openInterestTooltip(): void,
    longShortRatioTooltip(): void,
    
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