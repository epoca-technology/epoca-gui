import { Injectable } from '@angular/core';
import { FileService } from '../../file';
import { IClassificationTrainingCertificate } from '../../prediction';
import { IClassificationTrainingService, IEvaluation } from './interfaces';

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

  	constructor(private _file: FileService) { }







	/**
	 * Initializes the Training Certificates based on an input file change or
	 * an ID that is stored in the db.
	 * @param event
	 * @returns Promise<void>
	 */
	 public async init(event: any|string): Promise<void> {
		// Retrieve the certificates
		this.certificates = await this.getCertificates(event);

		// Build the Summary Data
		this.ids = [];
		this.epochs = [];
		this.evals = [];
		this.certificates.forEach((cert: IClassificationTrainingCertificate) => {
			// Build the ids
			this.ids.push(cert.id);
			
			// Build the number of epochs
			this.epochs.push(cert.training_history.loss.length)

			// Build the evaluations
			this.evals.push({
				loss: cert.test_evaluation[0],
				accuracy: cert.test_evaluation[1],
			})
		});
	}









	/**
	 * If the provided event is a string, it will download the training certificate
	 * from the Database. Otherwise, it reads the json file and extracts all the
	 * certificates.
	 * An error is thrown if the validations dont pass.
	 * @param event 
	 * @returns Promise<ITrainingDataFile>
	 */
	 private async getCertificates(event: any|string): Promise<IClassificationTrainingCertificate[]> {
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
			const certificates: IClassificationTrainingCertificate[] = rawCertificates.flat();

			// Make sure there is at least 1 certificate
			if (certificates.length == 0) {
				throw new Error("The Classification Training Certificates could not be extracted from the JSON Files.") 
			}

			// Make sure the extracted certificates are valid
			certificates.forEach((c) => this.validateTrainingCertificate(c))

			// Return the certificates ordered by accuracy
			return certificates.sort((a, b) => (a.test_evaluation[1] < b.test_evaluation[1]) ? 1 : -1);;
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
		if (typeof certificate.learning_rate != "number") throw new Error(`The provided learning_rate (${certificate.learning_rate}) is invalid.`);
		if (typeof certificate.optimizer != "string") throw new Error(`The provided optimizer (${certificate.optimizer}) is invalid.`);
		if (typeof certificate.loss != "string") throw new Error(`The provided loss (${certificate.loss}) is invalid.`);
		if (typeof certificate.metric != "string") throw new Error(`The provided metric (${certificate.metric}) is invalid.`);
		if (typeof certificate.shuffle_data != "boolean") throw new Error(`The provided shuffle_data (${certificate.shuffle_data}) is invalid.`);
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
		if (!certificate.classification_config || typeof certificate.classification_config != "object") {
			console.log(certificate.classification_config);
			throw new Error(`The provided classification_config is invalid.`);
		}
	}
}
