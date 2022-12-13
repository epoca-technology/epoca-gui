




// Service
export interface IPositionService {
    // Position Management
    open(side: IBinancePositionSide, otp: string): Promise<void>,
    increase(side: IBinancePositionSide, otp: string): Promise<void>,
    close(side: IBinancePositionSide, chunkSize: number, otp: string): Promise<void>,

    // Position Strategy
    updateStrategy(newStrategy: IPositionStrategy, otp: string): Promise<void>,
    getStrategyState(strategy: IPositionStrategy, margin: number): IPositionStrategyState,
    getMarginAcums(strat: IPositionStrategy): number[],
    getLevelNumber(level_id: IStrategyLevelID): number,

    // Misc Calculators
    calculatePositionPriceRange(
        side: IBinancePositionSide, 
        leverage: number, 
        trades: IPositionCalculatorTradeItem[]
    ): IPositionPriceRange,

    // Position Trades
    listTrades(startAt: number, endAt: number): Promise<IPositionTrade[]>
}









/* General */


// Position Action Side
export type IBinancePositionActionSide = "BUY"|"SELL";

// Position Side
export type IBinancePositionSide = "LONG"|"SHORT";

// Margin Type
export type IBinanceMarginType = "isolated"|"cross";



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
    short: IActivePosition|undefined
}







/* Position Strategy */


/**
 * Strategy Level ID
 * Each level contains an identifier that simplifies the interaction
 * with the strategy.
 */
export type IStrategyLevelID = "level_1"|"level_2"|"level_3"|"level_4";



/**
 * Strategy Level
 * Each level details how much money should be placed into the 
 * position, as well as a target in order to take profit / reduce
 * losses.
 */
export interface IPositionStrategyLevel {
    // The identifier of the strategy level.
    id: IStrategyLevelID,

    /**
     * The USDT wallet balance that will be placed into the position. When 
     * level 1 is activated, the position is opened. When any subsequent level
     * is activated, the position is increased instead.
     */
    size: number,

    /**
     * The price percentage change from the entry price required
     * in order for the position to be closeable. Keep in mind this value may be 0.
     */
    target: number
}




/**
 * Strategy 
 * Levels are activated in a chained manner and must meet
 * a series of requirements in order to ensure the safety of the 
 * funds.
 */
export interface IPositionStrategy {
    // The leverage that will be used on positions
    leverage: number,

    /**
     * The distance between the mark and liquidation prices required in 
     * order to be able to increase the position's level.
     */
    level_increase_requirement: number,

    /**
     * The percentage of the total margin that the user is willing to
     * lose instead of increasing a level.
     * Keep in mind, when calculating the stop_loss price, the current
     * value is divided by the leverage. F.e: If the strategy's stop loss
     * is 5% and the leverage is x2, the real stop loss is 2.5%.
     */
    stop_loss: number,

    // Levels
    level_1: IPositionStrategyLevel,
    level_2: IPositionStrategyLevel,
    level_3: IPositionStrategyLevel,
    level_4: IPositionStrategyLevel,

    // The timestamp in which the strategy was last updated
    ts: number
}




/**
 * Position Strategy State
 * The state of the strategy allows to easily calculate
 * targets and increase sizes.
 */
export interface IPositionStrategyState {
    current: IPositionStrategyLevel,
    next: IPositionStrategyLevel|undefined
}








/* BINANCE ACCOUNT */




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

    // The price in which the position is labeled as "successful" and is ready to be closed.
    target_price: number,

    // The price at which the position will be automatically liquidated by the exchange.
    liquidation_price: number,

    /**
     * The price at which the position should be closed when it won't be increased.
     */
    stop_loss_price: number,

    /**
     * The minimum price at which a position can be increased based on its side. 
     * This value is calculated based on level_increase_requirement and the 
     * liquidation price.
     */
    min_increase_price: number,

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

















/* GUI SPECIFIC INTERFACES */




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