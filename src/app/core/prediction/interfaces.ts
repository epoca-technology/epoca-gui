

// Prediction Service
export interface IPredictionService {
    // Properties
    resultNames: {[result: string]: IPredictionResultName},
    



    // Models
    getModelTypeName(singleModelCount: number): IModelTypeName,
}








/* Interpreter */




/**
 * Relative Strength Index Indicator (RSI)
 * The RSI is a float that ranges 0-100. As the value gets closer to 100 means that the asset
 * is entering an overbought state. On the other hand, as it gets closer to 0 indicates an 
 * oversold state.
 * If active, it will neutralize longs when the RSI >= overbought as well as shorts when the 
 * RSI <= oversold.
 * Overbought defaults to 80 and Oversold to 20 if none is provided
 */
export interface IRSIConfig {
    active: boolean,
    overbought?: number, 
    oversold?: number, 
}






/**
 * Exponential Moving Average Indicator (EMA)
 * The short and long EMAs indicator helps discover the current trend of the market. 
 * If the short ema is above the long ema by distance% means the asset is currently on
 * an uptrend. On the other hand, if the long ema is above the short ema by distance%
 * means the market is on a downtrend.
 * The distance property indicates the percentual change that must exist between the 
 * short and the long EMA.
 * If active, it will neutralize longs when the market is on a downtrend and shorts when
 * it is on an uptrend. A trend will only be discovered if the percentual difference between 
 * short & long EMA is greater than or equals to the distance provided.
 * Distance defaults to 0.5
 */
export interface IEMAConfig {
    active: boolean,
    distance?: number, 
}





/**
 *  
 * Interpreter Configuration
 * The configuration used in order to interpret the model's predictions based on the 
 * percentual change from the first to the last prediction as well as a series of 
 * indicators that can help understand the current market state.
 */
export interface IInterpreterConfig {
    long: number,
    short: number,
    rsi: IRSIConfig,
    ema: IEMAConfig
}












/* Predictions */




/**
 * When the model evaluates and predicts on current market data, outputs a result of 
 * 1 (long) or 0 (neutral) or -1 (short)
 */
export type IPredictionResult = 1|0|-1;
export type IPredictionResultName = 'Long'|'Short'|'Neutral';






/**
 * Prediction Meta Data
 * This is the data that was used by the interpreter to come up with a result.
 * The only parameters that are required are the description (d) which should always
 * follow the pattern 'long-*' or 'short-*' as well as the Predictions list (pl).
 */
export interface IPredictionMetaData {
    // Interpretation Description
    d: string,  

    // List of predictions generated by Arima
    pl?: number[],

    // RSI value at the time of the prediction
    rsi?: number,

    // Short & Long EMA values at the time of the prediction
    sema?: number,
    lema?: number,
}






/**
 * Prediction
 * The final prediction dict generated by the model. It contains the result, the time
 * in which the prediction was made and the metadata.
 */
export interface IPrediction {
    // Prediction result: -1 | 0 | 1
    r: IPredictionResult,

    // The time in which the prediction was performed (milliseconds)
    t: number,

    /**
     * Prediction metadata: A SingleModel will always output a single IPredictionMetaData
     * whereas, MultiModels will output any number of IPredictionMetaData dictionaries
     */
    md: IPredictionMetaData[]
}









/* Model */




/**
 * Arima Config
 * The configuration to be used on the Arima Instance to generate predictions.
 */
export interface IArimaConfig {
    // The number of predictions to be generated by Arima
    predictions: number,

    /**
     * p is the order (number of time lags) of the autoregressive model
     * d is the degree of differencing (the number of times the data have had past values subtracted)
     * q is the order of the moving-average model.
     */
    p: number,
    d: number,
    q: number,

    /**
     * P, D, Q refer to the autoregressive, differencing, and moving average terms for the 
     * seasonal part of the ARIMA model.
     */
     P: number,
     D: number,
     Q: number,

     // m refers to the number of periods in each season
     m: number
}





/**
 * SingleModel
 * The configuration that will be used by the SingleModel to make predictions.
 */
export interface ISingleModel {
    lookback: number,
    arima: IArimaConfig,
    interpreter: IInterpreterConfig
}





/**
 * Model
 * A Model can be any of the following:
 * SingleModel(1): Determines results based on the prediction of a single model.
 * MultiModel(n): Determines results based on the predictions of multiple single models.
 * StrategyModel(0): Determines results based on the other models.
 */
export interface IModel {
    // The ID of the model.
    id: string,

    /**
     * Only present in MultiModels. The number of single models that must agree to 
     * come up with a prediction result
     */
    consensus?: number,

    // List of SingleModels
    single_models: ISingleModel[]
}




/**
 * Model Type Name
 * Each model has a name that can be used to quickly identify how to functions.
 * - Single Model: The most basic model that exists.
 * - Multi Model: Contains multiple Single Models and the prediction result is based
 * on the consensus.
 * - Decision Model: ?
 */
export type IModelTypeName = 'Single Model'|'Multi Model'|'Decision Model';