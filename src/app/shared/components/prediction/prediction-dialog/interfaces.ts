import { ICandlestick, IModel, IPrediction } from "../../../../core";
import { ILineChartOptions } from "../../../../services";


// Controller
export interface IPredictionDialogComponent {
    close(): void
}



// Required Data
export interface IPredictionDialogComponentData {
    model: IModel,
    prediction: IPrediction,
    outcome?: boolean
}




/* Component Metadata */


// Final Metadata Object
export interface IMetadata {
    // Present in all models even when cache is enabled
    description: string,

    // Present in Regression Models
    priceChange?: IChangeMetadata,

    // Present in Classification Models
    probabilities?: any
}





// Result Badges
export type IMetadataResultBadge = 'square-badge-neutral'|'square-badge-success'|'square-badge-error';



// Results
export type IMetadataResultName = 'long'|'short'|'neutral';







/* Prediction Percent Change */


// Prediction Price Change Metadata
export interface IChangeMetadata { 
    value: number,
    result: IMetadataResultName,
    badge: IMetadataResultBadge,
    chart: ILineChartOptions
}

// Change
export interface IChangeMetadataChartSeries {
    predictions: number[],
    real: number[],
    categories: number[]
}


// Separated Candlesticks
export interface ISeparatedCandlesticks {
    head: ICandlestick[],
    tail: ICandlestick[],
}






/* Prediction Probability */


export interface IProbabilityMetadata { 
    result: IMetadataResultName,
    badge: IMetadataResultBadge,
    upProbability: number,
    downProbability: number,
    features: IProbabilityMetadataFeature[]
}



export type IFeatureType = "regression"|"rsi"|"stoch"|"aroon"|"stc"|"mfi";
export interface IProbabilityMetadataFeature {
    value: number,  // Can be a prediction result (1, 0, -1) or a normalized TA value
    type: IFeatureType,
    model?: IModel
}