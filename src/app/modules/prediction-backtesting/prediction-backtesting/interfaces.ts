import { ILineChartOptions, IBarChartOptions } from "../../../services";


// Service
export interface IPredictionBacktestingComponent {
    // Initialization
    fileChanged(event: any): Promise<void>,
    resetResults(): void,

    // Navigation
    activateSection(section: ISection, modelID?: string): void,

    // Dialogs
    displayModel(id: string|number): void,

    // Backtest Summary Text
    copyBacktestSummary(): void,
}





// View Sections
export type ISectionID = 'points'|'accuracy'|'positions'|'duration'|'model';
export interface ISection {
    id: ISectionID,
    name: string,
    icon?: string
}



// Model Charts
export interface IModelCharts {
    points: ILineChartOptions,
    accuracy: IBarChartOptions,
    positions: IBarChartOptions,
}