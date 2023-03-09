import { IBinancePositionSide, IPositionTrade } from "./interfaces";


// Service
export interface IPositionDataService {
    // Date Range
    start: number,
    end: number,
    
    // The list of positions ordered by date asc
    positions: IPosition[],

    // The reversed list of positions (ordered by date desc)
    rPositions: IPosition[],

    // Bottom Line Values
    subTotal: number,
    feesTotal: number,
    netProfit: number,

    // Position Count by Side
    longPositions: number,
    shortPositions: number,

    // Realized PNL
    pnl: IPositionDataItem,
    longPNL: IPositionDataItem,
    shortPNL: IPositionDataItem,

    // Comissions / Fees
    fees: IPositionDataItem,
    longFees: IPositionDataItem,
    shortFees: IPositionDataItem,

    // Position Prices
    prices: IPositionDataItem,
    longPrices: IPositionDataItem,
    shortPrices: IPositionDataItem,

    // Position Amounts in USDT
    amounts: IPositionDataItem,
    longAmounts: IPositionDataItem,
    shortAmounts: IPositionDataItem,

    // Initializer
    initialize(startAt: number, endAt: number): Promise<void>,

    // Position Queries
    getPositionByTimestamp(timestamp: number): IPosition|undefined,
    getPositionByRange(startAt: number, endAt: number): IPosition|undefined
}





/**
 * Position
 * When Epoca opens and closes positions, trades are stored individually. A single
 * position can have any number of trades within.
 */
export interface IPosition {
    // The side of the position
    side: IBinancePositionSide,

    // The times in which the position opened and closed
    openTime: number,
    closeTime: number,

    // The prices in which the position opened and closed
    openPrice: number,
    closePrice: number,

    // The amounts that were used when opening and closing the position
    openAmount: number,
    closeAmount: number,

    // The position's realized pnl
    pnl: number,

    // The fees charged by the exchange when opening and closing the positions
    fee: number,

    // The list of trades that comprise the position
    openTrades: IPositionTrade[],
    closeTrades: IPositionTrade[]
}








/**
 * Data Item
 * Object that contains an overview of a specific item.
 */
export interface IItemElement {
    x: number,
    y: number
}
export interface IPositionDataItem {
    // The name of the data item
    name: string,

    // The list of elements within the item
    elements: IItemElement[],

    // The smalles number within the list
    min: number,

    // The highest value within the list
    max: number,

    // The mean of the values within the list
    mean: number,

    // The last element in the list
    last: number,

    /**
     * The list of elements with the accumulated values as well as the
     * last value. If the accum parameter is not enabled, it will skip
     * this process.
     */
    elementsAccum: IItemElement[],
    lastAccum: number,
}