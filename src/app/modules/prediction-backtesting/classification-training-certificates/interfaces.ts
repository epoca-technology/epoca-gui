

export interface IClassificationTrainingCertificatesComponent {
    
}






// View Sections
export type ISectionID = 'general_evaluations'|'class_evaluations'|'evaluations'|'epochs'|'certificate';
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




/* Probability Heat Map */


export type IHeatmapItemName = "increase"|"increase_successful"|"decrease"|"decrease_successful";


export type IHeatmapItemStateClass = 
// Increase
"increase-intensity-1"|"increase-intensity-2"|"increase-intensity-3"|"increase-intensity-4"|"increase-intensity-5"|

// Decrease
"decrease-intensity-1"|"decrease-intensity-2"|"decrease-intensity-3"|"decrease-intensity-4"|"decrease-intensity-5";


export interface IHeatmapItemProbabilityRange {
    min: number,
    max: number
}


export interface IHeatmapItemState {
    state_description: string, // 19 predictions (21%)
    state_class: IHeatmapItemStateClass
}

export interface IHeatmapItem {
    prob_range: string, // 60% - 64.99%
    increase: IHeatmapItemState,
    increase_successful: IHeatmapItemState,
    decrease: IHeatmapItemState,
    decrease_successful: IHeatmapItemState,
}