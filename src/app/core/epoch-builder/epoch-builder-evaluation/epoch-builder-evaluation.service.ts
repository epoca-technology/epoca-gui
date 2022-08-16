import { Injectable } from '@angular/core';
import { BigNumber } from "bignumber.js";
import { UtilsService } from '../../utils';
import { 
	IEpochBuilderEvaluation,
	IEpochBuilderEvaluationCategory,
	IEpochBuilderEvaluationItem,
	IEpochBuilderEvaluationCategoryConfig,
	IEpochBuilderEvaluationItemConfig,
	IEpochBuilderEvaluationFunction,
	IEpochBuilderEvaluationFunctionParams,
	IEpochBuilderEvaluationItemResult,
	IEpochBuilderEvaluationStateClass,

} from '../../epoch-builder';
import { IEpochBuilderEvaluationService } from './interfaces';

@Injectable({
  providedIn: 'root'
})
export class EpochBuilderEvaluationService implements IEpochBuilderEvaluationService {
	// The minimum points median accepted
	private readonly worstPoints: number = 1;
	private readonly bestPoints: number = 25;

	// The minimum accuracy percentage allowed
	private readonly worstAccuracy: number = 45;
	private readonly bestAccuracy: number = 60;

	// The absolute maximum percentage difference allowed for predictions vs outcomes
	private readonly maximumPredictionVsOutcomeDifference: number = 50;

	// The absolute maximum percentage difference allowed for non neutral vs neutral predictions
	private readonly maximumPredictionNeutralityDifference: number = 50;

	// The maximum distance between the train and val accuracy
	private readonly maximumAccuracyVsValAccuracyDifference: number = 3;

	// The maximum distance between the train and val loss
	private readonly maximumLossVsValLossDifference: number = 3;

	// Best and worst accuracy improvements
	private readonly worstAccuracyImprovement: number = 1;
	private readonly bestAccuracyImprovement: number = 3;

	// Best and worst loss improvement
	private readonly worstLossImprovement: number = 0.01;
	private readonly bestLossImprovement: number = 2;
	private readonly maximumLossDifference: number = 1;


	// Early stopping helpers
	private readonly earlyStoppingItemResult: IEpochBuilderEvaluationItemResult = { 
		points: 0, 
		state: "Evaluation skipped because the Process Early Stopping was invoked.", 
		state_class:  "ebe-error"
	}



	constructor(protected _utils: UtilsService) { }








	/* Evaluations */






	/**
	 * Evaluates the loss obtained in the first epoch vs the one obtained
	 * in the last one. In the case of a loss, the smaller the value the better.
	 * @param p
	 * @returns IItemGeneralEvaluation
	 */
	private evaluateLossImprovement(p: IEpochBuilderEvaluationFunctionParams): IEpochBuilderEvaluationItemResult {
		// Calculate the absolute difference
		const diff: number = this.calculateAbsolutePercentageChange(p.firstLoss!, p.lastLoss!);

		// Check if the last loss is smaller than the first
		if (p.lastLoss! < p.firstLoss!) {
			// Calculate the scored points
			const points: number = this.calculatePoints(diff, this.worstLossImprovement, this.bestLossImprovement, p.maxPoints);

			// Finally, return the results
			return { 
				points: points, 
				state: `The loss improved by ${diff}% during training.`, 
				state_class: this.getStateClass(points, p.maxPoints) 
			}
		}

		// Otherwise, score the distance
		else {
			// Calculate the scored points
			const points: number = this.calculatePoints(diff, this.maximumLossDifference, 0, p.maxPoints);

			// Finally, return the results
			return { 
				points: points, 
				state: `The loss worsened by ${diff}% during training.`, 
				state_class: this.getStateClass(points, p.maxPoints) 
			}
		}
	}







