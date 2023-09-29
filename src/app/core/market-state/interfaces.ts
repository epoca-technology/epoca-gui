import { ICandlestick } from "../candlestick";




// Service
export interface IMarketStateService {
    // Properties
    colors: IMarketStateColors,
    marketStates: {[result: string|number]: string},
    icons: {[result: string|number]: string},
    coinStateIcons: {[result: string|number]: string},
    splits: ISplitStateID[],
    splitNames: {[splitID: string]: string},
    kzAbove: {[volIntensity: number]: string},
    kzBelow: {[volIntensity: number]: string},
    kzVolIntensityIcons: {[volIntensity: number]: string},
    peakColors: {[liqSide: string]: {[liqIntensity: number]: string}},
    peakWidth: {[layout: string]: {[liqIntensity: number]: number}},

    // Window Management
    getWindowConfiguration(): Promise<IWindowStateConfiguration>,
    updateWindowConfiguration(newConfiguration: IWindowStateConfiguration, otp: string): Promise<void>,

    // Volume Management
    getFullVolumeState(): Promise<IVolumeState>,

    // Liquidity Management
    getFullLiquidityState(): Promise<IFullLiquidityState>,
    getLiquidityConfiguration(): Promise<ILiquidityConfiguration>,
    updateLiquidityConfiguration(newConfiguration: ILiquidityConfiguration, otp: string): Promise<void>,

    // KeyZones Management
    calculateKeyZoneState(): Promise<IKeyZoneFullState>,
    listKeyZoneEvents(startAt: number, endAt: number): Promise<IKeyZoneStateEvent[]>,
    getKeyZonesConfiguration(): Promise<IKeyZonesConfiguration>,
    updateKeyZonesConfiguration(newConfiguration: IKeyZonesConfiguration, otp: string): Promise<void>,

    // Coins Management
    getCoinsSummary(): Promise<ICoinsSummary>,
    installCoin(symbol: string, otp: string): Promise<ICoinsSummary>,
    uninstallCoin(symbol: string, otp: string): Promise<ICoinsSummary>,
    getCoinFullState(symbol: string, btcPrice: boolean): Promise<ICoinState>,
    getCoinsCompressedState(): Promise<ICoinsCompressedState>,
    getCoinsBTCCompressedState(): Promise<ICoinsCompressedState>,
    getCoinsConfiguration(): Promise<ICoinsConfiguration>,
    updateCoinsConfiguration(newConfiguration: ICoinsConfiguration, otp: string): Promise<void>,
    getBaseAssetName(symbol: string): string,

    // Reversal Management
    getReversalState(id: number): Promise<IReversalState>,
    getReversalCoinsStates(id: number): Promise<IReversalCoinsStates>,
    getReversalConfiguration(): Promise<IReversalConfiguration>,
    updateReversalConfiguration(newConfiguration: IReversalConfiguration, otp: string): Promise<void>
}






/**
 * Market State Colors
 * These are the colors that should be used to display state for any of the indicators.
 */
export interface IMarketStateColors {
    // Sideways 
    sideways: string,

    // Increase
    increase_0: string,
    increase_1: string,
    increase_2: string,

    // Decrease
    decrease_0: string,
    decrease_1: string,
    decrease_2: string,
}





/*********
 * STATE *
 *********/




/**
 * State Type
 * All market state modules can be stateful or stateless and are update constantly.
 * There are 2 kinds of modules within the Market State. There are those that rely
 * on a sequence of values and the state is calculated based on the percentage change
 * between the beginning and the end of the window (per split). On the other hand, there are
 * other modules which don't rely on a sequence but instead the result of a series
 * of calculations.
 */
export type IStateType = -2|-1|0|1|2;



 
 
 
 












/****************
 * Split States *
 ****************/





/**
 * Split States
 * In order to better analyze the state of a series of data items, the sequence
 * is split into different ranges, focusing more on the latest items.
 */

// Identifiers
export type ISplitStateID = "s100"|"s75"|"s50"|"s25"|"s15"|"s10"|"s5"|"s2";

// The state can be calculated based on a series of items or candlesticks
export interface ISplitStateSeriesItem {
    x: number,
    y: number
}

// The result of a split state
export interface ISplitStateResult {
    // The state of the item
    s: IStateType,

