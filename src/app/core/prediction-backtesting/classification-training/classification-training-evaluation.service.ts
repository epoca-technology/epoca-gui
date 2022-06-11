import { Injectable } from '@angular/core';
import { BigNumber } from "bignumber.js";
import { UtilsService } from '../../utils';
import { 
	IClassificationTrainingCertificate, 
	IGeneralEvaluation, 
	IItemGeneralEvaluation, 
	IGeneralEvaluationItem,
	IGeneralEvaluationCategory
} from '../../prediction';
import { IClassificationTrainingEvaluationService, } from './interfaces';

@Injectable({
  providedIn: 'root'
})
export class ClassificationTrainingEvaluationService implements IClassificationTrainingEvaluationService {
	// The minimum accuracy percentage allowed
	private readonly minAccuracy: number = 40;

	// The maximum neutrality percentage allowed
	private readonly maxNeutrality: number = 15;

	// The maximum percentage difference allowed for predictions vs outcomes
	private readonly maxPredictionDifference: number = 20;

	// Evaluation Template
	private evaluationTemplate: IGeneralEvaluation = {
		points: 0,
		max_points: 100,
		categories: [
			{
				name: "Training",
				description: "Analyzes the Model's Training Performance based on the Losses and Accuracies.",
				points: 0,
				max_points: 5,
				items: [
					{
						id: "loss_improvement",
						name: "Loss Improvement",
						description: "Evaluates the training loss obtained in the first epoch vs the one obtained in the last epoch. \
						In the case of a loss, the smaller the value the better.",
						state: "",
						points: 0,
						max_points: 0.83,
					},
					{
						id: "val_loss_improvement",
						name: "Val Loss Improvement",
						description: "Evaluates the validation loss obtained in the first epoch vs the one obtained in the last epoch. \
						In the case of a loss, the smaller the value the better.",
						state: "",
						points: 0,
						max_points: 0.83,
					},
					{
						id: "loss_vs_val_loss",
						name: "Loss vs Val Loss",
						description: "Evaluates the last loss vs the last validation loss. In the case of loss, the \
						smaller the value the better and the validation loss should be smaller than the \
						train loss because the result comes from data the model has not yet seen.",
						state: "",
						points: 0,
						max_points: 0.83,
					},
					{
						id: "accuracy_improvement",
						name: "Accuracy Improvement",
						description: "Evaluates the training accuracy obtained in the first epoch vs the one obtained\
						in the last epoch. In the case of accuracy, the bigger the value the better.",
						state: "",
						points: 0,
						max_points: 0.83,
					},
					{
						id: "val_accuracy_improvement",
						name: "Val Accuracy Improvement",
						description: "Evaluates the validation accuracy obtained in the first epoch vs the one obtained\
						in the last epoch. In the case of accuracy, the bigger the value the better.",
						state: "",
						points: 0,
						max_points: 0.83,
					},
					{
						id: "accuracy_vs_val_accuracy",
						name: "Accuracy vs Val Accuracy",
						description: "Evaluates the last accuracy vs the last validation accuracy. In the case of accuracy, the\
						bigger the value the better and the validation accuracy should be bigger than the \
						train accuracy because the result comes from data the model has not yet seen.",
						state: "",
						points: 0,
						max_points: 0.83,
					}
				]
			},
			{
				name: "Test Dataset Evaluation",
				description: "Analyzes the Model's Test Dataset Evaluation based on the result's accuracy.",
				points: 0,
				max_points: 45,
				items: [
					{
						id: "test_ds_accuracy",
						name: "Test Dataset Accuracy",
						description: "Evaluates the accuracy in the Test Dataset which has not yet been seen by the model.\
						In the case of accuracy, the bigger the value the better.",
						state: "",
						points: 0,
						max_points: 45,
					}
				]
			},
			{
				name: "Classification Evaluation",
				description: "Analyzes the Model's Classification Evaluation based on the accuracies, predictions and real outcomes.",
				points: 0,
				max_points: 50,
				items: [
					{
						id: "long_accuracy",
						name: "Long Accuracy",
						description: "Evaluates the accuracy received in long predictions during the Classification Evaluation.\
						In the case of accuracy, the bigger the value the better.",
						state: "",
						points: 0,
						max_points: 4.5,
					},
					{
						id: "short_accuracy",
						name: "Short Accuracy",
						description: "Evaluates the accuracy received in short predictions during the Classification Evaluation.\
						In the case of accuracy, the bigger the value the better.",
						state: "",
						points: 0,
						max_points: 4.5,
					},
					{
						id: "general_accuracy",
						name: "General Accuracy",
						description: "Evaluates the accuracy received in general predictions during the Classification Evaluation.\
						In the case of accuracy, the bigger the value the better.",
						state: "",
						points: 0,
						max_points: 19,
					},
					{
						id: "prediction_neutrality",
						name: "Prediction Neutrality",
						description: "Evaluates the number of neutral predictions generated by the model. A low neutrality can point\
						to a balanced prediction distribution.",
						state: "",
						points: 0,
						max_points: 14,
					},
					{
						id: "long_prediction_balance",
						name: "Long Prediction Balance",
						description: "Evaluates the balance of increase predictions generated by the model against the actual outcomes\
						during the classification evaluation. The smaller the distance between the prediction distribution and the \
						actual outcomes the better.",
						state: "",
						points: 0,
						max_points: 4,
					},
					{
						id: "short_prediction_balance",
						name: "Short Prediction Balance",
						description: "Evaluates the balance of decrease predictions generated by the model against the actual outcomes\
						during the classification evaluation. The smaller the distance between the prediction distribution and the \
						actual outcomes the better.",
						state: "",
						points: 0,
						max_points: 4,
					},
				]
			}
		]
	}

