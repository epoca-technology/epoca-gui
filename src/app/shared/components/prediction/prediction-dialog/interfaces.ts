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
    description: string,
    priceChange?: IChangeMetadata,

    // Decision Models will have other properties 
}



// Result Badges
export type IMetadataResultBadge = 'square-badge'|'square-badge-success'|'square-badge-error';

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