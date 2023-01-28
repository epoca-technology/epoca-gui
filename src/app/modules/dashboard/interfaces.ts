import { IActivePosition, IBinancePositionSide, ITAIntervalID } from "../../core";

export interface IDashboardComponent {
    // Position Management
    openPosition(side: IBinancePositionSide): void,
    closePosition(side: IBinancePositionSide, chunkSize: number): void,

    // Misc Helpers
    toggleTrendChart(): Promise<void>,
    togglePositionButtonContent(): Promise<void>,
    activatePredictionCandlesticks(): Promise<void>,
    deactivatePredictionCandlesticks(): void,
    displayStrategyFormDialog(): void,
    displayBalanceDialog(): void,
    displayPositionDialog(position: IActivePosition): void,
    displayFeaturesDialog(): void,
    displayTechnicalAnalysisDialog(taInterval: ITAIntervalID): void,

    // Tooltips
    windowTooltip(): void,
    predictionModelTooltip(): void,
    volumeTooltip(): void,
    openInterestTooltip(): void,
    longShortRatioTooltip(): void,
    networkFeeTooltip(): void,
    
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