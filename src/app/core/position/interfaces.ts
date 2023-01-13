import { IPredictionState } from "../prediction";





// Service
export interface IPositionService {
    // Position Management
    open(side: IBinancePositionSide, otp: string): Promise<void>,
    close(side: IBinancePositionSide, chunkSize: number, otp: string): Promise<void>,

    // Position Strategy
    updateStrategy(newStrategy: IPositionStrategy, otp: string): Promise<void>,

    // Misc Calculators
    calculatePositionPriceRange(
        side: IBinancePositionSide, 
        leverage: number, 
        trades: IPositionCalculatorTradeItem[]
    ): IPositionPriceRange,

    // Position Health Candlesticks
    getPositionHealthCandlesticks(side: IBinancePositionSide): Promise<IPositionHealthCandlesticks>,

    // Position Trades
    listTrades(startAt: number, endAt: number): Promise<IPositionTrade[]>
}








/***********
 * General *
 ***********/


// Position Action Side
export type IBinancePositionActionSide = "BUY"|"SELL";

// Position Side
export type IBinancePositionSide = "LONG"|"SHORT";

// Margin Type
export type IBinanceMarginType = "isolated"|"cross";











/********************
 * Position Summary *
 ********************/



/**
 * Position Summary
 * This object contains all the relevant information regarding
 * the futures account.
 */
 export interface IPositionSummary {
    // Futures Account Balance
    balance: IAccountBalance,

    // The current strategy
    strategy: IPositionStrategy,

    // The active long position. If none is, it will be undefined
    long: IActivePosition|undefined,

    //The active short position. If none is, it will be undefined
    short: IActivePosition|undefined,

    // The current active position's health
    health: IPositionHealthState
}


















/*********************
 * Position Strategy *
 *********************/





/**
 * Take Profit Level
 * The trading strategy makes use of 5 take profit levels that have different
 * characteristics.
 */
export interface ITakeProfitLevel {
    // The price percentage change from the entry price for the level to be active
    price_change_requirement: number,

    /**
     * The maximum HP Drawdown% allowed in the level. Is this requirement is not met, 
     * the position is closed.
     */
    max_hp_drawdown: number
}




/**
 * Strategy 
 * The configuration that handles the core position entry and exit flow.
 */
export interface IPositionStrategy {
    /**
     * Position Status
     * Each side has its own status. When enabled and a matching prediction
     * is generated, it will open a position.
     */
    long_status: boolean,
    short_status: boolean,

    /**
     * Hedge Mode
     * If this option is enabled, the model can open a long and a short
     * simultaneously. Otherwise, it will only handle 1 active position at
     * a time.
     */
    hedge_mode: boolean,

    // The leverage that will be used on positions
    leverage: number,

    /**
     * Position Size
     * The amount of money allocated to the position will always be 
     * the same, no matter the side. If there isn't enough balance
     * to cover the size, the position cannot be opened.
     */
    position_size: number,

    /**
     * Profit Optimization Strategy
     * When a position is opened, a take profit grid is generated. Each level
     * activates when hit by the spot price. The position is maintained active
     * until the HP experiences a drawdown that goes past the level's tolerance.
     */
    take_profit_1: ITakeProfitLevel,
    take_profit_2: ITakeProfitLevel,
    take_profit_3: ITakeProfitLevel,
    take_profit_4: ITakeProfitLevel,
    take_profit_5: ITakeProfitLevel,

    /**
     * Loss Optimization Strategy
     * Each position has a fixed price in which it will be closed no matter what.
     * Additionally, if the position's HP drawdown was to exceed the tolerance
     * in stop_loss_max_hp_drawdown, the position will be closed automatically,
     * regardless of the spot price.
     */
    stop_loss: number,
    stop_loss_max_hp_drawdown: number,

