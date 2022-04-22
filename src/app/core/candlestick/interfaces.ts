


export interface ICandlestickService {
    // Properties
    predictionCandlestickInterval: number,

    // Retriever
    getForPeriod(start: number, end: number, intervalMinutes?: number): Promise<ICandlestick[]>


}





// Candlestick Record
export interface ICandlestick {
    ot: number,                 // Open Time
    ct: number,                 // Close Time
    o: number,                  // Open Price
    h: number,                  // High Price
    l: number,                  // Low Price
    c: number,                  // Close Price
    v: number,                  // Volume (USDT)
    tbv: number,                // Taker Buy Volume (USDT)
    nt: number,                 // Number of Trades
}