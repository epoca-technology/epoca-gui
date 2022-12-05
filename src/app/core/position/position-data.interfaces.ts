import { IPositionTrade } from "./interfaces";


// Service
export interface IPositionDataService {
    // The property holding all the trades ordered by date asc
    db: IPositionTrade[],

    // The real date range downloaded from the API
    realStart: number,
    realEnd: number,

    // The list of trades ordered by date asc
    query: IPositionTrade[],
    queryReversed: IPositionTrade[],

    // Date Range
    start: number,
    end: number,

    // Bottom Line Values
    subTotal: number,
    feesTotal: number,
    netProfit: number,

    // Trades by Side
    longTrades: number,
    longIncreaseTrades: number,
    longCloseTrades: number,
    shortTrades: number,
    shortIncreaseTrades: number,
    shortCloseTrades: number,

    // Realized PNL
    pnl: IPositionDataItem,
    longPNL: IPositionDataItem,
    shortPNL: IPositionDataItem,

    // Comissions / Fees
    fees: IPositionDataItem,
    longFees: IPositionDataItem,
    shortFees: IPositionDataItem,

    // Trade Prices
    prices: IPositionDataItem,
    longPrices: IPositionDataItem,
    longIncreasePrices: IPositionDataItem,
    longClosePrices: IPositionDataItem,
    shortPrices: IPositionDataItem,
    shortIncreasePrices: IPositionDataItem,
    shortClosePrices: IPositionDataItem,

    // Trade Amounts in USDT
    amounts: IPositionDataItem,
    longAmounts: IPositionDataItem,
    longIncreaseAmounts: IPositionDataItem,
    longCloseAmounts: IPositionDataItem,
    shortAmounts: IPositionDataItem,
    shortIncreaseAmounts: IPositionDataItem,
    shortCloseAmounts: IPositionDataItem,

    // Initializer
    initialize(startAt: number, endAt: number): Promise<void>,
    reset(): void,

    // Resizer
    setSize(startAt: number, endAt: number): void,

    // Trade Queries
    getTradeByTimestamp(timestamp: number): IPositionTrade|undefined,
    getTradeByRange(startAt: number, endAt: number): IPositionTrade|undefined
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