	/**
	 * Evaluates the last loss vs the last validation loss. In the case of a loss, the
	 * smaller the value the better and the validation loss should be smaller than the 
	 * train loss because the result comes from data the model has not yet seen.
	 * @param p
	 * @returns IItemGeneralEvaluation
	 */
	 private evaluateLossVsValLoss(p: IEpochBuilderEvaluationFunctionParams): IEpochBuilderEvaluationItemResult {
		// Check if the validation loss is less than or equals to the train value
		if (p.finalValLoss! < p.finalLoss!) {
			// Calculate the difference
			const diff: number = <number>this._utils.calculatePercentageChange(p.finalValLoss!, p.finalLoss!);

			// Finally, return the results
			return { 
				points: p.maxPoints, 
				state: `The validation loss is ${diff}% smaller than the train loss.`, 
				state_class: this.getStateClass(p.maxPoints, p.maxPoints) 
			}
		}

		// Otherwise, score the distance
		else {
			// Calculate the difference
			const diff: number = <number>this._utils.calculatePercentageChange(p.finalLoss!, p.finalValLoss!);

			// Calculate the scored points
			const points: number = this.calculatePoints(diff, this.maximumLossVsValLossDifference, 0, p.maxPoints);
	
			// Finally, return the results
			return { 
				points: points, 
				state: `The validation loss is ${diff}% higher than the train loss.`, 
				state_class: this.getStateClass(points, p.maxPoints) 
			}
		}
	}







	/**
	 * Evaluates the accuracy obtained in the first epoch vs the one obtained
	 * in the last epoch. In the case of accuracy, the bigger the value the better.
	 * @param p
	 * @returns IItemGeneralEvaluation
	 */
	private evaluateAccuracyImprovement(p: IEpochBuilderEvaluationFunctionParams): IEpochBuilderEvaluationItemResult {
		// Calculate the improvement
		const diff: number = <number>this._utils.calculatePercentageChange(p.firstAccuracy!, p.lastAccuracy!);

		// Calculate the scored points
		const points: number = this.calculatePoints(diff, this.worstAccuracyImprovement, this.bestAccuracyImprovement, p.maxPoints);

		// Finally, return the results
		return { 
			points: points, 
			state: `The accuracy ${diff > 0 ? 'improved': 'worsened'} by ${diff}% during training.`, 
			state_class: this.getStateClass(points, p.maxPoints) 
		}
	}









	/**
	 * Evaluates the last accuracy vs the last validation accuracy. In the case of accuracy, the
	 * bigger the value the better and the validation accuracy should be bigger than the 
	 * train accuracy because the result comes from data the model has not yet seen.
	 * @param p
	 * @returns IItemGeneralEvaluation
	 */
	private evaluateAccuracyVsValAccuracy(p: IEpochBuilderEvaluationFunctionParams): IEpochBuilderEvaluationItemResult {
		// Check if the validation accuracy is greater than or equals to the train value
		if (p.finalValAccuracy! >= p.finalAccuracy!) {
			// Calculate the difference
			const diff: number = <number>this._utils.calculatePercentageChange(p.finalAccuracy!, p.finalValAccuracy!);

			// Finally, return the results
			return { 
				points: p.maxPoints, 
				state: `The validation accuracy is ${diff}% higher than the train accuracy.`, 
				state_class: this.getStateClass(p.maxPoints, p.maxPoints) 
			}
		} 
		
		// Otherwise, score the distance
		else {
			// Calculate the difference
			const diff: number = <number>this._utils.calculatePercentageChange(p.finalValAccuracy!, p.finalAccuracy!);

			// Calculate the scored points
			const points: number = this.calculatePoints(diff, this.maximumAccuracyVsValAccuracyDifference, 0, p.maxPoints);
	
			// Finally, return the results
			return { 
				points: points, 
				state: `The validation accuracy is ${diff}% lower than the train accuracy.`, 
				state_class: this.getStateClass(points, p.maxPoints) 
			}
		}
	}






	/**
	 * Calculates the scored points based on the points received during the 
	 * evaluation process. The higher the points, the better.
	 * @param p
	 * @returns IEpochBuilderEvaluationItemResult
	 */
	 private evaluatePoints(p: IEpochBuilderEvaluationFunctionParams): IEpochBuilderEvaluationItemResult {
		// Calculate the scored points
		const points: number = this.calculatePoints(p.receivedPoints!, this.worstPoints, this.bestPoints, p.maxPoints);

		// Finally, return the results
		return { 
			points: points, 
			state: `A total of ${points} trading points were accumulated during the evaluation.`, 
			state_class: this.getStateClass(points, p.maxPoints) 
		}
	}








	