  	constructor(private _utils: UtilsService) { }





	/**
	 * Builds the general evaluation for a given certificate.
	 * @param cert 
	 * @returns IGeneralEvaluation
	 */
	 public buildGeneralEvaluation(cert: IClassificationTrainingCertificate): IGeneralEvaluation {
		// Init values
		let totalPoints: number = 0;
		let categories: IGeneralEvaluationCategory[] = [];

		// Iterate over each category
		for (let catIndex = 0; catIndex < this.evaluationTemplate.categories.length; catIndex++) {
			// Init values
			let catPoints: number = 0;
			let items: IGeneralEvaluationItem[] = [];

			// Iterate over each item
			for (let itemIndex = 0; itemIndex < this.evaluationTemplate.categories[catIndex].items.length; itemIndex++) {
				// Evaluate the item
				const { points, state } = this.evaluate(cert, this.evaluationTemplate.categories[catIndex].items[itemIndex]);

				// Increase the category points
				catPoints += points;

				// Append the item to the list
				items.push({...this.evaluationTemplate.categories[catIndex].items[itemIndex], points: points, state: state});
			}

			// Add the collected points to the total
			totalPoints += catPoints;

			// Append the category to the list
			categories.push({...this.evaluationTemplate.categories[catIndex], points: catPoints, items: items});
		}

		// Finally, return the evaluation
		return {
			points: totalPoints,
			max_points: this.evaluationTemplate.max_points,
			categories: categories
		}
	}