    // The percentual change in the split
    c: number
}

// Full object containing all the split states & payloads
export interface ISplitStates {
    s100: ISplitStateResult,  // 100%
    s75: ISplitStateResult,   // 75%
    s50: ISplitStateResult,   // 50%
    s25: ISplitStateResult,   // 25%
    s15: ISplitStateResult,   // 15%
    s10: ISplitStateResult,   // 10%
    s5: ISplitStateResult,    // 5%
    s2: ISplitStateResult,    // 2%
}

// Minified split states containing only the state results
export interface IMinifiedSplitStates {
    s100: IStateType,
    s75: IStateType,
    s50: IStateType,
    s25: IStateType,
    s15: IStateType,
    s10: IStateType,
    s5: IStateType,
    s2: IStateType
}











 
 









 
 /****************************************************************************
  * WINDOW STATE                                                             *
  * The purpose of the window state is to enable programatic understanding   *
  * of the current price based on a given window.                            *
  ****************************************************************************/



/**
 * Configuration
 * The Window' Module Configuration that can be managed from the GUI.
 */
export interface IWindowStateConfiguration {
    // The % change required for the window splits to have a state (1 or -1)
    requirement: number,

    // The % change required for the window splits to have a strong state (2 or -2)
    strongRequirement: number
}



// State Object
export interface IWindowState {
    // The state of the window
    s: IStateType,

    // The split states payload
    ss: ISplitStates,

    // The prediction candlesticks that comprise the window
    w: ICandlestick[]
}
 
 
 
 









 
 
 /****************************************************************************
  * VOLUME STATE                                                             *
  * The purpose of the volume state is to enable programatic understanding   *
  * of the volume based on the current value.                                *
  ****************************************************************************/

/**
 * Volume State Intensity
 * The intensity of the volume's state based on the requirements.
 */
export type IVolumeStateIntensity = 0|1|2|3;


// Full State
export interface IVolumeState {
    // The state of the volume
    s: IVolumeStateIntensity,

    // The requirements for the volume to have a state
    m: number,  // Mean
    mm: number, // Mean Medium
    mh: number, // Mean High

    // The volume within the current 1m interval
    v: number
}

 
 


 
 













/********************************************************************************
 * LIQUIDITY STATE                                                              *
 * The purpose of the liquidity state submodule is to have a deep understanding *
 * of the order book, identify levels at which there are liquidity peaks and be *
 * able to determine the market's direction (sentiment?)                        *
 ********************************************************************************/

/**
 * Liquidity Intensity
 * The intensity of the liquidity within a price level.
 */
export type ILiquidityIntensity = 0|1|2|3|4;



/**
 * Liquidity Intensity Weights
 * The weights that will be used to determine the value of each intensity
 * when calculating the state.
 */
export interface ILiquidityIntensityWeights {
    1: number,
    2: number,
    3: number,
    4: number,
}



/**
 * Liquidity Configuration
 * The Liquidity' Module Configuration that can be managed from the GUI.
 */
export interface ILiquidityConfiguration {
    // The minimum intensity that will be included in the AppBulk Stream
    appbulk_stream_min_intensity: ILiquidityIntensity,

    /**
     * The max distance% a peak can be from the price. Peaks beyond this 
     * value are ignored.
     */
    max_peak_distance_from_price: number,

    /**
     * The weights by intensity that will be used to calculate the state
     */
    intensity_weights: ILiquidityIntensityWeights,
}




/**
 * Liquidity Intensity Requirements
 * For a price level to have intensity and be considered a "peak", it needs to be greater 
 * than or equals than the requirements. Otherwise, the intensity will be 0.
 */
export interface ILiquidityIntensityRequirements {
    low: number,        // 1
    medium: number,     // 2
    high: number,       // 3
    veryHigh: number    // 4
}





/**
 * Liquidity Peaks Price Range
 * The price range used to select the peaks that will be used to calculate the bid 
 * liquidity power as well as the price levels that will be included in the state.
 */
export interface ILiquidityPeaksPriceRange {
    // The current market price
    current: number,

    // The upper band used to select the ask peaks (current + max_peak_distance_from_price%)
    upper: number,

    // The lower band used to select the bid peaks (current - max_peak_distance_from_price%)
    lower: number
}





