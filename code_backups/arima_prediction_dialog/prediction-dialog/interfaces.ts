import { ICandlestick, IModel, IPrediction } from "../../../../core";
import { ILineChartOptions } from "../../../../services";


// Controller
export interface IPredictionDialogComponent {
    close(): void
}



// Required Data
export interface IPredictionDialogComponentData {
    model: IModel,
    prediction: IPrediction
}




/* Component Metadata */


// Final Metadata Object
export interface IMetadata {
    // Present in all models even when cache is enabled
    description: string,

    // Present in Regression Models
    priceChange?: IChangeMetadata,

    
}



// Result Badges
export type IMetadataResultBadge = 'square-badge-neutral'|'square-badge-success'|'square-badge-error';

// Results
export type IChangeMetadataResult = 'long'|'short'|'neutral';

// Prediction Price Change Metadata
export interface IChangeMetadata { 
    value: number,
    result: IChangeMetadataResult,
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