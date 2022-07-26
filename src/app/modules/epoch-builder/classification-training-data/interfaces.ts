


export interface IClassificationTrainingDataComponent {
    // Initialization
    fileChanged(event: any): Promise<void>,
    reset(): void,

    // Data Pagination
    gotoStart(): void,
    goForward(): void,
    goBackward(): void,
    gotoEnd(): void,

    // Dialogs
    displayModel(id: string|number): void,
}