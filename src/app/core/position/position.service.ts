import { Injectable } from '@angular/core';
import { ApiService } from "../api";
import { UtilsService } from '../utils';
import { 
    IBinancePositionSide, 
    IPositionService, 
    IPositionStrategy, 
    IAccountBalance
} from './interfaces';

@Injectable({
  providedIn: 'root'
})
export class PositionService implements IPositionService {
    





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
	 * Retrieves the current position strategy.
	 * @param side
	 * @returns Promise<IPositionStrategy>
	 */
    public getStrategy(): Promise<IPositionStrategy> {
		return this._api.request(
            "get","position/getStrategy", 
            {}, 
            true
        );
	}




    /**
     * Updates the trading strategy.
     * @param newStrategy
     * @param otp
     * @returns Promise<void>
     */
    public updateStrategy(newStrategy: IPositionStrategy, otp: string): Promise<void> { 
        return this._api.request("post","position/updateStrategy", {newStrategy: newStrategy}, true, otp);
    }















	/***************************
	 * Futures Account Balance *
	 ***************************/





	/**
	 * Retrieves the current position strategy.
	 * @param side
	 * @returns Promise<IAccountBalance>
	 */
    public getBalance(): Promise<IAccountBalance> {
		return this._api.request(
            "get","position/getBalance", 
            {}, 
            true
        );
	}
}