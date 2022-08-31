import { IModel } from "../../../../../core";



export interface IClassificationFeaturesContentComponent {
    
}






export interface IClassificationFeaturesConfig {
    features_num: number,
    regressions: IModel[],
    include_rsi: boolean,
    include_aroon: boolean
}