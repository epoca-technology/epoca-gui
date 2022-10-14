import { Injectable } from '@angular/core';
import { FileService } from '../../file';
import { EpochBuilderEvaluationService } from '../epoch-builder-evaluation';
import { EpochBuilderMetadataService, IEpochBuilderMetadataService } from '../epoch-builder-metadata';
import { IPredictionModelCertificate, IEpochBuilderEvaluation } from '../_interfaces';
import { IPredictionModelService, IPredictionModelMetadata, IPredictionModelsOrder } from './interfaces';


@Injectable({
  providedIn: 'root'
})
export class PredictionModelService implements IPredictionModelService {
	// The list of certificate ids
	public ids!: string[];
	
	// The list of certificates
	public certificates!: IPredictionModelCertificate[];

	// Metadata
	public md!: IPredictionModelMetadata;


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
	 public async init(event: any|string, order: IPredictionModelsOrder, limit: number): Promise<void> {
		// Retrieve the certificates
		this.certificates = await this.getCertificates(event, order, limit);

		// Init values
		this.ids = [];
		const metadata: IEpochBuilderMetadataService = new EpochBuilderMetadataService();
		let totalPositions: number;
		let totalPredictions: number;

		// Iterate over each certificate and populate the metadata
		for (let i = 0; i < this.certificates.length; i++) {
			// Add the ID to the list
			this.ids.push(this.certificates[i].id);

			// Update EBE Points
			metadata.update("ebePoints", i, this.certificates[i].id, this.certificates[i].ebe.points);

			// Update the Backtest Profit
			metadata.update("backtestProfit", i, this.certificates[i].id, this.certificates[i].backtest.profit);

			// Update the Backtest Accuracy
			metadata.update("backtestIncreaseAccuracy", i, this.certificates[i].id, this.certificates[i].backtest.increase_accuracy);
			metadata.update("backtestDecreaseAccuracy", i, this.certificates[i].id, this.certificates[i].backtest.decrease_accuracy);
			metadata.update("backtestAccuracy", i, this.certificates[i].id, this.certificates[i].backtest.accuracy);

			// Update the Backtest Position Counts
			totalPositions = this.certificates[i].backtest.increase_num + this.certificates[i].backtest.decrease_num;
			metadata.update("backtestIncreasePositions", i, this.certificates[i].id, this.certificates[i].backtest.increase_num);
			metadata.update("backtestDecreasePositions", i, this.certificates[i].id, this.certificates[i].backtest.decrease_num);
			metadata.update("backtestPositions", i, this.certificates[i].id, totalPositions);

			// Update the backtest fees
			metadata.update("backtestFee", i, this.certificates[i].id, this.certificates[i].backtest.fees);

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
		}

		// Finally, populate the metadata results
		this.md = <IPredictionModelMetadata>metadata.getMetadata();
	}




	/**
	 * Resets all the data in the service and releases de memory.
	 */
	public reset(): void {
		this.ids = [];
		this.certificates = [];
		this.md = <IPredictionModelMetadata>{};
	}









