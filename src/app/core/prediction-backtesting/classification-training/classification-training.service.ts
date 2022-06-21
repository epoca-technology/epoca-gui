import { Injectable } from '@angular/core';
import { FileService } from '../../file';
import { IClassificationTrainingCertificate } from '../../prediction';
import { ClassificationTrainingEvaluationService } from './classification-training-evaluation.service';
import { IClassificationTrainingService, IEvaluation, IMetadataItem, IClassificationCertificatesOrder } from './interfaces';

@Injectable({
  providedIn: 'root'
})
export class ClassificationTrainingService implements IClassificationTrainingService {
	// Summary
	public epochs!: number[];
	public evals!: IEvaluation[];

	// Certificates
	public ids!: string[];
	public certificates!: IClassificationTrainingCertificate[];

	// Metadata
	public pointsMetadata!: {best: IMetadataItem, worst: IMetadataItem};
	public accuraciesMetadata!: {best: IMetadataItem, worst: IMetadataItem};
	public predictionsMetadata!: {highest: IMetadataItem, lowest: IMetadataItem};
	public increaseProbsMetadata!: {highest: IMetadataItem, lowest: IMetadataItem};
	public successfulIncreaseProbsMetadata!: {highest: IMetadataItem, lowest: IMetadataItem};
	public decreaseProbsMetadata!: {highest: IMetadataItem, lowest: IMetadataItem};
	public successfulDecreaseProbsMetadata!: {highest: IMetadataItem, lowest: IMetadataItem};
	public testDSMetadata!: {best: IMetadataItem, worst: IMetadataItem};
	public epochsMetadata!: {highest: IMetadataItem, lowest: IMetadataItem};

  	constructor(
		  private _file: FileService,
		  private _evaluation: ClassificationTrainingEvaluationService
	) { }







