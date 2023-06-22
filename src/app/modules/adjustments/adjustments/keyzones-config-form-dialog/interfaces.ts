
export interface IKeyZonesConfigFormDialogComponent {
    // API Actions
    update(): void,

    // Tooltips
    generalTooltip(): void,
    buildTooltip(): void,
    scoreWeightsTooltip(): void,
    stateTooltip(): void,
    eventTooltip(): void,

    // Misc Helpers
    cancel(): void
}