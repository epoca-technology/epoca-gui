import { IBacktestPosition } from "../../../core";


// Component
export interface IPredictionModelsComponent {
    // Component Data
    fileChanged(event: any): Promise<void>,
    reset(): void,

    // Navigation
    navigate(viewID: IViewID, certIndexOrID?: number|string): Promise<void>,

    // Misc Helpers
    displayPosition(position: IBacktestPosition): void,
}





// Views
export type IViewID = "ebe_points"|"backtest"|"discovery"|"certificate";
export interface IView {
    id: IViewID,
    name: string,
    icon: string,
    svg?: boolean
}
