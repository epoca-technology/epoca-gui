

export interface IPositionRecordDialogComponent {

    // Data Loader
    refreshPositionRecord(): Promise<void>,

    // Position Actions
    closePosition(): Promise<void>,
    
    // Misc Helpers
    displayPositionInfoDialog(): void,
    displayPositionContextDialog(): void,
    displayTooltip(): void,
    close(): void
}