	/**
	 * Evaluates a given item accordingly based in its id.
	 * @param cert 
	 * @param item 
	 * @returns IItemGeneralEvaluation
	 */
	private evaluate(cert: IClassificationTrainingCertificate, item: IGeneralEvaluationItem): IItemGeneralEvaluation {
		// Check if the classification is broken
		const {broken, state} = this.isClassificationBroken(cert)

		// Training Evaluations
		if 		(item.id == "loss_improvement") { return this.lossImprovement(cert, item.max_points) }
		else if (item.id == "val_loss_improvement") { return this.valLossImprovement(cert, item.max_points) }
		else if (item.id == "loss_vs_val_loss") { return this.lossVsValLoss(cert, item.max_points) }
		else if (item.id == "accuracy_improvement") { return this.accuracyImprovement(cert, item.max_points) }
		else if (item.id == "val_accuracy_improvement") { return this.valAccuracyImprovement(cert, item.max_points) }
		else if (item.id == "accuracy_vs_val_accuracy") { return this.accuracyVsValAccuracy(cert, item.max_points) }

		// Test Dataset Evaluations
		else if (item.id == "test_ds_accuracy") { return this.testDatasetAccuracy(cert, item.max_points) }

		// Classification Evaluation
		else if (item.id == "long_accuracy") { return this.classificationEvaluationAccuracy(cert, item.max_points, "increase_acc", broken, state) }
		else if (item.id == "short_accuracy") { return this.classificationEvaluationAccuracy(cert, item.max_points, "decrease_acc", broken, state) }
		else if (item.id == "general_accuracy") { return this.classificationEvaluationAccuracy(cert, item.max_points, "acc", broken, state) }
		else if (item.id == "prediction_neutrality") { return this.predictionNeutrality(cert, item.max_points, broken, state) }
		else if (item.id == "long_prediction_balance") { return this.predictionBalance(cert, item.max_points, "increase", broken, state) }
		else if (item.id == "short_prediction_balance") { return this.predictionBalance(cert, item.max_points, "decrease", broken, state) }

		// Otherwise, something is wrong
		else { throw new Error(`The general evaluation item ${item.id} was not found.`) }
	}







	/* Training Evaluations */



	/**
	 * Evaluates the training loss obtained in the first epoch vs the one obtained
	 * in the last one. In the case of a loss, the smaller the value the better.
	 * @param cert
	 * @param maxPoints
	 * @returns IItemGeneralEvaluation
	 */
	private lossImprovement(cert: IClassificationTrainingCertificate, maxPoints: number): IItemGeneralEvaluation {
		// Calculate the change
		const change: number = <number>this._utils.calculatePercentageChange(
			cert.training_history.loss[0],
			cert.training_history.loss[cert.training_history.loss.length - 1],
		);

		// Check if there was an improvement
		if (change < 0) {
			return {
				points: this.calculatePoints(this.getAbsoluteValue(change), 0, 0.1, maxPoints), 
				state: `The training loss decreased by ${change}% during the training process.`
			}
		} else {
			return {
				points: 0, 
				state: `The training loss did not decrease during the training process. Instead, it increased by ${change}%.`
			}
		}
	}






	/**
	 * Evaluates the validation loss obtained in the first epoch vs the one obtained
	 * in the last one. In the case of a loss, the smaller the value the better.
	 * @param cert
	 * @param maxPoints
	 * @returns IItemGeneralEvaluation
	 */
	 private valLossImprovement(cert: IClassificationTrainingCertificate, maxPoints: number): IItemGeneralEvaluation {
		// Calculate the change
		const change: number = <number>this._utils.calculatePercentageChange(
			cert.training_history.val_loss[0],
			cert.training_history.val_loss[cert.training_history.val_loss.length - 1],
		);

		// Check if there was an improvement
		if (change < 0) {
			return {
				points: this.calculatePoints(this.getAbsoluteValue(change), 0, 0.1, maxPoints), 
				state: `The validation loss decreased by ${change}% during the training process.`
			}
		} else {
			return {
				points: 0, 
				state: `The validation loss did not decrease during the training process. Instead, it increased by ${change}%.`
			}
		}
	}





