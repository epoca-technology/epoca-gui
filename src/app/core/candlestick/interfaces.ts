import { ICryptoCurrencySymbol } from "../cryptocurrency";




export interface ICandlestickService {
    getForPeriod(symbol: ICryptoCurrencySymbol, start: number, end: number, intervalMinutes: number): Promise<ICandlestick[]>


}





// Candlestick Record
export interface ICandlestick {
    ot: number,                 // Open Time
    ct: number,                 // Close Time
    o: string,                  // Open Price
    h: string,                  // High Price
    l: string,                  // Low Price
    c: string,                  // Close Price
    v: string,                  // Volume (USDT)
    tbv: string,                // Taker Buy Volume (USDT)
}