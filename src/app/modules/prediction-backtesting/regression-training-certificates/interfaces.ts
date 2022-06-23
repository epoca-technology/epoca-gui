import { IBacktestPosition } from "../../../core";



export interface IRegressionTrainingCertificatesComponent {
    fileChanged(event: any): Promise<void>,
    reset(): void,
    navigate(sectionID: ISectionID, certIndex?: number): Promise<void>,
    buildCertificateCharts(): void,
    displayPosition(position: IBacktestPosition): void,
}





// View Sections
export type ISectionID = 'general_evaluations'|'reg_evaluations'|'epochs'|'certificate';
export interface ISection {
    id: ISectionID,
    name: string,
    icon?: string
}




// Badge Info
export interface IBadgeInfo {
    highest: { id: number, value: number},
    lowest: { id: number, value: number},
}