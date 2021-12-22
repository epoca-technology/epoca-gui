import { Injectable } from '@angular/core';
import { ICryptoCurrencyData, ICryptoCurrencyService, ICryptoCurrencySymbol } from './interfaces';

@Injectable({
  providedIn: 'root'
})
export class CryptocurrencyService implements ICryptoCurrencyService {
    // Main Currency Symbol
    public readonly mainSymbol: ICryptoCurrencySymbol = 'BTC';
    
    // Currency Data
    public readonly data: ICryptoCurrencyData = {
        BTC: {
            symbol: 'BTC',
            name: 'Bitcoin',
            genesisCandlestick: 1502942400000
        },
        ETH: {
            symbol: 'ETH',
            name: 'Ethereum',
            genesisCandlestick: 1502942400000
        },
        BNB: {
            symbol: 'BNB',
            name: 'Binance Coin',
            genesisCandlestick: 1509940440000
        },
        SOL: {
            symbol: 'SOL',
            name: 'Solana',
            genesisCandlestick: 1597125600000
        },
        ADA: {
            symbol: 'ADA',
            name: 'Cardano',
            genesisCandlestick: 1523937720000
        },
    };


    // Symbol List
    public readonly symbols: ICryptoCurrencySymbol[] = <ICryptoCurrencySymbol[]>Object.keys(this.data);

    constructor() { }


}
