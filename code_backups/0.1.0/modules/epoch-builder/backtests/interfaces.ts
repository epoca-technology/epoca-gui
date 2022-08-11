import { IBacktestPosition } from "../../../core";
import { IBarChartOptions, IPieChartOptions } from "../../../services";


// Service
export interface IBacktestsComponent {
    // Initialization
    fileChanged(event: any): Promise<void>,
    resetResults(): void,

    // Navigation
    activateSection(section: ISection, modelID?: string): void,
    activateModel(modelID: string): void,

    // Dialogs
    displayModel(id: string|number): void,
    displayPosition(position: IBacktestPosition): void,

    // Backtest Summary Text
    copyBacktestSummary(): void,
}





// View Sections
export type ISectionID = 'points'|'points_median'|'accuracy'|'positions'|'model';
export interface ISection {
    id: ISectionID,
    name: string,
    icon?: string
}



// Model Charts
export interface IModelCharts {
    points: IBarChartOptions,
    accuracy: IBarChartOptions,
    positions: IPieChartOptions,
    outcomes: IPieChartOptions,
}
