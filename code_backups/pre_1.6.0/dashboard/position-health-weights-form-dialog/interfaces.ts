

export interface IPositionHealthWeightsFormDialogComponent {
    // API Actions
    update(): void,

    // Tooltips
    positionHealthSystemTooltip(): void,
    trendTooltip(): void,
    technicalsTooltip(): void,
    openInterestTooltip(): void,
    longShortRatioTooltip(): void,
    volumeTooltip(): void,

    // Misc Helpers
    close(): void
}