	/**
	 * Calculates the points based on the received accuracy. If the accuracy is in decimal
	 * format, it will scale it prior to calculating the points
	 * @param p 
	 * @returns IEpochBuilderEvaluationItemResult
	 */
	private evaluateAccuracy(p: IEpochBuilderEvaluationFunctionParams): IEpochBuilderEvaluationItemResult {
		// Init the accuracy
		const realAccuracy: number = p.accuracy! > 1 ? p.accuracy!: p.accuracy! * 100;

		// Calculate the scored points
		const points: number = this.calculatePoints(realAccuracy, this.worstAccuracy, this.bestAccuracy, p.maxPoints);

		// Finally, return the results
		return { 
			points: points, 
			state: `The accuracy is ${realAccuracy}%.`, 
			state_class: this.getStateClass(points, p.maxPoints) 
		}
	}







	/**
	 * Calculates the points based on the distance between non neutral and neutral
	 * predictions. The smaller the distance the better.
	 * @param p
	 * @returns IEpochBuilderEvaluationItemResult
	 */
	private evaluatePredictionNeutrality(p: IEpochBuilderEvaluationFunctionParams): IEpochBuilderEvaluationItemResult {
		// Calculate the absolute change between the predictions and the outcomes
		const diff: number = this.calculateAbsolutePercentageChange(p.nonNeutral!, p.neutral!);

		// Calculate the scored points
		let points: number;
		if (p.nonNeutral! >= p.neutral!) {
			points = p.maxPoints;
		} else {
			points = this.calculatePoints(diff, this.maximumPredictionNeutralityDifference, 0, p.maxPoints);
		}

		// Finally, return the results
		return { 
			points: points, 
			state: `The number of non neutral predictions (${p.nonNeutral}) is ${diff}% away from the neutral predictions (${p.neutral}).`, 
			state_class: this.getStateClass(points, p.maxPoints) 
		}
	}







	/**
	 * Calculates the points based on the distance between the predictions
	 * and the outcomes. The smaller the distance, the better.
	 * @param p
	 * @returns IEpochBuilderEvaluationItemResult
	 */
	private evaluatePredictionsVsOutcomes(p: IEpochBuilderEvaluationFunctionParams): IEpochBuilderEvaluationItemResult {
		// Calculate the absolute change between the predictions and the outcomes
		const diff: number = this.calculateAbsolutePercentageChange(p.predictions!, p.outcomes!);

		// Calculate the scored points
		const points: number = this.calculatePoints(diff, this.maximumPredictionVsOutcomeDifference, 0, p.maxPoints);

		// Finally, return the results
		return { 
			points: points, 
			state: `The number of predictions (${p.predictions}) is ${diff}% away from the real outcomes (${p.outcomes}).`, 
			state_class: this.getStateClass(points, p.maxPoints) 
		}
	}













	/* EBE Points Calculation */








	/**
	 * Calculates the total points accumulated by an evaluation based on the worst and best case. 
	 * Notice that the result will never be greater than maxPoints or less than 0.
	 * @param value 
	 * @param worstValue 
	 * @param bestValue 
	 * @param maxPoints 
	 * @returns number
	 */
	 private calculatePoints(value: number, worstValue: number, bestValue: number, maxPoints: number): number {
		// Check if the higher the value the better
		if (bestValue > worstValue) {
			return this.calculatePointsTheHigherTheBetter(value, worstValue, bestValue, maxPoints);
		}

		// Otherwise, it is a lower the points the better
		else {
			return this.calculatePointsTheLowerTheBetter(value, worstValue, maxPoints);
		}
	}




	/**
	 * Calculates the scored points in a case where the higher the value the 
	 * better.
	 * @param value
	 * @param worstValue
	 * @param bestValue
	 * @param maxPoints
	 * @returns number
	 */
	private calculatePointsTheHigherTheBetter(value: number, worstValue: number, bestValue: number, maxPoints: number): number {
		// Check if the value is equals or worse than the worstValue
		if (value <= worstValue) return 0;

		// Check if the value is equals or better than the bestValue
		if (value >= bestValue) return maxPoints;

		// Calculate the points
		const points: BigNumber = new BigNumber(value).times(maxPoints).dividedBy(bestValue);

		// Calculate the deserved points and return them
		return <number>this._utils.outputNumber(points, {dp: 2})
	}