    /**
     * Idle
     * When a position is closed, the model remains idle for idle_minutes 
     * before being able to open more positions.
     * A side can open a position as long as: 
     * state == true && current_time > idle_until
     */
    long_idle_minutes: number,
    long_idle_until: number,
    short_idle_minutes: number,
    short_idle_until: number,

    // The timestamp in which the strategy was last updated
    ts: number
}














/*******************
 * Position Health *
 *******************/



/**
 * Position Health State
 * Contains the current HP details for both sides. If there is no
 * active position for a side, it will be null.
 */
export interface IPositionHealthState {
    long: IPositionSideHealth|null,
    short: IPositionSideHealth|null,
}



/**
 * Position Side Health
 * The object containing all the relevant information regarding an
 * active position on a specific side.
 */
export interface IPositionSideHealth {
    // Open Sum: the prediction sum when the position was opened
    os: number,

    /**
     * Health Points
     * When a position is opened, the initial HP is stored. More over,
     * as time goes on, it constantly updates the highest and lowest
     * HP values recorded. The points specific properties are:
     */
    ohp: number, // Open Health Points: the HP when the position was opened.
    hhp: number, // Highest Health Points: the highest HP the position has reached.
    lhp: number, // Lowest Health Points: the lowest HP the position has reached.
    chp: number, // Current Health Points: the current HP count.

    /**
     * Drawdown
     * The drawdown is the percentage change between the highest hp and the
     * current hp. If the current hp is equals to the highest hp, the drawdown
     * is equals to 0.
     */
    dd: number,

    // Timestamp: the date in which the position was opened (Inexact)
    ts: number
}




/**
 * Position Health Weights
 * In order to determine the health of a position, the weights for 
 * each factor must be assigned.
 */
export interface IPositionHealthWeights {
    // The trend sum generated by the PredictionModel
    trend_sum: number,

    // The direction of the trend sum
    trend_state: IPredictionState,

    // The state of the technical analysis indicators
    ta_30m: number,
    ta_2h: number,
    ta_4h: number,
    ta_1d: number,

    // The state of the open interest within the market state window
    open_interest: number,

    // The state of the long/short ratio within the market state window
    long_short_ratio: number
}





/* Position Health Candlesticks */



/**
 * Position Health Candlesticks
 * When a position is opened, the HP is constantly calculated and the 
 * history is stored in order for users to analyze the behaviour and
 * improve the trading strategy.
 */
export interface IPositionHealthCandlesticks {
    hp: IPositionHealthCandlestick[],
    dd: IPositionHealthCandlestick[]
}


/**
 * Position Health Candlestick
 * The object used to interact and display the position health candlesticks.
 */
export interface IPositionHealthCandlestick {
    // Open Timestamp: the time in which the candlestick was first built
    ot: number,

    // Open: the HP|Drawdown when the candlestick was first built
    o: number,

    // High: the highest HP|Drawdown in the candlestick
    h: number,

    // Low: the lowest HP|Drawdown in the candlestick
    l: number,

    // Close: the last HP|Drawdown in the candlestick 
    c: number
}


/**
 * Active Candlesticks
 * The position health class builds the candlesticks in RAM. Moreover,
 * it can handle one or both sides at a time.
 */
export interface IPositionHealthActiveCandlesticks {
    hp: IPositionHealthCandlestick|undefined,
    dd: IPositionHealthCandlestick|undefined
}



















/*******************
 * BINANCE ACCOUNT *
 *******************/




/**
 * Account Balance
 * In Epoca, the balance is always referring to USDT and is always extracted
 * fresh from Binance's API.
 */
export interface IAccountBalance {
    // The available balance in the account that can be used to initialize positions
    available: number,

    // The balance that has been allocated to positions (margin)
    on_positions: number,

    // The total balance in the account including unrealized pnl
    total: number,

    // The time in which the balance data was last updated by Binance
    ts: number
}





/**
 * Active Position
 * The active position including all the details in order to measure
 * risks and visualize targets.
 */
