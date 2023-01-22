

export interface IStrategyFormDialogComponent { 
    update(): void,

    // Tooltips
    statusTooltip(): void,
    tradingModeTooltip(): void,
    positionSizeTooltip(): void,
    profitOptimizationTooltip(): void,
    lossOptimizationTooltip(): void,
    idlingTooltip(): void,

    // Misc Helpers
    cancel(): void,
}