	/**
	 * If the provided event is a string, it will download the certificate
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
		order: IPredictionModelsOrder, 
		limit: number
	): Promise<IPredictionModelCertificate[]> {
		// If it is a string, retrieve the certificate from the db
		if (typeof event == "string") {
			throw new Error("Prediction Model Certificates Init from db has not been implemented yet.")
		}

		// Extract the data from a JSON File
		else {
			// Retrieve the certificates
			let certificates: IPredictionModelCertificate[] = await this._file.readJSONFiles(event);
			certificates = certificates.flat();

			// Make sure there is at least 1 certificate
			if (certificates.length == 0) {
				throw new Error("The Prediction Model Certificates could not be extracted from the JSON Files.") 
			}

			// Iterate over each certificate
			for (let i = 0; i < certificates.length; i++) {
				// Make sure the certificate is valid
				this.validateCertificate(certificates[i]);

				// Build the General Evaluation
				certificates[i].ebe = this.buildEBE(certificates[i]);

				// Calculate the order value
				certificates[i].orderValue = this.getOrderValue(certificates[i], order)
			}

			// Order the certificates descendingly
			certificates.sort((a, b) => (a.orderValue < b.orderValue) ? 1 : -1);

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
	 private buildEBE(c: IPredictionModelCertificate): IEpochBuilderEvaluation {
		return this._evaluation.evaluate([
			{
				name: "Backtest",
				description: "Analyzes the Model's performance in a trading backtest that covers the test dataset range.",
				items: [
					{
						name: "Profit",
						description: this._evaluation.desc.profit,
						evaluationFunction: "evaluateProfit",
						evaluationParams: {
							receivedProfit: c.backtest.profit,
							optimalProfit: c.backtest.position_size * 2.2,
							maxPoints: 65
						}
					},
					{
						name: "Increase Accuracy",
						description: this._evaluation.desc.accuracy,
						evaluationFunction: "evaluateAccuracy",
						evaluationParams: {
							accuracy: c.backtest.increase_accuracy,
							maxPoints: 1.5
						}
					},
					{
						name: "Decrease Accuracy",
						description: this._evaluation.desc.accuracy,
						evaluationFunction: "evaluateAccuracy",
						evaluationParams: {
							accuracy: c.backtest.decrease_accuracy,
							maxPoints: 1.5
						}
					},
					{
						name: "Accuracy",
						description: this._evaluation.desc.accuracy,
						evaluationFunction: "evaluateAccuracy",
						evaluationParams: {
							accuracy: c.backtest.accuracy,
							maxPoints: 25
						}
					},
					{
						name: "Increase Predictions vs Outcomes",
						description: this._evaluation.desc.predictionsVsOutcomes,
						evaluationFunction: "evaluatePredictionsVsOutcomes",
						evaluationParams: {
							predictions: c.backtest.increase_num,
							outcomes: c.backtest.increase_outcome_num,
							maxPoints: 1
						}
					},
					{
						name: "Decrease Predictions vs Outcomes",
						description: this._evaluation.desc.predictionsVsOutcomes,
						evaluationFunction: "evaluatePredictionsVsOutcomes",
						evaluationParams: {
							predictions: c.backtest.decrease_num,
							outcomes: c.backtest.decrease_outcome_num,
							maxPoints: 1
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
							maxReceivablePoints: 100,
							maxPoints: 1
						}
					},
					{
						name: "Increase Accuracy",
						description: this._evaluation.desc.accuracy,
						evaluationFunction: "evaluateAccuracy",
						evaluationParams: {
							accuracy: c.discovery.increase_accuracy,
							maxPoints: 0.5
						}
					},
					{
						name: "Decrease Accuracy",
						description: this._evaluation.desc.accuracy,
						evaluationFunction: "evaluateAccuracy",
						evaluationParams: {
							accuracy: c.discovery.decrease_accuracy,
							maxPoints: 0.5
						}
					},
					{
						name: "Accuracy",
						description: this._evaluation.desc.accuracy,
						evaluationFunction: "evaluateAccuracy",
						evaluationParams: {
							accuracy: c.discovery.accuracy,
							maxPoints: 2
						}
					},
					{
						name: "Increase Predictions vs Outcomes",
						description: this._evaluation.desc.predictionsVsOutcomes,
						evaluationFunction: "evaluatePredictionsVsOutcomes",
						evaluationParams: {
							predictions: c.discovery.increase_num,
							outcomes: c.discovery.increase_outcome_num,
							maxPoints: 0.5
						}
					},
					{
						name: "Decrease Predictions vs Outcomes",
						description: this._evaluation.desc.predictionsVsOutcomes,
						evaluationFunction: "evaluatePredictionsVsOutcomes",
						evaluationParams: {
							predictions: c.discovery.decrease_num,
							outcomes: c.discovery.decrease_outcome_num,
							maxPoints: 0.5
						}
					}
				]
			}
		]);
	}








	/* Misc Helpers */


	/**
	 * Checks if the provided file corresponds to a Prediction Model
	 * Certificate. Otherwise, throws an error.
	 * @param certificate 
	 * @returns void
	 */
	 private validateCertificate(certificate: IPredictionModelCertificate): void {
		// Make sure it is an object
		if (!certificate || typeof certificate != "object") {
			console.log(certificate);
			throw new Error("The provided prediction model certificate is not an object.");
		}

		// Validate general values
		if (typeof certificate.id != "string") throw new Error(`The provided id (${certificate.id}) is invalid.`);
		if (typeof certificate.creation != "number") throw new Error(`The provided creation (${certificate.creation}) is invalid.`);
		if (typeof certificate.test_ds_start != "number") throw new Error(`The provided test_ds_start (${certificate.test_ds_start}) is invalid.`);
		if (typeof certificate.test_ds_end != "number") throw new Error(`The provided test_ds_end (${certificate.test_ds_end}) is invalid.`);
		if (!certificate.model || typeof certificate.model != "object") {
			console.log(certificate.model);
			throw new Error(`The provided model is invalid.`);
		}
		if (!certificate.discovery || typeof certificate.discovery != "object") {
			console.log(certificate.discovery);
			throw new Error(`The provided discovery is invalid.`);
		}
		if (!certificate.backtest || typeof certificate.backtest != "object") {
			console.log(certificate.backtest);
			throw new Error(`The provided backtest is invalid.`);
		}
	}






	/**
	 * Retrieves the order value for a given certificate.
	 * @param cert 
	 * @param order 
	 * @returns number
	 */
	 private getOrderValue(cert: IPredictionModelCertificate, order: IPredictionModelsOrder): number {
		// Return the order value according to the type of order
		if (order == "ebe_points") { return cert.ebe.points }
		else if (order == "backtest_profit") { return cert.backtest.profit}
		else if (order == "backtest_accuracy") { return cert.backtest.accuracy}
		else if (order == "discovery_points") { return cert.discovery.points }
		else if (order == "discovery_accuracy") { return cert.discovery.accuracy }
		else { throw new Error(`The Prediction Model Order ${order} is incompatible.`)}
	}
}
