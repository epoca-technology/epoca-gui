import { Injectable } from '@angular/core';
import { FileService } from '../../file';
import { EpochBuilderEvaluationService } from '../epoch-builder-evaluation';
import { EpochBuilderMetadataService, IEpochBuilderMetadataService } from '../epoch-builder-metadata';
import { IKerasRegressionTrainingCertificate, IEpochBuilderEvaluation } from '../_interfaces';
import { IKerasRegressionService, IKerasRegressionMetadata, IKerasRegressionsOrder } from './interfaces';

@Injectable({
  providedIn: 'root'
})
export class KerasRegressionService implements IKerasRegressionService {
	// The list of certificate ids
	public ids!: string[];
	
	// The list of certificates
	public certificates!: IKerasRegressionTrainingCertificate[];

	// Metadata
	public md!: IKerasRegressionMetadata;


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
	public async init(event: any|string, order: IKerasRegressionsOrder, limit: number): Promise<void> {
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

			// Update Autoregressive Loss if applies
			if (this.certificates[i].autoregressive) {
				metadata.update("autoregressiveMAE", i, this.certificates[i].id, this.certificates[i].loss == "mean_absolute_error" ? this.certificates[i].test_evaluation[0]: this.certificates[i].test_evaluation[1]);
				metadata.update("autoregressiveMSE", i, this.certificates[i].id, this.certificates[i].loss == "mean_squared_error" ? this.certificates[i].test_evaluation[0]: this.certificates[i].test_evaluation[1]);
			}

			// Otherwise, update the Single Shot Loss
			else {
				metadata.update("singleShotMAE", i, this.certificates[i].id, this.certificates[i].loss == "mean_absolute_error" ? this.certificates[i].test_evaluation[0]: this.certificates[i].test_evaluation[1]);
				metadata.update("singleShotMSE", i, this.certificates[i].id, this.certificates[i].loss == "mean_squared_error" ? this.certificates[i].test_evaluation[0]: this.certificates[i].test_evaluation[1]);
			}

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
			metadata.update("discoverySuccessfulMean", i, this.certificates[i].id, this.certificates[i].discovery.successful_mean);

			// Update the Discovery Prediction Means
			metadata.update("discoveryIncreaseMean", i, this.certificates[i].id, this.certificates[i].discovery.increase_mean);
			metadata.update("discoveryDecreaseMean", i, this.certificates[i].id, this.certificates[i].discovery.decrease_mean);

			// Update the Training Epochs
			metadata.update("epochs", i, this.certificates[i].id, this.certificates[i].training_history.loss.length);
		}

