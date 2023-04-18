


export interface ICoinsStateSummaryDialogComponent {
    initializeData(): Promise<void>,
    displayCoinDialog(symbol: string): void,
    displayTooltip(): void,
    close(): void
}