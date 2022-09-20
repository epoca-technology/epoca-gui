


export interface IDiscoveryViewComponent {
    activateInsight(index: number): void
}



export type IPredictionInsightName = 
"All Increase"|
"Successful Increase"|
"Unsuccessful Increase"|
"All Decrease"|
"Successful Decrease"|
"Unsuccessful Decrease";

export type IPredictionInsightClass = "increase_insight"|"decrease_insight";


export type IPredictionInsightIcon = "trending_up"|"trending_down";


export type IPredictionInsightColor = "#004D40"|"#B71C1C";


export interface IPredictionInsight {
    name: IPredictionInsightName, 
    class: IPredictionInsightClass, 
    icon: IPredictionInsightIcon,
    color: IPredictionInsightColor
}