	/**
	 * Evaluates the last loss vs the last validation loss. In the case of a loss, the
	 * smaller the value the better and the validation loss should be smaller than the 
	 * train loss because the result comes from data the model has not yet seen.
	 * @param cert 
	 * @param maxPoints 
	 * @returns IItemGeneralEvaluation
	 */
	private lossVsValLoss(cert: IClassificationTrainingCertificate, maxPoints: number): IItemGeneralEvaluation {
		// Calculate the change between the last loss and val loss
		const change: number = <number>this._utils.calculatePercentageChange(
			cert.training_history.loss[cert.training_history.loss.length - 1],
			cert.training_history.val_loss[cert.training_history.val_loss.length - 1]
		);

		// Check if the val loss ended up performing better than the loss
		if (change < 0) {
			return {
				points: this.calculatePoints(this.getAbsoluteValue(change), 0, 0.1, maxPoints), 
				state: `The validation loss is smaller than the loss by ${change}%.`
			}
		} else {
			return {
				points: 0,
				state: `The loss is smaller than the validation loss by ${change}%.`
			}
		}
	}






	/**
	 * Evaluates the training accuracy obtained in the first epoch vs the one obtained
	 * in the last epoch. In the case of accuracy, the bigger the value the better.
	 * @param cert
	 * @param maxPoints
	 * @returns IItemGeneralEvaluation
	 */
	 private accuracyImprovement(cert: IClassificationTrainingCertificate, maxPoints: number): IItemGeneralEvaluation {
		// Calculate the change
		const change: number = <number>this._utils.calculatePercentageChange(
			cert.training_history.categorical_accuracy ? 
				cert.training_history.categorical_accuracy[0]: 
				cert.training_history.binary_accuracy![0],
			cert.training_history.categorical_accuracy ? 
				cert.training_history.categorical_accuracy[cert.training_history.categorical_accuracy.length - 1]:
				cert.training_history.binary_accuracy![cert.training_history.binary_accuracy!.length - 1]
		);

		// Check if there was an improvement
		if (change > 0) {
			return {
				points: this.calculatePoints(change, 0, 0.1, maxPoints), 
				state: `The training accuracy increased by ${change}% during the training process.`
			}
		} else {
			return {
				points: 0, 
				state: `The training accuracy did not increase during the training process. Instead, it decreased by ${change}%.`
			}
		}
	}








	/**
	 * Evaluates the validation accuracy obtained in the first epoch vs the one obtained
	 * in the last epoch. In the case of accuracy, the bigger the value the better.
	 * @param cert
	 * @param maxPoints
	 * @returns IItemGeneralEvaluation
	 */
	 private valAccuracyImprovement(cert: IClassificationTrainingCertificate, maxPoints: number): IItemGeneralEvaluation {
		// Calculate the change
		const change: number = <number>this._utils.calculatePercentageChange(
			cert.training_history.val_categorical_accuracy ? 
				cert.training_history.val_categorical_accuracy[0]: 
				cert.training_history.val_binary_accuracy![0],
			cert.training_history.val_categorical_accuracy ? 
				cert.training_history.val_categorical_accuracy[cert.training_history.val_categorical_accuracy.length - 1]:
				cert.training_history.val_binary_accuracy![cert.training_history.val_binary_accuracy!.length - 1]
		);

		// Check if there was an improvement
		if (change > 0) {
			return {
				points: this.calculatePoints(change, 0, 0.1, maxPoints), 
				state: `The validation accuracy increased by ${change}% during the training process.`
			}
		} else {
			return {
				points: 0, 
				state: `The validation accuracy did not increase during the training process. Instead, it decreased by ${change}%.`
			}
		}
	}






