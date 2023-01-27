import { Injectable } from '@angular/core';
import { BigNumber } from "bignumber.js";
import { ApiService } from "../api";
import { UtilsService } from '../utils';
import { 
    IBinancePositionSide, 
    IPositionService, 
    IPositionStrategy, 
    IBinanceLeverageTiers,
    IPositionCalculatorTradeItem,
    IPositionPriceRange,
    IPositionTrade,
    IPositionHealthCandlestickRecord
} from './interfaces';

@Injectable({
  providedIn: 'root'
})
export class PositionService implements IPositionService {
    

    /**
     * Leverage Tiers
     * Values used in order to be able to calculate liquidation prices.
     */
    private readonly leverage_tiers: IBinanceLeverageTiers[] = [
        { max_position: 50000,     maintenance_margin: 0.4, maintenance_amount: 0 },
        { max_position: 250000,    maintenance_margin: 0.5, maintenance_amount: 50 },
        { max_position: 1000000,   maintenance_margin: 1,   maintenance_amount: 1300 },
        { max_position: 10000000,  maintenance_margin: 2.5, maintenance_amount: 16300 },
        { max_position: 20000000,  maintenance_margin: 5,   maintenance_amount: 266300 },
        { max_position: 50000000,  maintenance_margin: 10,  maintenance_amount: 1266300 },
        { max_position: 100000000, maintenance_margin: 12.5,maintenance_amount: 2516300 },
        { max_position: 200000000, maintenance_margin: 15,  maintenance_amount: 5016300 },
        { max_position: 300000000, maintenance_margin: 25,  maintenance_amount: 25016300 },
        { max_position: 500000000, maintenance_margin: 50,  maintenance_amount: 100016300 },
    ]




    constructor(
        private _api: ApiService,
        private _utils: UtilsService
    ) { }



	/***********************
	 * Position Management *
	 ***********************/






    /**
     * Opens a brand new position on a given side.
     * @param side
     * @param otp
     * @returns Promise<void>
     */
    public open(side: IBinancePositionSide, otp: string): Promise<void> { 
        return this._api.request("post","position/open", {side: side}, true, otp);
    }









    /**
     * Closes an existing position based on a given side.
     * @param side
     * @param chunkSize
     * @param otp
     * @returns Promise<void>
     */
    public close(side: IBinancePositionSide, chunkSize: number, otp: string): Promise<void> { 
        return this._api.request("post","position/close", {side: side, chunkSize: chunkSize}, true, otp);
    }








	/*********************
	 * Position Strategy *
	 *********************/






    /**
     * Updates the trading strategy.
     * @param newStrategy
     * @param otp
     * @returns Promise<void>
     */
    public updateStrategy(newStrategy: IPositionStrategy, otp: string): Promise<void> { 
        return this._api.request("post","position/updateStrategy", {newStrategy: newStrategy}, true, otp);
    }












    /********************
     * Misc Calculators *
     ********************/





    /**
     * Calculates the entry and liquidation price based on the strategy
     * and the trades within.
     * @param side 
     * @param leverage 
     * @param trades 
     */
    public calculatePositionPriceRange(
        side: IBinancePositionSide, 
        leverage: number, 
        trades: IPositionCalculatorTradeItem[]
    ): IPositionPriceRange {
        // Init the position margins (USDT Balance added to the position on isolated mode)
        let position_margin: number = 0;

        // Init the BTC short/long contract quantity (Before applying leverage)
        let raw_contract_quantity: number = 0;

        // Iterate over each trade
        for (let trade of trades) {
            // Append the value to the position margin
            position_margin += trade.margin;

            // Add the value to the raw contract quantity
            raw_contract_quantity += <number>this._utils.outputNumber(
                new BigNumber(trade.margin).dividedBy(trade.price), { dp: 8 }
            );
        }

        // Calculate the entry price
        const entry_price: number = <number>this._utils.outputNumber(
            new BigNumber(position_margin).dividedBy(raw_contract_quantity)
        );

        // Calculate the contract quantity (With leverage)
        const contract_quantity: number = <number>this._utils.outputNumber(
            new BigNumber(raw_contract_quantity).times(leverage), { dp: 8 }
        );

        // Initialize the liquidation price
        let liquidation_price: number = 0;

        // Iterate over each leverage tier
        for (let tier of this.leverage_tiers) {
            // Init the maintenance margin rate
            const maintenance_margin_rate: number = tier.maintenance_margin / 100;

            // Calculate the real contract_quantity (Should be negative if shorting)
            const real_contract_quantity: number = side == "LONG" ? contract_quantity: -(contract_quantity);

            // Calculate the liquidation price
            liquidation_price = (position_margin + tier.maintenance_amount - (real_contract_quantity * entry_price)) /
                                (contract_quantity * (maintenance_margin_rate - (side == "LONG" ? 1: -1)));

            // Calculate the base balance
            const base_balance = liquidation_price * contract_quantity;

            // If the correct tier has been found, stop the iteration
            if (base_balance <= tier.max_position) { break }; 
        }

        // Finally, return the range
        return { 
            entry: entry_price, 
            liquidation: <number>this._utils.outputNumber(liquidation_price)
        }
    }









    /********************************
     * Position Health Candlesticks *
     ********************************/





	/**
	 * Retrieves the full health history in candlestick format for
     * a given side.
	 * @param side
	 * @returns Promise<IPositionHealthCandlestickRecord[]>
	 */
    public getPositionHealthCandlesticks(side: IBinancePositionSide): Promise<IPositionHealthCandlestickRecord[]> {
		return this._api.request(
            "get","position/getPositionHealthCandlesticks", 
            {
                side: side
            }, 
            true
        );
	}












    /*******************
     * Position Trades *
     *******************/




	/**
	 * Lists all the position trades (inclusively) within the date range.
	 * @param startAt 
	 * @param endAt 
	 * @returns Promise<IPositionTrade[]>
	 */
     public listTrades(startAt: number, endAt: number): Promise<IPositionTrade[]> {
		return this._api.request(
            "get","position/listTrades", 
            {
                startAt: startAt,
                endAt: endAt
            }, 
            true
        );
	}
}