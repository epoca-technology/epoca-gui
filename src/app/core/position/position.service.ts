import { Injectable } from '@angular/core';
import { ApiService } from "../api";
import { 
    IBinancePositionSide, 
    IPositionService, 
    IPositionStrategy, 
    IPositionStrategyState 
} from './interfaces';

@Injectable({
  providedIn: 'root'
})
export class PositionService implements IPositionService {

    constructor(private _api: ApiService) { }



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
     * Increases an existing position based on a given side.
     * @param side
     * @param otp
     * @returns Promise<void>
     */
    public increase(side: IBinancePositionSide, otp: string): Promise<void> { 
        return this._api.request("post","position/increase", {side: side}, true, otp);
    }








    /**
     * Closes an existing position based on a given side.
     * @param side
     * @param otp
     * @returns Promise<void>
     */
    public close(side: IBinancePositionSide, otp: string): Promise<void> { 
        return this._api.request("post","position/close", {side: side}, true, otp);
    }








	/*********************
	 * Position Strategy *
	 *********************/






    /**
     * Deletes all the api errors from the database.
     * @param newStrategy
     * @param otp
     * @returns Promise<void>
     */
    public updateStrategy(newStrategy: IPositionStrategy, otp: string): Promise<void> { 
        return this._api.request("post","position/updateStrategy", {newStrategy: newStrategy}, true, otp);
    }





    /**
     * Calculates the strategy state for a position, returning
     * the current level and the next. This function should 
     * not be invoked if there is no margin in the position.
     * @param strategy
     * @param margin
     * @returns IPositionStrategyState
     */
	public getStrategyState(strategy: IPositionStrategy, margin: number): IPositionStrategyState {
        // Level 1 is active
        if (margin > 0 && margin <= strategy.level_1.size) {
            return { current: strategy.level_1, next: strategy.level_2}
        }

        // Level 2 is active
        else if (margin > strategy.level_1.size && margin <= strategy.level_2.size) {
            return { current: strategy.level_2, next: strategy.level_3}
        }

        // Level 3 is active
        else if (margin > strategy.level_2.size && margin <= strategy.level_3.size) {
            return { current: strategy.level_3, next: strategy.level_4}
        }

        // Level 4 is active
        else if (margin > strategy.level_3.size) {
            return { current: strategy.level_4, next: undefined}
        }

        // Otherwise, there is something wrong with the margin
        else {
            throw new Error(`The strategy state cannot be calculated as the provided position has no margin. Received ${margin}`);
        }
    }






    /********************
     * Position History *
     ********************/




}