/**
 * Liquidity Side
 * The order book is comprised by asks (Sell Orders) and bids (Buy Orders).
 * Asks are ordered by price from low to high while bids from high to low.
 */
export type ILiquiditySide = "asks"|"bids";






/**
 * Liquidity Price Level
 * The record containing all relevant information regarding a price level.
 */
export interface ILiquidityPriceLevel {
    // The level's price
    p: number,

    // The BTC liquidity within the level
    l: number,

    // The liquidity intensity within the level
    li: ILiquidityIntensity
}







/**
 * Liquidity Side Build
 * When the order book is retrieved in a raw format, it is processed by unit.
 * When calculating the current state of the liquidity, only price levels
 * before or after the current market price will be included.
 */
export interface ILiquiditySideBuild {
    // The total liquidity accumulated in all levels
    t: number,

    // The list of price levels
    l: ILiquidityPriceLevel[]
}





/**
 * Liquidity Processed Orders
 * The exchange's raw order book is processed and converted into this object.
 */
export interface ILiquidityProcessedOrders {
    // The requirements derived from the orders
    requirements: ILiquidityIntensityRequirements,

    // The processed sell orders
    asks: ILiquidityPriceLevel[],

    // The processed buy orders
    bids: ILiquidityPriceLevel[]
}





/**
 * Liquidity Peaks
 * The peaks object containing the price as keys and the intensities as 
 * values.
 */
export interface ILiquidityPeaks { [price: number]: ILiquidityIntensity };



/**
 * Liquidity Peaks' State
 * Whenever the state is being calculated, the liquidity peaks nearby the
 * price are selected and evaluated.
 */
export interface ILiquidityPeaksState {
    // The point shares accumulated by the bids against the asks
    bidLiquidityPower: number,

    // The ask peaks nearby the price
    askPeaks: ILiquidityPeaks,

    // The bid peaks nearby the price 
    bidPeaks: ILiquidityPeaks,
}



/**
 * Minified Liquidity State
 * The minified state object containing only the most essential data.
 */
export interface IMinifiedLiquidityState {
    /**
     * Bid Liquidity Power
     * When the peaks have been identified, the total accumulated value per side will
     * be compared and the BLP will be the bid% out of the total points accumulated
     * by both sides (Based on the intensity weights). 
     * If the BLP is greater than 50, means there peaks are stronger on the bids.
     */
    blp: number,

    /**
     * Liquidity Peaks
     * All the peaks with intensity >= 1 and within the max_peak_distance_from_price% (if any)
     * will be included in these lists.
     */
    ap: ILiquidityPeaks, // Ask Peaks
    bp: ILiquidityPeaks, // Bid Peaks
}





/**
 * Liquidity State
 * The full state of the liquidity. This object can be queried through the endpoint or
 * used by any other module.
 */
export interface ILiquidityState extends IMinifiedLiquidityState {
    /**
     * The liquidity builds by side based on the current price, ordered accordingly:
     * - Asks are ordered by price from low to high
     * - Bids are ordered by price from high to low
     */
    a: ILiquiditySideBuild, // Asks
    b: ILiquiditySideBuild, // Bids
}




/**
 * Liquidity Full State
 * The full liquidity state used to be able to visualize all the data from the GUI.
 */
export interface IFullLiquidityState extends ILiquidityState {
    /**
     * The peaks price range, used to select the peaks from the liquidity that will
     * be used to calculate the state.
     */
    ppr: ILiquidityPeaksPriceRange,

    /**
     * The requirements calculated making use of the whole book by side, useful to
     * determine the price levels with liquidity peaks.
     */
    r: ILiquidityIntensityRequirements,

    // The timestamp in ms in which the liquidity was last built
    ts: number
}
























/*****************************************************************************
 * KEYZONES STATE                                                            *
 * The purpose of the keyzones state is to enable programatic understanding  *
 * of nearby supports and resistances for building more efficient strategies *
 *****************************************************************************/






/**
 * Score Weights
 * The values used to score a KeyZone based on the most relevant parameters.
 */
export interface IKeyZoneScoreWeights {
    // The worth of the KeyZone's Volume Intensity
    volume_intensity: number,

    // The worth of the KeyZone's Liquidity Share
    liquidity_share: number,
}


