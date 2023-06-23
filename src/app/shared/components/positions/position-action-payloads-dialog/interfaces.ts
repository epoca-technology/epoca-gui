


export interface IPositionActionPayloadsDialogComponent {
    tabChanged(newIndex: number): void,
    loadHist(alterRange?: boolean): Promise<void>,
    displayTooltip(): void,
    close(): void,
}




