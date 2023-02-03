


export interface ITechnicalAnalysisDialogComponent {
    displayTooltip(): void,
    close(): void
}




export interface IActionPercentages {
    s: number,
    n: number,
    b: number,
}


export type IIndicatorGridClass = "buy-grid-item"|"sell-grid-item"|"neutral-grid-item"
export interface IIndicatorGridItem {
    name: string,
    class: IIndicatorGridClass
}