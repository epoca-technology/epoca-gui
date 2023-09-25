import { ICoinsCompressedState } from "../../../core";



export interface ICoinsStateSummaryDialogComponent {
    initializeData(states?: ICoinsCompressedState): Promise<void>,
    showAllSymbols(): void,
    displayCoinDialog(symbol: string): void,
    displayTooltip(): void,
    close(): void
}




export interface ICoinsStateSummaryConfig {
    compressedStates?: ICoinsCompressedState,
    btcPrice?: boolean
}