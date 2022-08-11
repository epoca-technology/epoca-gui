import { ILineChartOptions } from "../../../services";



export interface IRegressionSelectionComponent {
    fileChanged(event: any): Promise<void>,
    reset(): void,
    navigate(sectionID: ISectionID, combIndex?: number): Promise<void>,
    displayActiveCombinationModel(modelIndex: number): void
}




// View Sections
export type ISectionID = 'summary'|'combination';




// Points History Item
export interface IPointsHistoryItem {
    modelID: string,
    pointsMedian: number,
    chart: ILineChartOptions
}