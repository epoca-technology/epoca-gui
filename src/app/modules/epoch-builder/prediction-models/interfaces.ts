import { IBacktestPosition } from "../../../core";


// Component
export interface IPredictionModelsComponent {
    // Component Init
    initWithID(id: string): Promise<void>,
    fileChanged(event: any): Promise<void>,
    reset(): void,

    // Navigation
    navigate(viewID: IViewID, certIndexOrID?: number|string): Promise<void>,
    certTabChanged(newIndex: number): void,

    // Hist Paging
    loadFirstHistPage(): Promise<void>,
    loadPreviousHistPage(): Promise<void>,
    loadNextHistPage(): Promise<void>,
    loadLastHistPage(): Promise<void>,

    // Misc Helpers
    displayPosition(position: IBacktestPosition): void,
}





// Views
export type IViewID = "ebe_points"|"backtest"|"discovery"|"hyperparams"|"certificate";
export interface IView {
    id: IViewID,
    name: string,
    icon: string,
    svg?: boolean
}



// History Pages
export interface IHistoryPage {
    start: number,
    end: number
}