import { Injectable } from '@angular/core';
import { FileService } from '../../file';
import { EpochBuilderEvaluationService } from '../epoch-builder-evaluation';
import { EpochBuilderMetadataService, IEpochBuilderMetadataService } from '../epoch-builder-metadata';
import { IRegressionTrainingCertificate, IEpochBuilderEvaluation } from '../_interfaces';
import { IRegressionService, IRegressionMetadata, IRegressionsOrder } from './interfaces';





@Injectable({
  providedIn: 'root'
})
export class RegressionService implements IRegressionService {
	// The list of certificate ids
	public ids!: string[];
	
	// The list of certificates
	public certificates!: IRegressionTrainingCertificate[];

	// Metadata
	public md!: IRegressionMetadata;


	constructor(
		private _file: FileService,
		private _evaluation: EpochBuilderEvaluationService
	) { }




	/* Initialization */


	/**
	 * Initializes the Training Certificates based on an input file change or
	 * an ID that is stored in the db.
	 * @param event
	 * @param order
	 * @param limit
	 * @returns Promise<void>
	 */
	public async init(event: any|string, order: IRegressionsOrder, limit: number): Promise<void> {
		// Retrieve the certificates
		this.certificates = await this.getCertificates(event, order, limit);

		// Init values
		this.ids = [];
		const metadata: IEpochBuilderMetadataService = new EpochBuilderMetadataService();
		let totalPredictions: number;

		// Iterate over each certificate and populate the metadata
		for (let i = 0; i < this.certificates.length; i++) {
			// Add the ID to the list
			this.ids.push(this.certificates[i].id);

			// Update EBE Points
			metadata.update("ebePoints", i, this.certificates[i].id, this.certificates[i].ebe.points);

			// Update Test Dataset Evaluation
			metadata.update("testDatasetMAE", i, this.certificates[i].id, this.certificates[i].test_ds_evaluation.mean_absolute_error);
			metadata.update("testDatasetMSE", i, this.certificates[i].id, this.certificates[i].test_ds_evaluation.mean_squared_error);

			// Update the discovery points
			metadata.update("discoveryPoints", i, this.certificates[i].id, this.certificates[i].discovery.points);

			// Update the Discovery Accuracy
			metadata.update("discoveryIncreaseAccuracy", i, this.certificates[i].id, this.certificates[i].discovery.increase_accuracy);
			metadata.update("discoveryDecreaseAccuracy", i, this.certificates[i].id, this.certificates[i].discovery.decrease_accuracy);
			metadata.update("discoveryAccuracy", i, this.certificates[i].id, this.certificates[i].discovery.accuracy);

			// Update the Discovery Prediction Counts
			totalPredictions = this.certificates[i].discovery.increase_num + this.certificates[i].discovery.decrease_num;
			metadata.update("discoveryNeutralPredictions", i, this.certificates[i].id, this.certificates[i].discovery.neutral_num);
			metadata.update("discoveryIncreasePredictions", i, this.certificates[i].id, this.certificates[i].discovery.increase_num);
			metadata.update("discoveryDecreasePredictions", i, this.certificates[i].id, this.certificates[i].discovery.decrease_num);
			metadata.update("discoveryPredictions", i, this.certificates[i].id, totalPredictions);

			// Update the Discovery Successful Predictions
			metadata.update("discoverySuccessfulIncreaseMean", i, this.certificates[i].id, this.certificates[i].discovery.increase_successful_mean);
			metadata.update("discoverySuccessfulDecreaseMean", i, this.certificates[i].id, this.certificates[i].discovery.decrease_successful_mean);

			// Update the Discovery Prediction Means
			metadata.update("discoveryIncreaseMean", i, this.certificates[i].id, this.certificates[i].discovery.increase_mean);
			metadata.update("discoveryDecreaseMean", i, this.certificates[i].id, this.certificates[i].discovery.decrease_mean);

			// Update the Training Epochs
			metadata.update("epochs", i, this.certificates[i].id, this.certificates[i].training_history.loss.length);
		}

		// Finally, populate the metadata results
		this.md = <IRegressionMetadata>metadata.getMetadata();
	}




	/**
	 * Resets all the data in the service and releases de memory.
	 */
	public reset(): void {
		this.ids = [];
		this.certificates = [];
		this.md = <IRegressionMetadata>{};
	}








