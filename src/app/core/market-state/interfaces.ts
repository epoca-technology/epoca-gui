
/*********
 * STATE *
 *********/

import { ICandlestick } from "../candlestick";



/**
 * State Type
 * A stateless type is active when the change between the beginning and
 * the end of the window (or any sequence) doesn't meet the requirement.
 * An increasing state is issued when the window as increased the required
 * % and that the latest value is within the upper band. On the other hand,
 * for a decreasing state to be issued, the window must have decreased the
 * required % and the latest value must be within the lower band.
 */
 export type IStateType = "stateless"|"increasing"|"decreasing";



 /**
  * State Band
  * Represents the beginning and end of the upper or lower band.
  */
 export interface IStateBand {
     start: number,
     end: number
 }
 
 
 
 /**
  * State
  * A state can be calculated with a window or any kind of sequence. This interface
  * can also be extended and tailored per module.
  */
 export interface IState {
     // State
     state: IStateType,
     state_value: number,
 
     // Bands
     upper_band: IStateBand,
     lower_band: IStateBand,
 
     // The timestamp in which the state was last updated
     ts: number
 }
 
 
 
 
 
 
 
 /****************************************************************************
  * WINDOW STATE                                                             *
  * The purpose of the window state is to enable programatic understanding   *
  * of the current price based on a given window.                            *
  ****************************************************************************/
 export interface IWindowState extends IState {
     // The prediction candlesticks that comprise the window
     window: ICandlestick[]
 }
 
 
 
 






 
 
 /****************************************************************************
  * VOLUME STATE                                                             *
  * The purpose of the volume state is to enable programatic understanding   *
  * of the volume based on the current value.                                *
  ****************************************************************************/
 export interface IVolumeState extends IState {
     // The list of grouped volumes
     volumes: number[]
 }
 
 


 
 
 
 
 
 


 
 
 /****************************************************************************
  * NETWORK FEE STATE                                                        *
  * The purpose of the network fee state is to enable programatic            *
  * understanding of the bitcoin network fees based on the latest value      *
  ****************************************************************************/
  /**
  * Mempool Block Fee Record
  * When interacting with Mempool's API, a list of records will be retrieved.
  * For this module, make use of the avgFee_50 property.
  */
export interface IMempoolBlockFeeRecord {
     avgHeight: number,
     timestamp: number,
     avgFee_0: number,
     avgFee_10: number,
     avgFee_25: number,
     avgFee_50: number, // <- Use this property
     avgFee_75: number,
     avgFee_90: number,
     avgFee_100: number
 }

export interface INetworkFeeState extends IState {
     // The current height of the bitcoin blockchain
     height: number,
 
     // The list of grouped fees
     fees: number[]
 }
 
 







 


/****************************************************************************
 * OPEN INTEREST STATE                                                      *
 * The purpose of the open interest state is to enable programatic          *
 * understanding of the interest in the futures market.                     *
 ****************************************************************************/
 export interface IOpenInterestState extends IState {
    // The list of grouped interest values
    interest: number[]
}












