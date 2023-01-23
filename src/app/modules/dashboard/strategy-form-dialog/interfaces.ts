

export interface IStrategyFormDialogComponent { 
    // Actions
    update(): void,

    // Tooltips
    statusTooltip(): void,
    tradingModeTooltip(): void,
    positionSizeTooltip(): void,
    healthPointsTooltip(): void,
    profitOptimizationTooltip(): void,
    lossOptimizationTooltip(): void,
    idlingTooltip(): void,

    // Misc Helpers
    cancel(): void,
}