	/**
	 * If the provided event is a string, it will download the training certificate
	 * from the Database. Otherwise, it reads the json file and extracts all the
	 * certificates.
	 * An error is thrown if the validations dont pass or if no final results are
	 * found after the filtering.
	 * @param event 
	 * @param order
	 * @param limit
	 * @returns Promise<IRegressionTrainingCertificate[]>
	 */
	 private async getCertificates(
		event: any|string, 
		order: IRegressionsOrder, 
		limit: number
	): Promise<IRegressionTrainingCertificate[]> {
		// If it is a string, retrieve the certificate from the db
		if (typeof event == "string") {
			throw new Error("Regression Training Certificates Init from db has not been implemented yet.")
		}

		// Extract the data from a JSON File
		else {
			// Retrieve the certificates
			const rawCertificates: Array<IRegressionTrainingCertificate[]|IRegressionTrainingCertificate> = 
				await this._file.readJSONFiles(event);

			// Flatten the certificates
			let certificates: IRegressionTrainingCertificate[] = rawCertificates.flat();

			// Make sure there is at least 1 certificate
			if (certificates.length == 0) {
				throw new Error("The Regression Training Certificates could not be extracted from the JSON Files.") 
			}

			// Iterate over each certificate
			for (let i = 0; i < certificates.length; i++) {
				// Make sure the certificate is valid
				this.validateTrainingCertificate(certificates[i]);

				// Build the General Evaluation
				certificates[i].ebe = this.buildEBE(certificates[i]);

				// Calculate the order value
				certificates[i].orderValue = this.getOrderValue(certificates[i], order)
			}

			// Order the values ascendingly if it is a loss
			if (order == "mae" || order == "mse") {
				certificates.sort((a, b) => (a.orderValue > b.orderValue) ? 1 : -1);
			} 

			// Otherwise, order the certificates descendingly
			else {
				certificates.sort((a, b) => (a.orderValue < b.orderValue) ? 1 : -1);
			}

			// Apply the slice and return the final list that will be used
			return certificates.slice(0, limit)
		}
	}







	/* Epoch Builder Evaluation */




	/**
	 * Builds the Epoch Builder Evaluation for a given certificate.
	 * @param c 
	 * @returns IEpochBuilderEvaluation
	 */
	 private buildEBE(c: IRegressionTrainingCertificate): IEpochBuilderEvaluation {
		// Init the metric loss values
		const metricLoss: number[] = c.training_history[c.metric]!;
		const metricValLoss: number[] = c.training_history[`val_${c.metric}`]!;

		// Return the evaluation build
		return this._evaluation.evaluate([
			{
				name: "Test Dataset Evaluation",
				description: "Analyzes the losses when evaluating the test dataset labels vs the predictions.",
				items: [
					{
						name: "Mean Absolute Error",
						description: this._evaluation.desc.testDatasetLoss,
						evaluationFunction: "evaluateTestDatasetLoss",
						evaluationParams: {
							meanAbsoluteError: c.test_ds_evaluation.mean_absolute_error,
							maxPoints: 35
						}
					},
					{
						name: "Mean Squared Error",
						description: this._evaluation.desc.testDatasetLoss,
						evaluationFunction: "evaluateTestDatasetLoss",
						evaluationParams: {
							meanSquaredError: c.test_ds_evaluation.mean_squared_error,
							maxPoints: 35
						}
					}
				]
			},
			{
				name: "Discovery",
				description: "Analyzes the Model's prediction performance based on the discovery.",
				items: [
					{
						name: "Discovery Points",
						description: this._evaluation.desc.points,
						evaluationFunction: "evaluatePoints",
						evaluationParams: {
							receivedPoints: c.discovery.points,
							maxReceivablePoints: Math.floor(
								(c.discovery.increase_outcome_num + c.discovery.decrease_outcome_num - c.discovery.neutral_outcome_num) * 0.5
							),
							maxPoints: 13.5
						}
					},
					{
						name: "Increase Accuracy",
						description: this._evaluation.desc.accuracy,
						evaluationFunction: "evaluateAccuracy",
						evaluationParams: {
							accuracy: c.discovery.increase_accuracy,
							maxPoints: 1
						}
					},
					{
						name: "Decrease Accuracy",
						description: this._evaluation.desc.accuracy,
						evaluationFunction: "evaluateAccuracy",
						evaluationParams: {
							accuracy: c.discovery.decrease_accuracy,
							maxPoints: 1
						}
					},
					{
						name: "Accuracy",
						description: this._evaluation.desc.accuracy,
						evaluationFunction: "evaluateAccuracy",
						evaluationParams: {
							accuracy: c.discovery.accuracy,
							maxPoints: 10
						}
					},
					{
						name: "Increase Predictions vs Outcomes",
						description: this._evaluation.desc.predictionsVsOutcomes,
						evaluationFunction: "evaluatePredictionsVsOutcomes",
						evaluationParams: {
							predictions: c.discovery.increase_num,
							outcomes: c.discovery.increase_outcome_num,
							maxPoints: 1.5
						}
					},
					{
						name: "Decrease Predictions vs Outcomes",
						description: this._evaluation.desc.predictionsVsOutcomes,
						evaluationFunction: "evaluatePredictionsVsOutcomes",
						evaluationParams: {
							predictions: c.discovery.decrease_num,
							outcomes: c.discovery.decrease_outcome_num,
							maxPoints: 1.5
						}
					}
				]
			},
			{
				name: "Training",
				description: "Analyzes the Model's training performance based on the losses.",
				items: [
					{
						name: "Train Loss Improvement",
						description: this._evaluation.desc.lossImprovement,
						evaluationFunction: "evaluateLossImprovement",
						evaluationParams: {
							firstLoss: c.training_history.loss[0],
							lastLoss: c.training_history.loss[c.training_history.loss.length - 1],
							maxPoints: 0.25
						}
					},
					{
						name: "Validation Loss Improvement",
						description: this._evaluation.desc.lossImprovement,
						evaluationFunction: "evaluateLossImprovement",
						evaluationParams: {
							firstLoss: c.training_history.val_loss[0],
							lastLoss: c.training_history.val_loss[c.training_history.val_loss.length - 1],
							maxPoints: 0.25
						}
					},
					{
						name: "Train Loss vs Validation Loss",
						description: this._evaluation.desc.lossVsValLoss,
						evaluationFunction: "evaluateLossVsValLoss",
						evaluationParams: {
							finalLoss: c.training_history.loss[c.training_history.loss.length - 1],
							finalValLoss: c.training_history.val_loss[c.training_history.val_loss.length - 1],
							maxPoints: 0.25
						}
					},
					{
						name: "Train Loss Metric Improvement",
						description: this._evaluation.desc.lossImprovement,
						evaluationFunction: "evaluateLossImprovement",
						evaluationParams: {
							firstLoss: metricLoss[0],
							lastLoss: metricLoss[metricLoss.length - 1],
							maxPoints: 0.25
						}
					},
					{
						name: "Validation Loss Metric Improvement",
						description: this._evaluation.desc.lossImprovement,
						evaluationFunction: "evaluateLossImprovement",
						evaluationParams: {
							firstLoss: metricValLoss[0],
							lastLoss: metricValLoss[metricValLoss.length - 1],
							maxPoints: 0.25
						}
					},
					{
						name: "Train Loss Metric vs Validation Loss Metric",
						description: this._evaluation.desc.lossVsValLoss,
						evaluationFunction: "evaluateLossVsValLoss",
						evaluationParams: {
							finalLoss: metricLoss[metricLoss.length - 1],
							finalValLoss: metricValLoss[metricValLoss.length - 1],
							maxPoints: 0.25
						}
					}
				]
			}
		]);
	}











