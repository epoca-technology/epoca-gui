import { Injectable } from '@angular/core';
import { FileService } from '../../file';
import { IRegressionTrainingCertificate } from '../../prediction';
import { IMetadataItem } from '../classification-training';
import { IRegressionCertificatesOrder, IRegressionTrainingService } from './interfaces';
import { RegressionTrainingEvaluationService } from './regression-training-evaluation.service';

@Injectable({
  providedIn: 'root'
})
export class RegressionTrainingService implements IRegressionTrainingService{
	// Summary
	public epochs!: number[];

	// Certificates
	public ids!: string[];
	public certificates!: IRegressionTrainingCertificate[];

	// Metadata
	public pointsMetadata!: {highest: IMetadataItem, lowest: IMetadataItem};
	public accuraciesMetadata!: {highest: IMetadataItem, lowest: IMetadataItem};
	public regPointsMetadata!: {highest: IMetadataItem, lowest: IMetadataItem};
	public predictionsMetadata!: {highest: IMetadataItem, lowest: IMetadataItem};
	public epochsMetadata!: {highest: IMetadataItem, lowest: IMetadataItem};


  	constructor(
		private _file: FileService,
		private _evaluation: RegressionTrainingEvaluationService
	) { }




	/**
	 * Initializes the Training Certificates based on an input file change or
	 * an ID that is stored in the db.
	 * @param event
	 * @param order
	 * @param limit
	 * @returns Promise<void>
	 */
	 public async init(event: any|string, order: IRegressionCertificatesOrder, limit: number): Promise<void> {
		// Retrieve the certificates
		this.certificates = await this.getCertificates(event, order);

		// Slice the certificates 
		this.certificates = this.certificates.slice(0, limit);

		// Init the summary data
		this.ids = [];
		this.epochs = [];

		// Init the Metadata
		this.pointsMetadata = {
			highest: {index: 0, id: this.certificates[0].id, value: this.certificates[0].general.points},
			lowest: {index: 0, id: this.certificates[0].id, value: this.certificates[0].general.points},
		};
		this.accuraciesMetadata = {
			highest: {index: 0, id: this.certificates[0].id, value: this.certificates[0].regression_evaluation.acc},
			lowest: {index: 0, id: this.certificates[0].id, value: this.certificates[0].regression_evaluation.acc},
		};
		this.regPointsMetadata = {
			highest: {index: 0, id: this.certificates[0].id, value: this.certificates[0].regression_evaluation.points_median},
			lowest: {index: 0, id: this.certificates[0].id, value: this.certificates[0].regression_evaluation.points_median},
		};
		this.predictionsMetadata = {
			highest: {index: 0, id: this.certificates[0].id, value: this.certificates[0].regression_evaluation.positions.length},
			lowest: {index: 0, id: this.certificates[0].id, value: this.certificates[0].regression_evaluation.positions.length}
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

			// Check the points metadata
			if (this.certificates[i].general.points > this.pointsMetadata.highest.value) {
				this.pointsMetadata.highest = {index: i, id: this.certificates[i].id, value: this.certificates[i].general.points}
			}
			if (this.certificates[i].general.points < this.pointsMetadata.lowest.value) {
				this.pointsMetadata.lowest = {index: i, id: this.certificates[i].id, value: this.certificates[i].general.points}
			}

			// Check the accuracies metadata
			if (this.certificates[i].regression_evaluation.acc > this.accuraciesMetadata.highest.value) {
				this.accuraciesMetadata.highest = {index: i, id: this.certificates[i].id, value: this.certificates[i].regression_evaluation.acc}
			}
			if (this.certificates[i].regression_evaluation.acc < this.accuraciesMetadata.lowest.value) {
				this.accuraciesMetadata.lowest = {index: i, id: this.certificates[i].id, value: this.certificates[i].regression_evaluation.acc}
			}

			// Check the regression points metadata
			if (this.certificates[i].regression_evaluation.points_median > this.regPointsMetadata.highest.value) {
				this.regPointsMetadata.highest = {index: i, id: this.certificates[i].id, value: this.certificates[i].regression_evaluation.points_median}
			}
			if (this.certificates[i].regression_evaluation.points_median < this.regPointsMetadata.lowest.value) {
				this.regPointsMetadata.lowest = {index: i, id: this.certificates[i].id, value: this.certificates[i].regression_evaluation.points_median}
			}

			// Check the predictions metadata
			if (this.certificates[i].regression_evaluation.positions.length > this.predictionsMetadata.highest.value) {
				this.predictionsMetadata.highest = {index: i, id: this.certificates[i].id, value: this.certificates[i].regression_evaluation.positions.length}
			}
			if (this.certificates[i].regression_evaluation.positions.length < this.predictionsMetadata.lowest.value) {
				this.predictionsMetadata.lowest = {index: i, id: this.certificates[i].id, value: this.certificates[i].regression_evaluation.positions.length}
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








	/* Certificates Retriever */






	/**
	 * If the provided event is a string, it will download the training certificate
	 * from the Database. Otherwise, it reads the json file and extracts all the
	 * certificates.
	 * An error is thrown if the validations dont pass.
	 * @param event 
	 * @param order
	 * @returns Promise<ITrainingDataFile>
	 */
	 private async getCertificates(event: any|string, order: IRegressionCertificatesOrder): Promise<IRegressionTrainingCertificate[]> {
		// If it is a string, retrieve the certificate from the db
		if (typeof event == "string") {
			throw new Error("Regression Training Certificates Init from db not implemented yet.")
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
				certificates[i].general = this._evaluation.buildGeneralEvaluation(certificates[i]);
			}

			// Order the certificates by general points
			if (order == "general_points") {
				return certificates.sort((a, b) => (a.general.points < b.general.points) ? 1 : -1);
			} 
			
			// Order the certificates by the accuracy received in the classification evaluation
			else if (order == "reg_eval_acc") {
				return certificates.sort((a, b) => (a.regression_evaluation.acc < b.regression_evaluation.acc) ? 1 : -1);
			} 
			
			// Order the certificates by the points received in the classification evaluation
			else if (order == "reg_eval_points") {
				return certificates.sort((a, b) => (
					a.regression_evaluation.points_median < 
					b.regression_evaluation.points_median
				) ? 1 : -1);
			} 
			
			// An invalid order has been provided
			else {
				throw new Error("An invalid order was provided to RegressionTraining.getCertificates.")
			}
		}
	}












	/**
	 * Checks if the provided file corresponds to a Classification Training Data
	 * File. Throws an error if it is not.
	 * @param certificate 
	 * @returns void
	 */
	private validateTrainingCertificate(certificate: IRegressionTrainingCertificate): void {
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
		if (typeof certificate.test_evaluation != "number") {
			console.log(certificate.test_evaluation);
			throw new Error(`The provided test_evaluation is invalid.`);
		}
		if (!certificate.regression_evaluation || typeof certificate.regression_evaluation != "object") {
			console.log(certificate.regression_evaluation);
			throw new Error(`The provided regression_evaluation is invalid.`);
		}
		if (!certificate.regression_evaluation || typeof certificate.regression_evaluation != "object") {
			console.log(certificate.regression_evaluation);
			throw new Error(`The provided regression_evaluation is invalid.`);
		}
	}
}