/****************************************************************************
 * LONG/SHORT RATIO STATE                                                   *
 * The purpose of the long/short state is to enable programatic             *
 * understanding of the ratio in the futures market.                        *
 ****************************************************************************/
 export interface ILongShortRatioState extends IState {
    // The list of grouped long/short ratio values
    ratio: number[]
}


 
 







 
 
 
 /*****************************************************************************
  * KEYZONES STATE                                                            *
  * The purpose of the keyzones state is to enable programatic understanding  *
  * of nearby supports and resistances for building more efficient strategies *
  *****************************************************************************/
 
 
 /**
  * KeyZone Candlestick
  * When the raw daily candlesticks are downloaded from Binance, they are converted
  * into the following format in order to simplify the interactions.
  */
 export interface IKeyZoneCandlestick {
     // Open Time
     ot: number,
 
     // Highest price in the candlestick
     h: number,
 
     // Lowest price in the candlestick
     l: number
 }
 
 
 
 /**
  * Reversal Type
  * A reversal can be of 2 kinds:
  * Resistance: Price touches a resistance zone and reverses.
  * Support: Price touches a support zone and reverses.
  */
 export type IReversalType = "r"|"s"; // r = Resistance | s = Support
 
 
 
 /**
  * Reversal
  * A series of reversals are detected based on the daily candlesticks and then
  * included into a "KeyZone".
  */
 export interface IReversal {
     id: number, // The open time of the candlestick in which the reversal was detected
     t: IReversalType
 }
 
 
 
 /**
  * KeyZone Price Range
  * The price range that comprises a KeyZone.
  */
 export interface IKeyZonePriceRange {
     s: number,  // Start Price (Highest High or Lowest Low)
     e: number   // End Price (+/- zone_size% from start price)
 }
 
 
 /**
  * KeyZone
  * A keyzone is a price range in which the price will likely reverse.
  */
 export interface IKeyZone extends IKeyZonePriceRange {
     // The date in which the keyzone was first detected
     id: number,
 
     // List of reversals that took place at the zone, ordered by date ascending
     r: IReversal[],
 
     // A KeyZone is considered to have mutated when it has reversed in both ways
     m: boolean
 }
 
 
 
 /**
  * KeyZone State
  * A state can be generated by providing the latest price. It will check if the price
  * is in a zone and return the zones nearby.
  */
 export interface IKeyZoneState {
     // The keyzone the price is in (if any)
     active: IKeyZone|undefined,
 
     // The list of keyzones above the current price
     above: IKeyZone[],
 
     // The list of keyzones below the current price
     below: IKeyZone[],
 
     // The timestamp in which the state was generated
     ts: number,
 
     // The timestamp in which the build was las updated
     build_ts: number
 }
 


















/****************************
 * TECHNICAL ANALYSIS STATE *
 ****************************/




/**
 * Technical Analysis Datasets
 * In order to optimize the calculation process, the candlesticks
 * must be converted into datasets. Each list should have at least
 * 210 items.
 */
export interface ITADataset {
    open: number[],
    close: number[],
    high: number[],
    low: number[],
    volume: number[]
}
export interface ITADatasets {
    "30m": ITADataset,
    "2h": ITADataset,
    "4h": ITADataset,
    "1d": ITADataset
}





/**
 * Interval Identifier
 * In order to be able to identify what most traders are seeing, 
 * the indicators are calculated for all popular intervals.
 */
export type ITAIntervalID = "30m"|"2h"|"4h"|"1d";



/**
 * Indicator State Action
 * The indicator's suggested action.
 */
export type ITAIndicatorAction = "BUY"|"SELL"|"NEUTRAL";




/**
 * Interval State Action
 * In contrast to the indicator state, if many buys or sells suggestions
 * accumulate, a "strong" state is generated.
 */
export type ITAIntervalStateAction = "BUY"|"STRONG_BUY"|"SELL"|"STRONG_SELL"|"NEUTRAL";



/**
 * Interval State Result Counter
 * The counter used to store the indicators' suggested actions.
 */
export interface ITAIndicatorActionCounter {
    BUY: number,
    SELL: number,
    NEUTRAL: number
}



/**
 * Interval State Result
 * The result for the summary, oscillators and the moving averages.
 */
export interface ITAIntervalStateResult {
    // Action: the action suggested by the state results
    a: ITAIntervalStateAction,

    // Buy: the count of the indicators that suggest the price will rise
    b: number,

    // Sell: The count of the indicators that suggest the price will fall
    s: number,

    // Neutral: the count of the indicators that have no suggestions
    n: number
}



/**
 * Indicator Payload
 * The object built when an indicator is calculated and evaluated.
 */
export interface ITAIndicatorPayload {
    // Value: the result of the indicator
    v: number[],

    // Action: the action suggested by the indicator
    a: ITAIndicatorAction
}




/**
 * Oscillators Build
 * All the data related to the current state of the oscillators
 * for a given interval.
 */
export interface ITAOscillatorsBuild {
    // The indicator Action Counter for the oscillators only
    counter: ITAIndicatorActionCounter,