/**
 * Configuration
 * The KeyZones' Module Configuration that can be managed from the GUI.
 */
export interface IKeyZonesConfiguration {
    /**
     * Build Frequency
     * Once the KeyZones Module is initialized, a build is made and an interval
     * that will re-build the KeyZones every buildFrequencyHours is started.
     */
    buildFrequencyHours: number,

    /**
     * Build Lookback Size
     * The number of 15-minute-interval candlesticks that will be used to build
     * the KeyZones.
     */
    buildLookbackSize: number,

    /**
     * Zone Size
     * The zone's size percentage. The start and end prices are based on this value.
     */
    zoneSize: number,

    /**
     * Merge Distance
     * Once all zones have been set and ordered by price, it will merge the ones that 
     * are close to one another.
     */
    zoneMergeDistanceLimit: number,

    /**
     * State Limit
     * Limits the number of zones returned from the current price. For example, 
     * if 2 is provided, it retrieves 4 zones in total (2 above and 2 below)
     */
    stateLimit: number,

    /**
     * Score Weights
     * The object containing the weights that will be used to calculate a 
     * KeyZone's Score. The score should be limitted to a number from 0 to 10.
     */
    scoreWeights: IKeyZoneScoreWeights,

    /**
     * Price Snapshots Limit
     * The limit of the 1-minute-candlestick snapshots that are taken whenever
     * there is an update (every ~3 seconds).
     */
    priceSnapshotsLimit: number,

    /**
     * Event Duration
     * The number of minutes a KeyZone event will remain active after being
     * issued based on its kind. A KeyZone Event can also be terminated by the
     * price based on eventPriceDistanceLimit.
     */
    supportEventDurationMinutes: number,
    resistanceEventDurationMinutes: number,

    /**
     * Event Price Distance Limit
     * When an event is issued, a price limit is set based on the kind of 
     * KeyZone Contant. For example: If a support keyzone event is issued,
     * the price limit will be the end of the zone (upperband) + eventPriceDistanceLimit%.
     * If the price starts increasing and goes past this price, the KeyZone Event
     * will be cleared.
     * On the contrary, when a resistance event is issued, the price limit will
     * be the start of the zone (lowerband) - eventPriceDistanceLimit%. If the price
     * starts decreasing and goes past this price, the event will be cleared.
     */
    eventPriceDistanceLimit: number,

    /**
     * KeyZone Idle Duration
     * The number of minutes a KeyZone will remain idle after issuing an event.
     */
    keyzoneIdleOnEventMinutes: number,

    /**
     * Event Score Requirement
     * The minimum score needed by a KeyZone in order to be capable of issuing
     * an event.
     */
    eventScoreRequirement: number
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
    t: IReversalType,
    v: number
}



/**
 * Volume Intensity
 * The intensity of the volume within the KeyZone.
 */
export type IKeyZoneVolumeIntensity = 0|1|2|3|4;






/**
 * Idle KeyZones
 * When an event is detected on a KeyZone, this one becomes idle for a period
 * of time. While idling, a KeyZone cannot emmit events.
 */
export interface IIdleKeyZones {
    [keyzoneID: number]: number // KeyZone ID: Idle Until Timestamp
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
export interface IMinifiedKeyZone extends IKeyZonePriceRange {
    // The date in which the keyzone was first detected
    id: number,

    // Volume Intensity
    vi: IKeyZoneVolumeIntensity,

    // Liquidity Share
    ls: number,

    // KeyZone Score
    scr: number
}
export interface IKeyZone extends IKeyZonePriceRange {
    // The date in which the keyzone was first detected
    id: number,

    // List of reversals that took place at the zone, ordered by date ascending
    r: IReversal[],

    // A KeyZone is considered to have mutated when it has reversed in both ways
    m: boolean,

    // The volume mean and intensity
    vm: number,
    vi: IKeyZoneVolumeIntensity
}



/**
 * KeyZone State Event
 * The state event indicates that a KeyZone with a score greater than or equals
 * to the requirement has been hit by the market.
 */
export type IKeyZoneStateEventKind = "s"|"r";
export interface IKeyZoneStateEvent {
    // The kind of event
    k: IKeyZoneStateEventKind,

    // The KeyZone that was hit by the price
    kz: IMinifiedKeyZone,

