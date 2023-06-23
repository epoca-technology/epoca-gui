


export interface IPositionHeadlinesDialogComponent {
    loadHist(alterRange?: boolean): Promise<void>,
    displayPositionActionPayloadsDialog(): void,
    displayTooltip(): void,
    close(): void
}