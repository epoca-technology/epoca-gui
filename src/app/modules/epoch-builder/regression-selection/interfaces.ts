

// Component
export interface IRegressionSelectionComponent {
    fileChanged(event: any): Promise<void> ,
    reset(): void
}






// Views
export type IViewID = "selection"|"discovery"|"regression";
export interface IView {
    id: IViewID,
    name: string,
    icon: string,
    svg?: boolean
}