	/**
	 * Evaluates the last accuracy vs the last validation accuracy. In the case of accuracy, the
	 * bigger the value the better and the validation accuracy should be bigger than the 
	 * train accuracy because the result comes from data the model has not yet seen.
	 * @param cert 
	 * @param maxPoints 
	 * @returns IItemGeneralEvaluation
	 */
	 private accuracyVsValAccuracy(cert: IClassificationTrainingCertificate, maxPoints: number): IItemGeneralEvaluation {
		// Calculate the change between the last loss and val loss
		const change: number = <number>this._utils.calculatePercentageChange(
			cert.training_history.categorical_accuracy ? 
				cert.training_history.categorical_accuracy[cert.training_history.categorical_accuracy.length - 1]:
				cert.training_history.binary_accuracy![cert.training_history.binary_accuracy!.length - 1],
			cert.training_history.val_categorical_accuracy ? 
				cert.training_history.val_categorical_accuracy[cert.training_history.val_categorical_accuracy.length - 1]:
				cert.training_history.val_binary_accuracy![cert.training_history.val_binary_accuracy!.length - 1]
		);

		// Check if the val accuracy ended up performing better than the accuracy
		if (change > 0) {
			return {
				points: this.calculatePoints(change, 0, 0.1, maxPoints), 
				state: `The validation accuracy is bigger than the accuracy by ${change}%.`
			}
		} else {
			return {
				points: 0,
				state: `The accuracy is bigger than the validation accuracy by ${change}%.`
			}
		}
	}








	/* Test Dataset Evaluations */




	/**
	 * Evaluates the accuracy in the Test Dataset which has not yet been seen by the model.
	 * In the case of accuracy, the bigger the value the better.
	 * @param cert
	 * @param maxPoints
	 * @returns IItemGeneralEvaluation
	 */
	 private testDatasetAccuracy(cert: IClassificationTrainingCertificate, maxPoints: number): IItemGeneralEvaluation {
		// Calculate the change
		const accuracy: number = <number>this._utils.outputNumber(cert.test_evaluation[1], {dp: 2});

		// Check if there was an improvement
		if (accuracy >= 0.45) {
			return {
				points: this.calculatePoints(accuracy, 0.45, 0.75, maxPoints), 
				state: `The test dataset evaluation concluded with an accuracy of ${accuracy*100}%.`
			}
		} else {
			return {
				points: 0, 
				state: `The accuracy received in the test dataset evaluation is unacceptable (${accuracy*100}%).`
			}
		}
	}







	/* Classification Evaluations */




	/**
	 * Performs a very general evaluation of the model and detects if it is broken.
	 * If so, all classification related evaluations should return no points in order
	 * to sink the model.
	 * @param cert 
	 * @returns {broken: boolean, state: string}
	 */
	private isClassificationBroken(cert: IClassificationTrainingCertificate): {broken: boolean, state: string} {
		// Init values
		let broken: boolean = false;
		let state: string = "";

		// Firstly, check the neutrality
		const neutralPercent: number = <number>this._utils.calculatePercentageOutOfTotal(
			cert.classification_evaluation.max_evaluations - cert.classification_evaluation.evaluations, 
			cert.classification_evaluation.max_evaluations
		);
		if (neutralPercent >= this.maxNeutrality) {
			broken = true;
			state = `Broken Classification: the neutrality is unacceptable as it represents ${neutralPercent}% of the predictions.`;
		}


		// Check the accuracies
		if (cert.classification_evaluation.increase_acc <= this.minAccuracy) {
			broken = true;
			state = `Broken Classification: the increase accuracy is unacceptable: ${cert.classification_evaluation.increase_acc}%.`;
		}
		if (cert.classification_evaluation.decrease_acc <= this.minAccuracy) {
			broken = true;
			state = `Broken Classification: the decrease accuracy is unacceptable: ${cert.classification_evaluation.decrease_acc}%.`;
		}
		if (cert.classification_evaluation.acc <= this.minAccuracy) {
			broken = true;
			state = `Broken Classification: the accuracy is unacceptable: ${cert.classification_evaluation.acc}%.`;
		}


		// Check the increase predictions balance
		const increasePercentDifference: number = 
			this.getAbsoluteValue(<number>this._utils.calculatePercentageChange(
				cert.classification_evaluation.increase_num, 
				cert.classification_evaluation.increase_outcomes
			)
		);
		if (increasePercentDifference >= this.maxPredictionDifference) {
			broken = true;
			state = `Broken Classification: the increase prediction balance is unacceptable as the distance to the actual outcomes is 
			${increasePercentDifference}%.`;
		}

		// Check the decrease predictions balance
		const decreasePercentDifference: number = this.getAbsoluteValue(<number>this._utils.calculatePercentageChange(
				cert.classification_evaluation.decrease_num, 
				cert.classification_evaluation.decrease_outcomes
			)
		);
		if (decreasePercentDifference >= this.maxPredictionDifference) {
			broken = true;
			state = `Broken Classification: the decrease prediction balance is unacceptable as the distance to the actual outcomes is ${decreasePercentDifference}%.`;
		}

		// Return the final state
		return { broken: broken, state: state}
	}







