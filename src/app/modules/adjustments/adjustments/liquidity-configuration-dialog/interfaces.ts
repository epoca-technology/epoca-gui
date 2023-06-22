


export interface ILiquidityConfigurationDialogComponent {
    // API Actions
    update(): void,

    // Tooltips
    generalTooltip(): void,
    stateTooltip(): void,
    intensityWeightsTooltip(): void,

    // Misc Helpers
    cancel(): void
}