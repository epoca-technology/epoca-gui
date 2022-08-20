


export interface IDiscoveryPayloadViewComponent {
    activateInsight(index: number): void
}



export type IPredictionInsightName = "Increase"|"Successful Increase"|"Decrease"|"Successful Decrease";

export type IPredictionInsightClass = "increase_insight"|"successful_increase_insight"|"decrease_insight"|"successful_decrease_insight";


export type IPredictionInsightIcon = "trending_up"|"trending_down";

export type IPredictionInsightColor = "#4DB6AC"|"#004D40"|"#E57373"|"#B71C1C";


export interface IPredictionInsight {
    name: IPredictionInsightName, 
    class: IPredictionInsightClass, 
    icon: IPredictionInsightIcon,
    color: IPredictionInsightColor
}