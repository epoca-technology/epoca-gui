import { Injectable } from '@angular/core';
import { BigNumber } from "bignumber.js";
import { UtilsService } from '../../utils';
import { 
	IEpochBuilderEvaluation,
	IEpochBuilderEvaluationCategory,
	IEpochBuilderEvaluationItem,
	IEpochBuilderEvaluationCategoryConfig,
	IEpochBuilderEvaluationFunctionParams,
	IEpochBuilderEvaluationItemResult,
	IEpochBuilderEvaluationStateClass,
	IEpochBuilderEvaluationDescriptions,
} from '../../epoch-builder';
import { IEpochBuilderEvaluationService } from './interfaces';

@Injectable({
  providedIn: 'root'
})
export class EpochBuilderEvaluationService implements IEpochBuilderEvaluationService {
	// The minimum accuracy percentage allowed
	private readonly worstAccuracy: number = 40;
	private readonly bestAccuracy: number = 65;

	// The absolute maximum percentage difference allowed for predictions vs outcomes
	private readonly maximumPredictionVsOutcomeDifference: number = 30;

	// The maximum distance between the train and val loss
	private readonly maximumLossVsValLossDifference: number = 3;

	// Best and worst loss improvement
	private readonly worstLossImprovement: number = 0.01;
	private readonly bestLossImprovement: number = 2;
	private readonly maximumLossDifference: number = 1;

	// Best test ds losses
	private readonly bestMAE: number = 0.0015;
	private readonly bestMSE: number = 0.00002;

	// Descriptions
	public readonly desc: IEpochBuilderEvaluationDescriptions = {
		lossImprovement: "Evaluates the loss obtained in the first epoch vs the loss obtained in the last epoch. \
		In the case of loss, the lower the value the better.",
		lossVsValLoss: "Evaluates the last training loss vs the last validation loss. In healthy models, the \
		validation loss is lower than the train loss.",
		testDatasetLoss: "Evaluates the loss between the predictions and the labels of the test dataset.",
		accuracy: "Evaluates the accuracy of predictions generated by the model. In the case of accuracy, the higher the better.",
		points: "Evaluates the points collected by the model during the discovery process.",
		predictionsVsOutcomes: "Evaluates the number of predictions by type and compares them to the actual outcomes. \
		In healthy models, these values should be balanced.",
		profit: "Evaluates the profit in USD received in the backtest covering the test dataset range."
	}



	constructor(private _utils: UtilsService) { }




	/* Evaluation Builder */



