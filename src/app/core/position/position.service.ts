import { Injectable } from '@angular/core';
import { IPositionService, IPositionStrategy, IPositionStrategyState } from './interfaces';

@Injectable({
  providedIn: 'root'
})
export class PositionService implements IPositionService {

	constructor() { }











	/*********************
	 * Position Strategy *
	 *********************/





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
}