	/**
	 * Initializes the Training Certificates based on an input file change or
	 * an ID that is stored in the db.
	 * @param event
	 * @param order
	 * @param limit
	 * @returns Promise<void>
	 */
	 public async init(event: any|string, order: IClassificationCertificatesOrder, limit: number): Promise<void> {
		// Retrieve the certificates
		this.certificates = await this.getCertificates(event, order);

		// Slice the certificates 
		this.certificates = this.certificates.slice(0, limit);

		// Init the summary data
		this.ids = [];
		this.epochs = [];
		this.evals = [];

		// Init the Metadata
		this.pointsMetadata = {
			best: {index: 0, id: this.certificates[0].id, value: this.certificates[0].general.points},
			worst: {index: 0, id: this.certificates[0].id, value: this.certificates[0].general.points},
		};
		this.accuraciesMetadata = {
			best: {index: 0, id: this.certificates[0].id, value: this.certificates[0].classification_evaluation.acc},
			worst: {index: 0, id: this.certificates[0].id, value: this.certificates[0].classification_evaluation.acc},
		};
		this.predictionsMetadata = {
			highest: {index: 0, id: this.certificates[0].id, value: this.certificates[0].classification_evaluation.positions.length},
			lowest: {index: 0, id: this.certificates[0].id, value: this.certificates[0].classification_evaluation.positions.length}
		};
		this.increaseProbsMetadata = {
			highest: {index: 0, id: this.certificates[0].id, value: this.certificates[0].classification_evaluation.increase_mean},
			lowest: {index: 0, id: this.certificates[0].id, value: this.certificates[0].classification_evaluation.increase_mean}
		};
		this.successfulIncreaseProbsMetadata = {
			highest: {index: 0, id: this.certificates[0].id, value: this.certificates[0].classification_evaluation.increase_successful_mean},
			lowest: {index: 0, id: this.certificates[0].id, value: this.certificates[0].classification_evaluation.increase_successful_mean}
		};
		this.decreaseProbsMetadata = {
			highest: {index: 0, id: this.certificates[0].id, value: this.certificates[0].classification_evaluation.decrease_mean},
			lowest: {index: 0, id: this.certificates[0].id, value: this.certificates[0].classification_evaluation.decrease_mean}
		};
		this.successfulDecreaseProbsMetadata = {
			highest: {index: 0, id: this.certificates[0].id, value: this.certificates[0].classification_evaluation.decrease_successful_mean},
			lowest: {index: 0, id: this.certificates[0].id, value: this.certificates[0].classification_evaluation.decrease_successful_mean}
		};
		this.testDSMetadata = {
			best: {index: 0, id: this.certificates[0].id, value: this.certificates[0].test_evaluation[1]},
			worst: {index: 0, id: this.certificates[0].id, value: this.certificates[0].test_evaluation[1]}
		};
		this.epochsMetadata = {
			highest: {index: 0, id: this.certificates[0].id, value: this.certificates[0].training_history.loss.length},
			lowest: {index: 0, id: this.certificates[0].id, value: this.certificates[0].training_history.loss.length}
		};


		// Iterate over each certificate building both, the summary and the metadata
		for (let i = 0; i < this.certificates.length; i++) {
			// Build the ids
			this.ids.push(this.certificates[i].id);

			// Build the number of epochs
			this.epochs.push(this.certificates[i].training_history.loss.length);

			// Build the evaluations
			this.evals.push({
				loss: this.certificates[i].test_evaluation[0],
				accuracy: this.certificates[i].test_evaluation[1],
			});

			// Check the points metadata
			if (this.certificates[i].general.points > this.pointsMetadata.best.value) {
				this.pointsMetadata.best = {index: i, id: this.certificates[i].id, value: this.certificates[i].general.points}
			}
			if (this.certificates[i].general.points < this.pointsMetadata.worst.value) {
				this.pointsMetadata.worst = {index: i, id: this.certificates[i].id, value: this.certificates[i].general.points}
			}

			// Check the accuracies metadata
			if (this.certificates[i].classification_evaluation.acc > this.accuraciesMetadata.best.value) {
				this.accuraciesMetadata.best = {index: i, id: this.certificates[i].id, value: this.certificates[i].classification_evaluation.acc}
			}
			if (this.certificates[i].classification_evaluation.acc < this.accuraciesMetadata.worst.value) {
				this.accuraciesMetadata.worst = {index: i, id: this.certificates[i].id, value: this.certificates[i].classification_evaluation.acc}
			}

			// Check the predictions metadata
			if (this.certificates[i].classification_evaluation.positions.length > this.predictionsMetadata.highest.value) {
				this.predictionsMetadata.highest = {index: i, id: this.certificates[i].id, value: this.certificates[i].classification_evaluation.positions.length}
			}
			if (this.certificates[i].classification_evaluation.positions.length < this.predictionsMetadata.lowest.value) {
				this.predictionsMetadata.lowest = {index: i, id: this.certificates[i].id, value: this.certificates[i].classification_evaluation.positions.length}
			}

			// Check the increase probs metadata
			if (this.certificates[i].classification_evaluation.increase_mean > this.increaseProbsMetadata.highest.value) {
				this.increaseProbsMetadata.highest = {index: i, id: this.certificates[i].id, value: this.certificates[i].classification_evaluation.increase_mean}
			}
			if (this.certificates[i].classification_evaluation.increase_mean < this.increaseProbsMetadata.lowest.value) {
				this.increaseProbsMetadata.lowest = {index: i, id: this.certificates[i].id, value: this.certificates[i].classification_evaluation.increase_mean}
			}
			if (this.certificates[i].classification_evaluation.increase_successful_mean > this.successfulIncreaseProbsMetadata.highest.value) {
				this.successfulIncreaseProbsMetadata.highest = {index: i, id: this.certificates[i].id, value: this.certificates[i].classification_evaluation.increase_successful_mean}
			}
			if (this.certificates[i].classification_evaluation.increase_successful_mean < this.successfulIncreaseProbsMetadata.lowest.value) {
				this.successfulIncreaseProbsMetadata.lowest = {index: i, id: this.certificates[i].id, value: this.certificates[i].classification_evaluation.increase_successful_mean}
			}

			// Check the decrease probs metadata
			if (this.certificates[i].classification_evaluation.decrease_mean > this.decreaseProbsMetadata.highest.value) {
				this.decreaseProbsMetadata.highest = {index: i, id: this.certificates[i].id, value: this.certificates[i].classification_evaluation.decrease_mean}
			}
			if (this.certificates[i].classification_evaluation.decrease_mean < this.decreaseProbsMetadata.lowest.value) {
				this.decreaseProbsMetadata.lowest = {index: i, id: this.certificates[i].id, value: this.certificates[i].classification_evaluation.decrease_mean}
			}
			if (this.certificates[i].classification_evaluation.decrease_successful_mean > this.successfulDecreaseProbsMetadata.highest.value) {
				this.successfulDecreaseProbsMetadata.highest = {index: i, id: this.certificates[i].id, value: this.certificates[i].classification_evaluation.decrease_successful_mean}
			}
			if (this.certificates[i].classification_evaluation.decrease_successful_mean < this.successfulDecreaseProbsMetadata.lowest.value) {
				this.successfulDecreaseProbsMetadata.lowest = {index: i, id: this.certificates[i].id, value: this.certificates[i].classification_evaluation.decrease_successful_mean}
			}

			// Check the test ds metadata
			if (this.certificates[i].test_evaluation[1] > this.testDSMetadata.best.value) {
				this.testDSMetadata.best = {index: i, id: this.certificates[i].id, value: this.certificates[i].test_evaluation[1]}
			}
			if (this.certificates[i].test_evaluation[1] < this.testDSMetadata.worst.value) {
				this.testDSMetadata.worst = {index: i, id: this.certificates[i].id, value: this.certificates[i].test_evaluation[1]}
			}

			// Check the epochs metadata
			if (this.certificates[i].training_history.loss.length > this.epochsMetadata.highest.value) {
				this.epochsMetadata.highest = {index: i, id: this.certificates[i].id, value: this.certificates[i].training_history.loss.length}
			}
			if (this.certificates[i].training_history.loss.length < this.epochsMetadata.lowest.value) {
				this.epochsMetadata.lowest = {index: i, id: this.certificates[i].id, value: this.certificates[i].training_history.loss.length}
			}
		}
	}






	