	/**
	 * Based on a list of category configurations, it will perform all the
	 * required evaluations and return the evaluation object.
	 * @param categoryConfigs 
	 * @returns IEpochBuilderEvaluation
	 */
	public evaluate(categoryConfigs: IEpochBuilderEvaluationCategoryConfig[]): IEpochBuilderEvaluation {
		// Init values
		let evaluationPoints: number = 0;
		let maxEvaluationPoints: number = 0;
		let categories: IEpochBuilderEvaluationCategory[] = [];

		// Iterate over each category configuration
		for (let catConfig of categoryConfigs) {
			// Init values
			let catPoints: number = 0; 
			let catMaxPoints: number = 0; 
			let items: IEpochBuilderEvaluationItem[] = []

			// Iterate over each item and perform the evaluations
			for (let item of catConfig.items) {
				// Increment the category max points
				catMaxPoints += item.evaluationParams.maxPoints;

				// Perform the evaluation safely
				let result: IEpochBuilderEvaluationItemResult;
				try {
					result = this[item.evaluationFunction](item.evaluationParams);
				} catch(e) {
					console.log("Error when evaluating: ", item);
					result = { points: 0, state: this._utils.getErrorMessage(e), state_class: "ebe-error"}
				}

				// Update the category accumulated points
				catPoints += result.points;

				// Append the item to the list
				items.push({
					name: item.name,
					description: item.description,
					state: result.state,
					points: result.points,
					max_points: item.evaluationParams.maxPoints,
					state_class: result.state_class
				});
			}

			// Append the category points to the top level evaluation
			evaluationPoints += catPoints;
			maxEvaluationPoints += catMaxPoints;

			// Append the category to the list
			categories.push({
				name: catConfig.name,
				description: catConfig.description,
				points: catPoints,
				max_points: catMaxPoints,
				state_class: this.getStateClass(catPoints, catMaxPoints),
				items: items
			});
		}

		// Finally, return the complete evaluation
		return {
			points: evaluationPoints,
			max_points: maxEvaluationPoints,
			state_class: this.getStateClass(evaluationPoints, maxEvaluationPoints),
			categories: categories
		}
	}









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
	 * Evaluates the provided test dataset loss against the best and worst values.
	 * @param p
	 * @returns IItemGeneralEvaluation
	 */
	 private evaluateTestDatasetLoss(p: IEpochBuilderEvaluationFunctionParams): IEpochBuilderEvaluationItemResult {
		// Evaluate Mean Absolute Error
		if (typeof p.meanAbsoluteError == "number") {
			// Calculate the scored points
			const points: number = this.calculateLossPoints(p.meanAbsoluteError, this.bestMAE, p.maxPoints);
			
			// Return the result
			return { 
				points: points, 
				state: <string>this._utils.outputNumber(p.meanAbsoluteError, {dp: 8, of: "s"}), 
				state_class: this.getStateClass(points, p.maxPoints) 
			}
		}

		// Otherwise, evaluate the Mean Squared Error
		else {
			// Calculate the scored points
			const points: number = this.calculateLossPoints(p.meanSquaredError!, this.bestMSE, p.maxPoints);
			
			// Return the result
			return { 
				points: points, 
				state: <string>this._utils.outputNumber(p.meanSquaredError!, {dp: 8, of: "s"}), 
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
		const points: number = this.calculatePoints(p.receivedPoints!, 0, p.maxReceivablePoints!, p.maxPoints);

		// Finally, return the results
		return { 
			points: points, 
			state: `A total of ${p.receivedPoints} trading points were accumulated during the process.`, 
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
			state: `${realAccuracy}% the generated predictions were successful.`, 
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










	/**
	 * Calculates the scored points based on the profit received during the 
	 * backtest process. The higher the points, the better.
	 * @param p
	 * @returns IEpochBuilderEvaluationItemResult
	 */
	 private evaluateProfit(p: IEpochBuilderEvaluationFunctionParams): IEpochBuilderEvaluationItemResult {
		// Calculate the scored points
		const points: number = this.calculatePoints(p.receivedProfit!, 0, p.optimalProfit!, p.maxPoints);

		// Finally, return the results
		return { 
			points: points, 
			state: `A total of ${this._utils.outputNumber(p.receivedProfit!)} USD was generated in profit.`, 
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
		return <number>this._utils.outputNumber(points, {dp: 2});
	}







	/**
	 * Calculates the points received by the test dataset loss evaluation.
	 * The lower the loss the better.
	 * @param lossReceived 
	 * @param bestLoss 
	 * @param maxPoints 
	 * @returns number
	 */
	private calculateLossPoints(lossReceived: number, bestLoss: number, maxPoints: number): number {
		// Init the points
		let points: number;

		// Calculate the points
		if (lossReceived <= bestLoss) { points = maxPoints }
		else if (lossReceived <= (bestLoss * 1.05)) { points = maxPoints / 1.01 }
		else if (lossReceived <= (bestLoss * 1.1)) { points = maxPoints / 1.03 }
		else if (lossReceived <= (bestLoss * 1.15)) { points = maxPoints / 1.05 }
		else if (lossReceived <= (bestLoss * 1.2)) { points = maxPoints / 1.07 }
		else if (lossReceived <= (bestLoss * 1.25)) { points = maxPoints / 1.09 }
		else if (lossReceived <= (bestLoss * 1.3)) { points = maxPoints / 1.11 }
		else if (lossReceived <= (bestLoss * 1.35)) { points = maxPoints / 1.13 }
		else if (lossReceived <= (bestLoss * 1.4)) { points = maxPoints / 1.15 }
		else if (lossReceived <= (bestLoss * 1.45)) { points = maxPoints / 1.17 }
		else if (lossReceived <= (bestLoss * 1.5)) { points = maxPoints / 1.19 }
		else if (lossReceived <= (bestLoss * 1.55)) { points = maxPoints / 1.21 }
		else if (lossReceived <= (bestLoss * 1.6)) { points = maxPoints / 1.23 }
		else if (lossReceived <= (bestLoss * 1.65)) { points = maxPoints / 1.25 }
		else if (lossReceived <= (bestLoss * 1.7)) { points = maxPoints / 1.27 }
		else if (lossReceived <= (bestLoss * 1.75)) { points = maxPoints / 1.29 }
		else if (lossReceived <= (bestLoss * 1.8)) { points = maxPoints / 1.31 }
		else if (lossReceived <= (bestLoss * 1.85)) { points = maxPoints / 1.33 }
		else if (lossReceived <= (bestLoss * 1.9)) { points = maxPoints / 1.35 }
		else if (lossReceived <= (bestLoss * 1.95)) { points = maxPoints / 1.37 }
		else if (lossReceived <= (bestLoss * 2)) { points = maxPoints / 1.39 }
		else if (lossReceived <= (bestLoss * 2.1)) { points = maxPoints / 1.41 }
		else if (lossReceived <= (bestLoss * 2.2)) { points = maxPoints / 1.43 }
		else if (lossReceived <= (bestLoss * 2.3)) { points = maxPoints / 1.45 }
		else if (lossReceived <= (bestLoss * 2.4)) { points = maxPoints / 1.47 }
		else if (lossReceived <= (bestLoss * 2.5)) { points = maxPoints / 1.49 }
		else if (lossReceived <= (bestLoss * 2.6)) { points = maxPoints / 1.51 }
		else if (lossReceived <= (bestLoss * 2.7)) { points = maxPoints / 1.53 }
		else if (lossReceived <= (bestLoss * 2.8)) { points = maxPoints / 1.55 }
		else if (lossReceived <= (bestLoss * 2.9)) { points = maxPoints / 1.57 }
		else if (lossReceived <= (bestLoss * 3)) { points = maxPoints / 1.6 }
		else if (lossReceived <= (bestLoss * 3.1)) { points = maxPoints / 1.62 }
		else if (lossReceived <= (bestLoss * 3.2)) { points = maxPoints / 1.64 }
		else if (lossReceived <= (bestLoss * 3.3)) { points = maxPoints / 1.66 }
		else if (lossReceived <= (bestLoss * 3.4)) { points = maxPoints / 1.68 }
		else if (lossReceived <= (bestLoss * 3.5)) { points = maxPoints / 1.7 }
		else if (lossReceived <= (bestLoss * 3.6)) { points = maxPoints / 1.72 }
		else if (lossReceived <= (bestLoss * 3.7)) { points = maxPoints / 1.74 }
		else if (lossReceived <= (bestLoss * 3.8)) { points = maxPoints / 1.76 }
		else if (lossReceived <= (bestLoss * 3.9)) { points = maxPoints / 1.78 }
		else if (lossReceived <= (bestLoss * 4)) { points = maxPoints / 1.8 }
		else if (lossReceived <= (bestLoss * 4.1)) { points = maxPoints / 1.82 }
		else if (lossReceived <= (bestLoss * 4.2)) { points = maxPoints / 1.84 }
		else if (lossReceived <= (bestLoss * 4.3)) { points = maxPoints / 1.86 }
		else if (lossReceived <= (bestLoss * 4.4)) { points = maxPoints / 1.88 }
		else if (lossReceived <= (bestLoss * 4.5)) { points = maxPoints / 1.9 }
		else if (lossReceived <= (bestLoss * 4.6)) { points = maxPoints / 1.92 }
		else if (lossReceived <= (bestLoss * 4.7)) { points = maxPoints / 1.94 }
		else if (lossReceived <= (bestLoss * 4.8)) { points = maxPoints / 1.96 }
		else if (lossReceived <= (bestLoss * 4.9)) { points = maxPoints / 1.98 }
		else if (lossReceived <= (bestLoss * 5)) { points = maxPoints / 2 }
		else { points = 0 }

		
		// Return the received points
		return <number>this._utils.outputNumber(points, {dp: 2});
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
