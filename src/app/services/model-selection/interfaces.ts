



export interface IModelSelectionService {
    // Properties
    selected: {[modelID: string]: ISelectedModel},
    selectedList: ISelectedModel[],

    // Selection Management
    select(id: string, points: number): void,
    unselect(id: string): void,
    reset(): void,

    // Selection Output
    copySelectionString(): void
}






export interface ISelectedModel {
    id: string,
    points: number
}