// Service
export interface ICryptoCurrencyService {
    // Properties
    mainSymbol: ICryptoCurrencySymbol,
    data: ICryptoCurrencyData,
    symbols: ICryptoCurrencySymbol[],

    
}



// Record
export interface ICryptoCurrencyData {
    [symbol: string]: ICryptoCurrency
}

export interface ICryptoCurrency {
    symbol: ICryptoCurrencySymbol,
    name: string,
    genesisCandlestick: number,
}

export type ICryptoCurrencySymbol = 'BTC'|'ETH';