import { IPositionReduction, ITakeProfitLevelID } from "../../../../../core";


export interface IPositionInfoDialogComponent {
    displayStopLossOrder(): void,
    displayTakeProfitReductions(id: ITakeProfitLevelID, reductions: IPositionReduction[]): void,
    close(): void
}