import { ICoinsCompressedState } from "../../../../core";



export interface ICoinsStateSummaryDialogComponent {
    initializeData(states?: ICoinsCompressedState): Promise<void>,
    displayCoinDialog(symbol: string): void,
    displayTooltip(): void,
    close(): void
}