	/**
	 * Evaluates the accuracy received in long predictions during the Classification Evaluation.
	 * In the case of accuracy, the bigger the value the better.
	 * @param cert
	 * @param maxPoints
	 * @param predictionType
	 * @param broken
	 * @param brokenState
	 * @returns IItemGeneralEvaluation
	 */
	 private classificationEvaluationAccuracy(
		 cert: IClassificationTrainingCertificate, 
		 maxPoints: number,
		 predictionType: "increase_acc"|"decrease_acc"|"acc",
		 broken: boolean,
		 brokenState: string
	): IItemGeneralEvaluation {
		// Firstly, make sure the classification isnt broken
		if (!broken) {
			// Calculate the change
			const accuracy: number = cert.classification_evaluation[predictionType];

			// Check if there was an improvement
			if (accuracy >= 45) {
				return {
					points: this.calculatePoints(accuracy, 45, 75, maxPoints), 
					state: `The classification evaluation concluded with an accuracy of ${accuracy}%.`
				}
			} else {
				return {
					points: 0, 
					state: `The accuracy received in the classification evaluation is unacceptable (${accuracy}%).`
				}
			}
		} else { return { points: 0, state: brokenState} }
	}





	/**
	 * Evaluates the number of neutral predictions generated by the model. A low neutrality can point
	 * to a balanced prediction distribution.
	 * @param cert 
	 * @param maxPoints 
	 * @param broken
	 * @param brokenState
	 * @returns  IItemGeneralEvaluation
	 */
	private predictionNeutrality(
		cert: IClassificationTrainingCertificate, 
		maxPoints: number,
		broken: boolean,
		brokenState: string
	): IItemGeneralEvaluation {
		// Firstly, make sure the classification isn't broken
		if (!broken) {
			// Calculate the number of neutral predictions
			const neutral: number = cert.classification_evaluation.max_evaluations - cert.classification_evaluation.evaluations;

			// Calculate the percentage that it represents out of total predictions
			const percentage: number = <number>this._utils.calculatePercentageOutOfTotal(neutral, cert.classification_evaluation.max_evaluations);

			// Calculate the points
			let points: number = 0;
			if 		(percentage > 14) 	{ points = maxPoints/12 }
			else if (percentage >= 13) 	{ points = maxPoints/10 }
			else if (percentage >= 12) 	{ points = maxPoints/8 }
			else if (percentage >= 11) 	{ points = maxPoints/6 }
			else if (percentage >= 10) 	{ points = maxPoints/4 }
			else if (percentage >= 9) 	{ points = maxPoints/1.9 }
			else if (percentage >= 8) 	{ points = maxPoints/1.8 }
			else if (percentage >= 7) 	{ points = maxPoints/1.7 }
			else if (percentage >= 6) 	{ points = maxPoints/1.6 }
			else if (percentage >= 5) 	{ points = maxPoints/1.5 }
			else if (percentage >= 4) 	{ points = maxPoints/1.4 }
			else if (percentage >= 3) 	{ points = maxPoints/1.3 }
			else if (percentage >= 2) 	{ points = maxPoints/1.2 }
			else if (percentage >= 1) 	{ points = maxPoints/1.1 }
			else 						{ points = maxPoints }

			// Finally, return the evaluation
			return {
				points: points, 
				state: `The neutrality represents ${percentage}% of the predictions.`
			}
		} else { return { points: 0, state: brokenState} }
	}