    // Indicators Payload
    rsi_14: ITAIndicatorPayload,
    cci_20: ITAIndicatorPayload,
    adx_14: ITAIndicatorPayload,
    ao: ITAIndicatorPayload,
    mom_10: ITAIndicatorPayload,
    macd_12_26_9: ITAIndicatorPayload,
    stoch_14_1_3: ITAIndicatorPayload,
    stochrsi_14: ITAIndicatorPayload,
    willr_14: ITAIndicatorPayload,
    ultosc_7_14_28: ITAIndicatorPayload
}


/**
 * Moving Averages Build
 * All the data related to the current state of the moving averages
 * for a given interval.
 */
export interface ITAMovingAveragesBuild {
    // The indicator Action Counter for the moving averages only
    counter: ITAIndicatorActionCounter,

    // Indicators Payload
    ema_10: ITAIndicatorPayload,
    ema_20: ITAIndicatorPayload,
    ema_30: ITAIndicatorPayload,
    ema_50: ITAIndicatorPayload,
    ema_100: ITAIndicatorPayload,
    ema_200: ITAIndicatorPayload,
    sma_10: ITAIndicatorPayload,
    sma_20: ITAIndicatorPayload,
    sma_30: ITAIndicatorPayload,
    sma_50: ITAIndicatorPayload,
    sma_100: ITAIndicatorPayload,
    sma_200: ITAIndicatorPayload,
    hma_9: ITAIndicatorPayload
}



/**
 * Interval State Result Build
 * Object generated once all technical analysis indicators have been
 * calculated. Contains the results for each category.
 */
export interface ITAIntervalStateResultBuild {
    summary: ITAIntervalStateResult,
    oscillators: ITAIntervalStateResult,
    moving_averages: ITAIntervalStateResult,
}





/**
 * Interval State
 * The object containing the final technical analysis state for an interval.
 */
export interface ITAIntervalState {
    // Summary: The result of the state, combining oscillators and moving averages
    s: ITAIntervalStateResult,

    // Oscillators: The result of the oscillators
    o: ITAIntervalStateResult,

    // Moving Averages: The result of the moving averages
    m: ITAIntervalStateResult,

    // The payload containing the indicator's data
    p: {
        // Oscillators
        rsi_14: ITAIndicatorPayload,
        cci_20: ITAIndicatorPayload,
        adx_14: ITAIndicatorPayload,
        ao: ITAIndicatorPayload,
        mom_10: ITAIndicatorPayload,
        macd_12_26_9: ITAIndicatorPayload,
        stoch_14_1_3: ITAIndicatorPayload,
        stochrsi_14: ITAIndicatorPayload,
        willr_14: ITAIndicatorPayload,
        ultosc_7_14_28: ITAIndicatorPayload,

        // Moving Averages
        ema_10: ITAIndicatorPayload,
        ema_20: ITAIndicatorPayload,
        ema_30: ITAIndicatorPayload,
        ema_50: ITAIndicatorPayload,
        ema_100: ITAIndicatorPayload,
        ema_200: ITAIndicatorPayload,
        sma_10: ITAIndicatorPayload,
        sma_20: ITAIndicatorPayload,
        sma_30: ITAIndicatorPayload,
        sma_50: ITAIndicatorPayload,
        sma_100: ITAIndicatorPayload,
        sma_200: ITAIndicatorPayload,
        hma_9: ITAIndicatorPayload
    }
}





/**
 * Technical Analysis State
 * The current state of the technicals based on the intervals. This object is 
 * inserted into the market state.
 */
export interface ITAState {
    // States by Interval
    "30m": ITAIntervalState,
    "2h": ITAIntervalState,
    "4h": ITAIntervalState,
    "1d": ITAIntervalState,

    // The timestamp in which the state was generated
    ts: number
}













 
 
 
 
 
 /*********************************************************************************
  * MARKET STATE                                                                  *
  * Every certain period of time, the market state is calculated and broadcasted. *
  * This enables other modules to perform actions based on any kind of event.     *
  *********************************************************************************/
export interface IMarketState {
    window: IWindowState,
    volume: IVolumeState,
    keyzone: IKeyZoneState,
    network_fee: INetworkFeeState,
    open_interest: IOpenInterestState,
    long_short_ratio: ILongShortRatioState,
    technical_analysis: ITAState
}