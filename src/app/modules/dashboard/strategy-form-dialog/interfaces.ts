

export interface IStrategyFormDialogComponent { 
    // Actions
    update(): void,

    // Tooltips
    tradingStrategyTooltip(): void,
    statusTooltip(): void,
    generalTooltip(): void
    profitOptimizationTooltip(): void,
    lossOptimizationTooltip(): void,
    sideReopeningTooltip(): void,
    lowVolatilityCoinsTooltip(): void,

    // Misc Helpers
    cancel(): void,
}