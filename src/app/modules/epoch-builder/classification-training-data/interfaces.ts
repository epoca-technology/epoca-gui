


export interface IClassificationTrainingDataComponent {
    // Init
    fileChanged(event: any): Promise<void>,
    reset(): void,

    // Navigation
    tabChanged(newIndex: number): void,

    // Dataset Pagination
    dsGotoStart(): void,
    dsGoForward(): void,
    dsGoBackward(): void,
    dsGotoEnd(): void,

    // Insight
    insightGotoStart(): void,
    insightGoForward(): void,
    insightGoBackward(): void,
    insightGotoEnd(): void,
    toggleInsightFeature(feature: string): void

}