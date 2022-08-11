import { IModel } from "../../../../../core";



export interface IClassificationFeaturesContentComponent {
    
}






export interface IClassificationFeaturesData {
    features_num: number,
    regressions: IModel[],
    include_rsi: boolean,
    include_aroon: boolean
}