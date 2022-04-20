


export interface IPredictionBacktestingComponent {
    // Initialization
    fileChanged(event: any): Promise<void>,
    resetResults(): void,

    // Navigation
    activateSection(section: ISection, modelID?: string): void,
}





// View Sections
export type ISectionID = 'points'|'accuracy'|'positions'|'duration'|'model';
export interface ISection {
    id: ISectionID,
    name: string,
    icon?: string
}