		// Finally, populate the metadata results
		this.md = <IKerasRegressionMetadata>metadata.getMetadata();
	}




	/**
	 * Resets all the data in the service and releases de memory.
	 */
	public reset(): void {
		this.ids = [];
		this.certificates = [];
		this.md = <IKerasRegressionMetadata>{};
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
	 * @returns Promise<IKerasRegressionTrainingCertificate[]>
	 */
	 private async getCertificates(
		event: any|string, 
		order: IKerasRegressionsOrder, 
		limit: number
	): Promise<IKerasRegressionTrainingCertificate[]> {
		// If it is a string, retrieve the certificate from the db
		if (typeof event == "string") {
			throw new Error("Keras Regression Training Certificates Init from db has not been implemented yet.")
		}

		// Extract the data from a JSON File
		else {
			// Retrieve the certificates
			const rawCertificates: Array<IKerasRegressionTrainingCertificate[]|IKerasRegressionTrainingCertificate> = 
				await this._file.readJSONFiles(event);

			// Flatten the certificates
			let certificates: IKerasRegressionTrainingCertificate[] = rawCertificates.flat();

			// Make sure there is at least 1 certificate
			if (certificates.length == 0) {
				throw new Error("The Keras Regression Training Certificates could not be extracted from the JSON Files.") 
			}

			// Iterate over each certificate
			for (let i = 0; i < certificates.length; i++) {
				// Make sure the certificate is valid
				this.validateTrainingCertificate(certificates[i]);

				// Populate the early stopping property if it was invoked
				certificates[i].early_stopping = this.getEarlyStopping(certificates[i])

				// Build the General Evaluation
				certificates[i].ebe = this.buildEBE(certificates[i]);

				// Calculate the order value
				certificates[i].orderValue = this.getOrderValue(certificates[i], order)
			}

			// Filter the records that don't have any order value points (Outliars)

			/**
			 * DEPRECATION OF AUTOREGRESSIVE MODELS
			 * Remove the following line once the autoregressive regressions have been fully
			 * deprecated.
			 *  && !c.autoregressive
			 */
			certificates = certificates.filter((c) => c.orderValue > 0 && !c.autoregressive)

			// Make sure that at least 1 certificate remains in the list
			if (!certificates.length) {
				throw new Error("All the Keras Regression Certificates were filtered due to poor performance.");
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
	 private buildEBE(c: IKerasRegressionTrainingCertificate): IEpochBuilderEvaluation {
		// Init the metric loss values
		const metricLoss: number[] = c.training_history[c.metric]!;
		const metricValLoss: number[] = c.training_history[`val_${c.metric}`]!;

		// Return the evaluation build
		return this._evaluation.evaluate([
			{
				name: "Discovery",
				description: "Analyzes the Model's prediction performance based on the discovery payload.",
				items: [
					{
						name: "Increase Accuracy",
						description: this._evaluation.desc.accuracy,
						evaluationFunction: "evaluateAccuracy",
						evaluationParams: {
							accuracy: c.discovery.increase_accuracy,
							maxPoints: 4.5
						}
					},
					{
						name: "Decrease Accuracy",
						description: this._evaluation.desc.accuracy,
						evaluationFunction: "evaluateAccuracy",
						evaluationParams: {
							accuracy: c.discovery.decrease_accuracy,
							maxPoints: 4.5
						}
					},
					{
						name: "Accuracy",
						description: this._evaluation.desc.accuracy,
						evaluationFunction: "evaluateAccuracy",
						evaluationParams: {
							accuracy: c.discovery.accuracy,
							maxPoints: 60
						}
					},
					{
						name: "Prediction Neutrality",
						description: this._evaluation.desc.predictionNeutrality,
						evaluationFunction: "evaluatePredictionNeutrality",
						evaluationParams: {
							neutral: c.discovery.neutral_num,
							nonNeutral: c.discovery.increase_num + c.discovery.decrease_num,
							maxPoints: 16.5
						}
					},
					{
						name: "Increase Predictions vs Outcomes",
						description: this._evaluation.desc.predictionsVsOutcomes,
						evaluationFunction: "evaluatePredictionsVsOutcomes",
						evaluationParams: {
							predictions: c.discovery.increase_num,
							outcomes: c.discovery.increase_outcome_num,
							maxPoints: 5
						}
					},
					{
						name: "Decrease Predictions vs Outcomes",
						description: this._evaluation.desc.predictionsVsOutcomes,
						evaluationFunction: "evaluatePredictionsVsOutcomes",
						evaluationParams: {
							predictions: c.discovery.decrease_num,
							outcomes: c.discovery.decrease_outcome_num,
							maxPoints: 5
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
							maxPoints: 0.75
						}
					},
					{
						name: "Validation Loss Improvement",
						description: this._evaluation.desc.lossImprovement,
						evaluationFunction: "evaluateLossImprovement",
						evaluationParams: {
							firstLoss: c.training_history.val_loss[0],
							lastLoss: c.training_history.val_loss[c.training_history.val_loss.length - 1],
							maxPoints: 0.75
						}
					},
					{
						name: "Train Loss vs Validation Loss",
						description: this._evaluation.desc.lossVsValLoss,
						evaluationFunction: "evaluateLossVsValLoss",
						evaluationParams: {
							finalLoss: c.training_history.loss[c.training_history.loss.length - 1],
							finalValLoss: c.training_history.val_loss[c.training_history.val_loss.length - 1],
							maxPoints: 0.75
						}
					},
					{
						name: "Train Loss Metric Improvement",
						description: this._evaluation.desc.lossImprovement,
						evaluationFunction: "evaluateLossImprovement",
						evaluationParams: {
							firstLoss: metricLoss[0],
							lastLoss: metricLoss[metricLoss.length - 1],
							maxPoints: 0.75
						}
					},
					{
						name: "Validation Loss Metric Improvement",
						description: this._evaluation.desc.lossImprovement,
						evaluationFunction: "evaluateLossImprovement",
						evaluationParams: {
							firstLoss: metricValLoss[0],
							lastLoss: metricValLoss[metricValLoss.length - 1],
							maxPoints: 0.75
						}
					},
					{
						name: "Train Loss Metric vs Validation Loss Metric",
						description: this._evaluation.desc.lossVsValLoss,
						evaluationFunction: "evaluateLossVsValLoss",
						evaluationParams: {
							finalLoss: metricLoss[metricLoss.length - 1],
							finalValLoss: metricValLoss[metricValLoss.length - 1],
							maxPoints: 0.75
						}
					}
				]
			}
		]);
	}











	/* Misc Helpers */




	/**
	 * Checks if the provided file corresponds to a Keras Regression Training
	 * Certificate. Otherwise, throws an error.
	 * @param certificate 
	 * @returns void
	 */
	 private validateTrainingCertificate(certificate: IKerasRegressionTrainingCertificate): void {
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
		if (!Array.isArray(certificate.test_evaluation)) {
			console.log(certificate.test_evaluation);
			throw new Error(`The provided test_evaluation is invalid.`);
		}
		if (!certificate.discovery || typeof certificate.discovery != "object") {
			console.log(certificate.discovery);
			throw new Error(`The provided discovery is invalid.`);
		}
	}






	/**
	 * Checks if a certificate was stopped early. If so, it returns the motive.
	 * Otherwise, it returns undefined.
	 * @param cert 
	 * @returns string|undefined
	 */
	 private getEarlyStopping(cert: IKerasRegressionTrainingCertificate): string|undefined {
		return typeof cert.discovery.early_stopping == "string" ? cert.discovery.early_stopping: undefined;
	}








	/**
	 * Retrieves the order value for a given certificate.
	 * @param cert 
	 * @param order 
	 * @returns number
	 */
	private getOrderValue(cert: IKerasRegressionTrainingCertificate, order: IKerasRegressionsOrder): number {
		// Make sure the model did not stop early
		if (typeof cert.early_stopping != "string") {
			// Return the order value according to the type of order
			if (order == "mae") { return cert.loss == "mean_absolute_error" ? cert.test_evaluation[0]: cert.test_evaluation[1]}
			else if (order == "mse") { return cert.loss == "mean_squared_error" ? cert.test_evaluation[0]: cert.test_evaluation[1]}
			else if (order == "ebe_points") { return cert.ebe.points }
			else if (order == "discovery_accuracy") { return cert.discovery.accuracy }
			else { throw new Error(`The Keras Regression Order ${order} is incompatible.`)}
		} else { return 0 }
	}
}