	/**
	 * Evaluates the balance of predictions by type generated by the model against the actual outcomes
	 * during the classification evaluation. The smaller the distance between the prediction distribution and the 
	 * actual outcomes the better.
	 * @param cert 
	 * @param maxPoints 
	 * @param predictionType
	 * @param broken
	 * @param brokenState
	 * @returns  IItemGeneralEvaluation
	 */
	 private predictionBalance(
		 cert: IClassificationTrainingCertificate, 
		 maxPoints: number,
		 predictionType: "increase"|"decrease",
		 broken: boolean,
		 brokenState: string
	): IItemGeneralEvaluation {
		// Firstly, make sure the classification isn't broken
		if (!broken) {
			// Init the predictions and the outcomes
			const predictions: number = 
				predictionType == "increase" ? cert.classification_evaluation.increase_num: cert.classification_evaluation.decrease_num;
			const outcomes: number = 
				predictionType == "increase" ? cert.classification_evaluation.increase_outcomes: cert.classification_evaluation.decrease_outcomes;
			
			// Calculate the absolute change between the values
			const change: number = this.getAbsoluteValue(<number>this._utils.calculatePercentageChange(predictions, outcomes));

			// Calculate the points
			let points: number = 0;
			if 		(change > 19) 	{ points = maxPoints/12 }
			else if (change >= 18) 	{ points = maxPoints/11 }
			else if (change >= 17) 	{ points = maxPoints/10 }
			else if (change >= 16) 	{ points = maxPoints/9 }
			else if (change >= 15) 	{ points = maxPoints/8 }
			else if (change >= 14) 	{ points = maxPoints/7 }
			else if (change >= 13) 	{ points = maxPoints/5.5 }
			else if (change >= 12) 	{ points = maxPoints/4 }
			else if (change >= 11) 	{ points = maxPoints/3.5 }
			else if (change >= 10) 	{ points = maxPoints/3 }
			else if (change >= 9) 	{ points = maxPoints/1.9 }
			else if (change >= 8) 	{ points = maxPoints/1.8 }
			else if (change >= 7) 	{ points = maxPoints/1.7 }
			else if (change >= 6) 	{ points = maxPoints/1.6 }
			else if (change >= 5) 	{ points = maxPoints/1.5 }
			else if (change >= 4) 	{ points = maxPoints/1.4 }
			else if (change >= 3) 	{ points = maxPoints/1.3 }
			else if (change >= 2) 	{ points = maxPoints/1.2 }
			else if (change >= 1) 	{ points = maxPoints/1.1 }
			else 					{ points = maxPoints }

			// Finally, return the evaluation
			return {
				points: points, 
				state: `The prediction balance is ${change}% away from the actual outcomes.`
			}
		} else { return { points: 0, state: brokenState} }
	}












	/* Point Calculations Helper */



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
		// Check if the value is equals or worse than the worstValue
		if (value <= worstValue) return 0;

		// Check if the value is equals or better than the bestValue
		if (value >= bestValue) return maxPoints;

		// Calculate the points
		const points: BigNumber = new BigNumber(value).times(maxPoints).dividedBy(bestValue);

		// Calculate the deserved points and return them
		return <number>this._utils.outputNumber(points, {dp: 2})
	}











	/* Misc Helpers */





	/**
	 * Retrieves the absolute value of a number.
	 * @param value 
	 * @returns number
	 */
	private getAbsoluteValue(value: number): number { return value >= 0 ? value: -(value) }
}