    // The time at which the event was issued
    t: number,

    // The event's expiration timestamp
    e: number,

    // The event's price limit
    pl: number
}



/**
 * KeyZone State
 * A state can be generated by providing the latest price. It will check if the price
 * is in a zone and return the zones nearby.
 */
export interface IKeyZoneState {
    // The active state event (if any)
    event: IKeyZoneStateEvent|null,

    // The keyzone the price is in (if any)
    active: IMinifiedKeyZone|null,

    // The list of keyzones above the current price
    above: IMinifiedKeyZone[],

    // The list of keyzones below the current price
    below: IMinifiedKeyZone[],
}



/**
 * KeyZone Full State
 * An object containing the full KeyZone State. Can only be obtained through the
 * market state route. 
 */
export interface IKeyZoneFullState {
    // The keyzone the price is in (if any)
    active: IKeyZone|null,

    // The list of keyzones above the current price
    above: IKeyZone[],

    // The list of keyzones below the current price
    below: IKeyZone[],

    // The price snapshots
    price_snapshots: ICandlestick[],

    // Idle KeyZones
    idle: IIdleKeyZones,

    // The timestamp in which the build was generated
    build_ts: number
}
































/********************************************************************************
 * COINS                                                                        *
 * The purpose of the coin state submodule is to have a deep understanding of   *
 * the price movement for each installed coin, as well as keeping the state     *
 * updated.                                                                     *
 ********************************************************************************/




/**
 * Configuration
 * The Coins' Module Configuration that can be managed from the GUI.
 */
export interface ICoinsConfiguration {
    // The duration of the interval that refreshes the supported coins
    supportedCoinsIntervalHours: number,

    // The number of items that comprise the window
    priceWindowSize: number,

    // The number of seconds that will comprise each interval
    priceIntervalSeconds: number,

    // The % change required for the window splits to have a state (1 or -1)
    requirement: number,

    // The % change required for the window splits to have a strong state (2 or -2)
    strongRequirement: number
}





/* Coins */


// The record of a coin
export interface ICoin {
    // The symbol|pair that identifies the coin.
    symbol: string, // "BTCUSDT"|"ETHUSDT"|"BCHUSDT"...

    // The decimal precision to be applied to the coin's price
    pricePrecision: number, // BTC: 2

    // The decimal precision to be applied to the coin's quantity
    quantityPrecision: number // BTC: 3
}


// The object containing all supported or installed coins
export interface ICoinsObject {
    [symbol: string]: ICoin
}


// The object containing all the scores by symbol
export type ICoinScore = 1|2|3|4|5;
export interface ICoinsScores {
    [symbol: string]: ICoinScore
}


// The object containing the installed & supported coins
export interface ICoinsSummary {
    installed: ICoinsObject,
    supported: ICoinsObject,
    scores: ICoinsScores
}





/* State */



// Full Coin State
export interface ICoinState {
    // The state of the coin
    s: IStateType,

    // The split states payload
    ss: ISplitStates,

    // The coin prices within the window
    w: ISplitStateSeriesItem[]
}


// Minified Coin State
export interface IMinifiedCoinState {
    // The state of the coin
    s: IStateType,
}



// State Object
export interface ICoinsState {
    // States By Symbol
    sbs: {[symbol: string]: IMinifiedCoinState},

    // Coins Direction
    cd: IStateType
}







// Compressed State
export interface ICoinCompressedState {
    // The state of the coin
    s: IStateType,

    // The split states payload
    ss: ISplitStates,
}
export interface ICoinsCompressedState {
    // Compressed states by symbol
    csbs: {[symbol: string]: ICoinCompressedState},

    // Coins Direction
    cd: IStateType
}

















/****************************************************************************
 * REVERSAL STATE                                                           *
 * The purpose of the reversal state is to enable programatic understanding *
 * of the current price's potential to reverse its trend.                   *
 ****************************************************************************/


/**
 * Reversal Kind
 * The kind of reversal that is taking place. The value is consistant with
 * the reversal direction. For instance, if there is an active support 
 * contant event ("s"), the reversal kind is 1. In the case of a resistance
 * contact, the reversal kind will be -1. If there is no active KeyZone Event,
 * the reversal kind will be 0.
 */
export type IReversalKind = -1|0|1;



/**
 * Reversal Score Weights
 * In order to determine if a reversal is taking place, a score system that makes
 * use of all other relevant modules will be frequently calculated and is capable
 * of issuing a reversal state once the score reaches min_event_score.
 */
export interface IReversalScoreWeights {
    // The maximum score that can be obtained by the volume module
    volume: number,

