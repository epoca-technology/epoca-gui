

// Component
export interface IKerasRegressionsComponent {
    // Component Data
    fileChanged(event: any): Promise<void>,
    reset(): void,

    // Navigation
    navigate(viewID: IViewID, certIndexOrID?: number|string): Promise<void>,

}





// Views
export type IViewID = "ebe_points"|"single_shot_test_datasets"|"autoregressive_test_datasets"|"discovery"|"hyperparams"|"epochs"|"certificate";
export interface IView {
    id: IViewID,
    name: string,
    icon: string,
    svg?: boolean
}