	/**
	 * Calculates the scored points in a case where the lower the value the 
	 * better.
	 * @param value
	 * @param worstValue
	 * @param maxPoints
	 * @returns number
	 */
	 private calculatePointsTheLowerTheBetter(value: number, worstValue: number, maxPoints: number): number {
		// Init the points
		let points: number;

		// Calculate the scored points based on the value
		if 		(value >= worstValue) 		{ points = 0 }
		else if (value >= worstValue / 1.1) { points = maxPoints / 30 }
		else if (value >= worstValue / 1.2) { points = maxPoints / 25 }
		else if (value >= worstValue / 1.3) { points = maxPoints / 20 }
		else if (value >= worstValue / 1.4) { points = maxPoints / 15 }
		else if (value >= worstValue / 1.5) { points = maxPoints / 10 }
		else if (value >= worstValue / 1.6) { points = maxPoints / 8 }
		else if (value >= worstValue / 1.7) { points = maxPoints / 6 }
		else if (value >= worstValue / 1.8) { points = maxPoints / 4 }
		else if (value >= worstValue / 1.9) { points = maxPoints / 3 }
		else if (value >= worstValue / 2) 	{ points = maxPoints / 2 }
		else if (value >= worstValue / 2.2) { points = maxPoints / 1.9 }
		else if (value >= worstValue / 2.4) { points = maxPoints / 1.8 }
		else if (value >= worstValue / 2.6) { points = maxPoints / 1.7 }
		else if (value >= worstValue / 2.8) { points = maxPoints / 1.6 }
		else if (value >= worstValue / 3) 	{ points = maxPoints / 1.5 }
		else if (value >= worstValue / 3.3) { points = maxPoints / 1.4 }
		else if (value >= worstValue / 3.5) { points = maxPoints / 1.3 }
		else if (value >= worstValue / 4) 	{ points = maxPoints / 1.2 }
		else if (value >= worstValue / 5) 	{ points = maxPoints / 1.1 }
		else if (value >= worstValue / 6) 	{ points = maxPoints / 1.09 }
		else if (value >= worstValue / 7) 	{ points = maxPoints / 1.08 }
		else if (value >= worstValue / 8) 	{ points = maxPoints / 1.07 }
		else if (value >= worstValue / 9) 	{ points = maxPoints / 1.06 }
		else if (value >= worstValue / 10) 	{ points = maxPoints / 1.05 }
		else if (value >= worstValue / 11) 	{ points = maxPoints / 1.04 }
		else if (value >= worstValue / 12) 	{ points = maxPoints / 1.03 }
		else if (value >= worstValue / 13) 	{ points = maxPoints / 1.02 }
		else if (value >= worstValue / 14) 	{ points = maxPoints / 1.01 }
		else 								{ points = maxPoints }
		
		// Return the received points
		return <number>this._utils.outputNumber(points, {dp: 2})
	}







	/**
	 * Calculates the absolute percentage change between 2 values.
	 * @param oldValue 
	 * @param newValue 
	 * @returns number
	 */
	private calculateAbsolutePercentageChange(oldValue: number, newValue: number): number { 
		return this.getAbsoluteValue(<number>this._utils.calculatePercentageChange(oldValue, newValue));
	}







	/**
	 * Retrieves the absolute value of a number.
	 * @param value 
	 * @returns number
	 */
	 private getAbsoluteValue(value: number): number { return value >= 0 ? value: -(value) }















	 /* State Helpers */





	/**
	 * Returns the state class based on the points obtained.
	 * @param pointsReceived 
	 * @param maxPoints 
	 * @returns IGeneralEvaluationStateClass
	 */
	 private getStateClass(pointsReceived: number, maxPoints: number): IEpochBuilderEvaluationStateClass {
		// Calculate the percent received
		const pointsPercent: number = <number>this._utils.calculatePercentageOutOfTotal(pointsReceived, maxPoints);

		// Return the class based on the performance
		if 		(pointsPercent >= 80) { return "ebe-optimal"}
		else if (pointsPercent >= 60) { return "ebe-decent"}
		else if (pointsPercent >= 40) { return "ebe-neutral"}
		else if (pointsPercent >= 20) { return "ebe-warning"}
		else 						  { return "ebe-error"}
	}
}