    // The maximum score that can be obtained by the liquidity module
    liquidity: number,

    // The maximum score that can be obtained by the coins module
    coins: number,

    // The maximum score that can be obtained by the coins btc module
    coins_btc: number
}



/**
 * Configuration
 * The Reversal's Module Configuration that can be managed from the GUI.
 */
export type IReversalEventSortFunction = "SHUFFLE"|"CHANGE_SUM";
export interface IReversalConfiguration {
    // The minimum score required for a resistance event to be issued
    min_event_score: number,

    /**
     * The sorting mechanism that will be used to order the symbols that are
     * compliant with the kind of reversal.
     */
    event_sort_func: IReversalEventSortFunction,

    // The weights by module that will be used to calculate the score
    score_weights: IReversalScoreWeights
}




/**
 * Reversal Score History
 * The object containing the entire score history since the KeyZone Event
 * was issued. The current score can be accessed through g.at(-1).
 */
export interface IReversalScoreHistory {
    // General Score - The sum of all the points accumulated by the modules
    g: number[],

    // Volume Score
    v: number[],

    // Liquidity Score
    l: number[],

    // Coins' Score
    c: number[],

    // Coins' BTC Score
    cb: number[]
}





/**
 * Reversal Event
 * The event that is issued once the general score reaches min_event_score and
 * there are coins that followed the reversal. Note that if there aren't coins
 * that followed, no reversal event will be issued.
 */
export interface IReversalEvent {
    // The time at which the event was issued
    t: number,

    // The list of symbols that complied with the reversal
    s: string[]
}




/**
 * Reversal State
 * The full state object that contains all important information as well
 * as the score history. When the KeyZone event fades away, this record
 * is stored in the database.
 */
export interface IReversalState {
    /**
     * The reversal's identifier. This value is equals to the time in which the KeyZone event 
     * was issued and can be considered to be the "start" of the reversal state.
     */
    id: number,

    // The time at which the KeyZone Event faded away
    end: number|null, // <- Only populated when ended

    // The kind of reversal that is taking place
    k: IReversalKind,

    // The KeyZone State Event that is being evaluated
    kze: IKeyZoneStateEvent|null,

    /**
     * The initial and final state of all the coins. These values are used
     * to determine which coins followed the reversal.
     */


    // The score object containing the points' history by module. 
    scr: IReversalScoreHistory,

    /**
     * The reversal event, only populated when the event has been issued. Notice
     * that the event can only be issued once even though the score continues
     * to be calculated until the KeyZone Event fades away.
     */
    e: IReversalEvent|null
}




/**
 * Reversal Coins States
 * Since the states of all the coins can be heavy, it is separated and stored
 * in a different db table.
 */
export interface IReversalCoinsStates {
    // Initial state of the coins when the keyzone was hit by the price
    initial: ICoinsCompressedState,

    // The state of the coins when the event was officially issues
    event: ICoinsCompressedState|null,

    // The state of the coins when the KeyZone Event ended.
    final: ICoinsCompressedState|null
}






/**
 * Minified Reversal State
 * The minified reversal object containing only essential data.
 */
export interface IMinifiedReversalState {
    // Reversal's Identifier
    id: number,

    // The kind of reversal that is taking place
    k: IReversalKind,

    // The total accumulated score so far
    s: number,

    // Reversal Event
    e: IReversalEvent|null
}


















 
 
 
 
 
 /*********************************************************************************
  * MARKET STATE                                                                  *
  * Every certain period of time, the market state is calculated and broadcasted. *
  * This enables other modules to perform actions based on any kind of event.     *
  *********************************************************************************/
export interface IMarketState {
    window: IWindowState,
    volume: IVolumeStateIntensity,
    liquidity: IMinifiedLiquidityState,
    keyzones: IKeyZoneState,
    coins: ICoinsState,
    coinsBTC: ICoinsState,
    reversal: IMinifiedReversalState
}





