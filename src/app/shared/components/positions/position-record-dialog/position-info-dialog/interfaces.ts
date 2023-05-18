import { IPositionReduction, ITakeProfitLevelID } from "../../../../../core";


export interface IPositionInfoDialogComponent {
    displayTakeProfitReductions(id: ITakeProfitLevelID, reductions: IPositionReduction[]): void,
    close(): void
}