export interface IActivePosition {
    // The type of position "LONG"|"SHORT".
    side: IBinancePositionSide,

    // The weighted entry price based on all the trades within the position.
    entry_price: number,

    // The mark price when the active positions were updated.
    mark_price: number,

    // The prices at which each level is activated
    take_profit_price_1: number,
    take_profit_price_2: number,
    take_profit_price_3: number,
    take_profit_price_4: number,
    take_profit_price_5: number,

    // The price in which the position is labeled as "unsuccessful" and is ready to be closed.
    stop_loss_price: number,

    // The price at which the position will be automatically liquidated by the exchange.
    liquidation_price: number,

    // The current unrealized PNL in USDT
    unrealized_pnl: number,

    // The current return on equity
    roe: number,

    // The total margin (USDT) put into the position.
    isolated_wallet: number,

    // The current value of the isolated_wallet + unrealized_pnl.
    isolated_margin: number,

    // The size of the position in BTC with leverage included.
    position_amount: number,

    // The size of the position in USDT with leverage included.
    notional: number,

    // The timestamp in ms at which the position was updated.
    ts: number
}




/**
 * Position Trade
 * A position can have 1 or many trades. The limit is established
 * in the strategy.
 */
 export interface IPositionTrade {
    /**
     * The identifier of the trade. Due to lack of knowledge regarding
     * Binance internals, the identifier of the trade will follow the format:
     * id_orderId -> '245986349_3256128709'
     * In case either of the values is not provided by Binance, they will be 
     * replaced with NA. For example:
     * 'NA_3256128709'|'245986349_NA'|'NA_NA'
     * Since the given identifier is not reliable, it should be used as a 
     * primary key. Moreover, the 't' property must be indexed.
     */
    id: string,

    // The time in milliseconds at which the trade was executed
    t: number, // Timestamp

    /**
     * The action side of the trade. Used to identify if a position was 
     * opened, increased or closed.
     */
    s: IBinancePositionActionSide, // Side

    // The type of position that holds the trade
    ps: IBinancePositionSide, // Position Side

    // The price at which the trade was executed
    p: number, // Price

    // The amount of Bitcoin that was traded
    qty: number, // Quantity

    // The amount of USDT that was traded
    qqty: number, // Quote Quantity

    /**
     * The profit or loss generated by the trade. If the trade is not a 
     * closer, this value will be equals to 0.
     */
    rpnl: number, // Realized PNL

    /**
     * The fee charged by the exchange in order to execute the trade
     */
    c: number // Comission
}






















/***************************
 * GUI SPECIFIC INTERFACES *
 ***************************/




/**
 * Binance Leverage Tiers
 * Values used in order to be able to calculate liquidation prices.
 * For more information, goto: 
 * https://gist.github.com/highfestiva/b71e76f51eed84d56c1be8ebbcc286b5
 */
export interface IBinanceLeverageTiers {
    // The size of the position used to derive the tier
    max_position: number,

    /**
     * Calculated based on the positions at different notional value tiers.
     * This means that the Maintenance Margin is always calculated the same way, regardless of 
     * what leverage you select. Moving from one tier to another will not cause the previous tier 
     * to change its leverage. The larger the position, the higher the Maintenance Margin rate.
     */
    maintenance_margin: number,

    // @TODO
    maintenance_amount: number
}






/**
 * Position Calculator Trade Item
 * A position can be long (when the price is expected to increase) or short. Moreover,
 * there can be any number of trades within a position.
 */
export interface IPositionCalculatorTradeItem {
    // The avg price in which the trade was executed
    price: number,

    // The wallet balance in USDT assinged to the trade (Isolated Mode).
    margin: number
}




/**
 * Position Range
 * When a position is opened or increased, the ranges change based on the
 * active level.
 */
export interface IPositionPriceRange {
    // The entry price of the position based on all the trades within
    entry: number,

    // The liquidation price of the position
    liquidation: number
}