	/**
	 * If the provided event is a string, it will download the training certificate
	 * from the Database. Otherwise, it reads the json file and extracts all the
	 * certificates.
	 * An error is thrown if the validations dont pass.
	 * @param event 
	 * @param order
	 * @returns Promise<ITrainingDataFile>
	 */
	 private async getCertificates(event: any|string, order: IClassificationCertificatesOrder): Promise<IClassificationTrainingCertificate[]> {
		// If it is a string, retrieve the certificate from the db
		if (typeof event == "string") {
			throw new Error("Classification Training Certificates Init from db not implemented yet.")
		}

		// Extract the data from a JSON File
		else {
			// Retrieve the certificates
			const rawCertificates: Array<IClassificationTrainingCertificate[]|IClassificationTrainingCertificate> = 
				await this._file.readJSONFiles(event);

			// Flatten the certificates
			let certificates: IClassificationTrainingCertificate[] = rawCertificates.flat();

			// Make sure there is at least 1 certificate
			if (certificates.length == 0) {
				throw new Error("The Classification Training Certificates could not be extracted from the JSON Files.") 
			}

			// Iterate over each certificate
			for (let i = 0; i < certificates.length; i++) {
				// Make sure the certificate is valid
				this.validateTrainingCertificate(certificates[i]);

				// Build the General Evaluation
				certificates[i].general = this._evaluation.buildGeneralEvaluation(certificates[i]);
			}

			// Order the certificates by general points
			if (order == "general_points") {
				return certificates.sort((a, b) => (a.general.points < b.general.points) ? 1 : -1);
			} 
			
			// Order the certificates by the accuracy received in the classification evaluation
			else if (order == "class_eval_acc") {
				return certificates.sort((a, b) => (a.classification_evaluation.acc < b.classification_evaluation.acc) ? 1 : -1);
			} 
			
			// Order the certificates by the points received in the classification evaluation
			else if (order == "class_eval_points") {
				return certificates.sort((a, b) => (
					a.classification_evaluation.positions[a.classification_evaluation.positions.length-1].pts < 
					b.classification_evaluation.positions[b.classification_evaluation.positions.length-1].pts
				) ? 1 : -1);
			} 
			
			// Order the certificates by the accuracy received in the test dataset evaluation
			else {
				return certificates.sort((a, b) => (a.test_evaluation[1] < b.test_evaluation[1]) ? 1 : -1);
			}
		}
	}












	/**
	 * Checks if the provided file corresponds to a Classification Training Data
	 * File. Throws an error if it is not.
	 * @param certificate 
	 * @returns void
	 */
	private validateTrainingCertificate(certificate: IClassificationTrainingCertificate): void {
		// Make sure it is an object
		if (!certificate || typeof certificate != "object") {
			console.log(certificate);
			throw new Error("The provided classification training certificate is not an object.");
		}

		// Validate general values
		if (typeof certificate.id != "string") throw new Error(`The provided id (${certificate.id}) is invalid.`);
		if (typeof certificate.description != "string") throw new Error(`The provided description (${certificate.description}) is invalid.`);
		if (!certificate.training_data_summary || typeof certificate.training_data_summary != "object") {
			console.log(certificate.training_data_summary);
			throw new Error(`The provided training_data_summary is invalid.`);
		}
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
		if (!Array.isArray(certificate.test_evaluation) || certificate.test_evaluation.length != 2) {
			console.log(certificate.test_evaluation);
			throw new Error(`The provided test_evaluation is invalid.`);
		}
		if (!certificate.classification_evaluation || typeof certificate.classification_evaluation != "object") {
			console.log(certificate.classification_evaluation);
			throw new Error(`The provided classification_evaluation is invalid.`);
		}
		if (!certificate.classification_config || typeof certificate.classification_config != "object") {
			console.log(certificate.classification_config);
			throw new Error(`The provided classification_config is invalid.`);
		}
	}
}
