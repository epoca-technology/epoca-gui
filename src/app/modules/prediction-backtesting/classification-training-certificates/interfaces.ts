

export interface IClassificationTrainingCertificatesComponent {
    
}






// View Sections
export type ISectionID = 'evaluations'|'epochs'|'certificate';
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