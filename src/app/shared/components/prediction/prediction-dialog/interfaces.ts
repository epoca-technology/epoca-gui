import { IModel, IPrediction } from "../../../../core";
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
    priceChange?: {
        change: IChangeMetadata,
        rsi?: IRSIMetadata,
        ema?: IEMAMetadata
    },
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



// RSI Metadata
export interface IRSIMetadata {
    value: number,
    result: 'overbought'|'oversold'|'neutral',
    badge: IMetadataResultBadge,
}

// EMA Metadata
export interface IEMAMetadata { 
    shortValue: number,
    longValue: number,
    distanceValue: number,
    result: 'upwards'|'downwards'|'sideways',
    badge: IMetadataResultBadge,
}