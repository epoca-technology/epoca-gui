

// Component
export interface IRegressionsComponent {
    // Component Data
    fileChanged(event: any): Promise<void>,
    reset(): void,
    activateActiveRegression(): void,

    // Navigation
    navigate(viewID: IViewID, certIndexOrID?: number|string): Promise<void>,
}





// Views
export type IViewID = "ebe_points"|"test_ds_evaluation"|"discovery"|"hyperparams"|"epochs"|"certificate";
export interface IView {
    id: IViewID,
    name: string,
    icon: string,
    svg?: boolean
}