	/* Misc Helpers */




	/**
	 * Checks if the provided file corresponds to a Regression Training
	 * Certificate. Otherwise, throws an error.
	 * @param certificate 
	 * @returns void
	 */
	 private validateTrainingCertificate(certificate: IRegressionTrainingCertificate): void {
		// Make sure it is an object
		if (!certificate || typeof certificate != "object") {
			console.log(certificate);
			throw new Error("The provided keras regression training certificate is not an object.");
		}

		// Validate general values
		if (typeof certificate.id != "string") throw new Error(`The provided id (${certificate.id}) is invalid.`);
		if (typeof certificate.description != "string") throw new Error(`The provided description (${certificate.description}) is invalid.`);
		if (!certificate.training_data_summary || typeof certificate.training_data_summary != "object") {
			console.log(certificate.training_data_summary);
			throw new Error(`The provided training_data_summary is invalid.`);
		}
		if (typeof certificate.learning_rate != "number") throw new Error(`The provided learning_rate (${certificate.learning_rate}) is invalid.`);
		if (typeof certificate.optimizer != "string") throw new Error(`The provided optimizer (${certificate.optimizer}) is invalid.`);
		if (typeof certificate.loss != "string") throw new Error(`The provided loss (${certificate.loss}) is invalid.`);
		if (typeof certificate.metric != "string") throw new Error(`The provided metric (${certificate.metric}) is invalid.`);
		if (!certificate.keras_model_config || typeof certificate.keras_model_config != "object") {
			console.log(certificate.keras_model_config);
			throw new Error(`The provided keras_model_config is invalid.`);
		}
		if (typeof certificate.training_start != "number") throw new Error(`The provided training_start (${certificate.training_start}) is invalid.`);
		if (typeof certificate.training_end != "number") throw new Error(`The provided training_end (${certificate.training_end}) is invalid.`);
		if (!certificate.training_history || typeof certificate.training_history != "object") {
			console.log(certificate.training_history);
			throw new Error(`The provided training_history is invalid.`);
		}
		if (!certificate.test_ds_evaluation || typeof certificate.test_ds_evaluation != "object") {
			console.log(certificate.test_ds_evaluation);
			throw new Error(`The provided test_ds_evaluation is invalid.`);
		}
		if (!certificate.discovery || typeof certificate.discovery != "object") {
			console.log(certificate.discovery);
			throw new Error(`The provided discovery is invalid.`);
		}
	}









	/**
	 * Retrieves the order value for a given certificate.
	 * @param cert 
	 * @param order 
	 * @returns number
	 */
	private getOrderValue(cert: IRegressionTrainingCertificate, order: IRegressionsOrder): number {
			// Return the order value according to the type of order
			if (order == "ebe_points") { return cert.ebe.points }
			else if (order == "mae") { return cert.test_ds_evaluation.mean_absolute_error}
			else if (order == "mse") { return cert.test_ds_evaluation.mean_squared_error}
			else if (order == "discovery_points") { return cert.discovery.points }
			else if (order == "discovery_accuracy") { return cert.discovery.accuracy }
			else { throw new Error(`The Regression Order ${order} is incompatible.`)}
	}
}
