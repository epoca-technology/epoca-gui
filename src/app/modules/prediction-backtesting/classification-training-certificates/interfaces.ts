

export interface IClassificationTrainingCertificatesComponent {
    
}






// View Sections
export type ISectionID = 'class_evaluations'|'evaluations'|'epochs'|'certificate';
export interface ISection {
    id: ISectionID,
    name: string,
    icon?: string
}



// Accuracy Chart Data

export interface IAccuracyChartItem {
    name: string, 
    data: number[]
}
export interface IAccuracyChartData {
    accuracy: IAccuracyChartItem,
    val_accuracy: IAccuracyChartItem,
}




// Badge Info
export interface IBadgeInfo {
    best: { id: number, value: number},
    worst: { id: number, value: number},
}