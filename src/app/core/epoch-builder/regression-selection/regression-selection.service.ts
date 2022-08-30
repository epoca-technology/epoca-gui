import { Injectable } from '@angular/core';
import { FileService } from '../../file';
import { PredictionService } from '../../prediction';
import { EpochBuilderMetadataService, IEpochBuilderMetadataService } from '../epoch-builder-metadata';
import { IRegressionSelectionFile, ISelectedRegression, IModelType } from '../_interfaces';
import { IRegressionSelectionService, IRegressionSelectionMetadata } from './interfaces';

@Injectable({
  providedIn: 'root'
})
export class RegressionSelectionService implements IRegressionSelectionService {
	// The identifier of the selection
	public id!: string;

	// The creation date
	public creation!: number;

	// The successful price change mean
	public price_change_mean!: number;

	// The list of selected regressions
	public selection!: ISelectedRegression[];

	// The id of the regressions within the selection
	public regressionIDs!: string[];

	// Object containing all model types by ID
	public modelTypes!: {[modelID: string]: IModelType};

	// Metadata
	public md!: IRegressionSelectionMetadata;



	constructor(
		private _file: FileService,
		private _prediction: PredictionService
	) { }




	/**
	 * Initializes the Regression Selection based on an input file change or
	 * an ID that is stored in the db.
	 * @param event
	 * @returns Promise<void>
	 */
	 public async init(event: any|string): Promise<void> {
		// Load the file
		const regressionSelectionFile: IRegressionSelectionFile = await this.getFile(event);

		// Init values
		this.id = regressionSelectionFile.id;
		this.creation = regressionSelectionFile.creation;
		this.price_change_mean = regressionSelectionFile.price_change_mean;
		this.selection = regressionSelectionFile.selection;
		this.regressionIDs = [];
		this.modelTypes = {};
		const metadata: IEpochBuilderMetadataService = new EpochBuilderMetadataService();
		let totalPredictions: number;

		// Iterate over each certificate and populate the metadata
		for (let i = 0; i < this.selection.length; i++) {
			// Add the ID to the list
			this.regressionIDs.push(this.selection[i].id);

			// Add the model type
			this.modelTypes[this.selection[i].id] = this._prediction.getModelTypeName(this.selection[i].model);

			// Update the Discovery Accuracy
			metadata.update("discoveryIncreaseAccuracy", i, this.selection[i].id, this.selection[i].discovery.increase_accuracy);
			metadata.update("discoveryDecreaseAccuracy", i, this.selection[i].id, this.selection[i].discovery.decrease_accuracy);
			metadata.update("discoveryAccuracy", i, this.selection[i].id, this.selection[i].discovery.accuracy);

			// Update the Discovery Prediction Counts
			totalPredictions = this.selection[i].discovery.increase_num + this.selection[i].discovery.decrease_num;
			metadata.update("discoveryNeutralPredictions", i, this.selection[i].id, this.selection[i].discovery.neutral_num);
			metadata.update("discoveryIncreasePredictions", i, this.selection[i].id, this.selection[i].discovery.increase_num);
			metadata.update("discoveryDecreasePredictions", i, this.selection[i].id, this.selection[i].discovery.decrease_num);
			metadata.update("discoveryPredictions", i, this.selection[i].id, totalPredictions);

			// Update the Discovery Successful Predictions
			metadata.update("discoverySuccessfulIncreaseMean", i, this.selection[i].id, this.selection[i].discovery.increase_successful_mean);
			metadata.update("discoverySuccessfulDecreaseMean", i, this.selection[i].id, this.selection[i].discovery.decrease_successful_mean);
			metadata.update("discoverySuccessfulMean", i, this.selection[i].id, this.selection[i].discovery.successful_mean);

			// Update the Discovery Prediction Means
			metadata.update("discoveryIncreaseMean", i, this.selection[i].id, this.selection[i].discovery.increase_mean);
			metadata.update("discoveryDecreaseMean", i, this.selection[i].id, this.selection[i].discovery.decrease_mean);
		}

		// Finally, populate the metadata results
		this.md = <IRegressionSelectionMetadata>metadata.getMetadata();
	}




	/**
	 * Resets all the data in the service and releases de memory.
	 */
	public reset(): void {
		this.id = "";
		this.creation = 0;
		this.price_change_mean = 0;
		this.selection = [];
		this.regressionIDs = [];
		this.modelTypes = {};
		this.md = <IRegressionSelectionMetadata>{};
	}







	/**
	 * If the provided event is a string, it will download the regression selection
	 * from the database. Otherwise, it will load and parse the json file.
	 * An error is thrown if the validations dont pass or if no final results are
	 * found after the filtering.
	 * @param event 
	 * @returns Promise<IRegressionSelectionFile>
	 */
	 private async getFile(event: any|string): Promise<IRegressionSelectionFile> {
		// If it is a string, retrieve the certificate from the db
		if (typeof event == "string") {
			throw new Error("Regression Selection Init from db has not been implemented yet.")
		}

		// Extract the data from a JSON File
		else {
			// Retrieve the regression selection file
			const files: IRegressionSelectionFile[] = await this._file.readJSONFiles(event);

			// Only 1 file can be provided to the regression selection
			if (files.length == 1) {
				// Make sure the file is valid
				this.validateRegressionSelectionFile(files[0]);

				// Return the first (only) item of the list
				return files[0];
			} else {
				throw new Error("The Regression Selection input must be 1 file.");
			}
		}
	}





	/**
	 * Checks if the provided file corresponds to a Regression Selection
	 * File. Throws an error if it is not.
	 * @param file 
	 * @returns void
	 */
	 private validateRegressionSelectionFile(file: IRegressionSelectionFile): void {
		// Make sure it is an object
		if (!file || typeof file != "object") throw new Error("The provided file is not an object.");

		// Validate general values
		if (typeof file.id != "string") throw new Error(`The provided id (${file.id}) is invalid.`);
		if (typeof file.creation != "number") throw new Error(`The provided creation (${file.creation}) is invalid.`);
		if (typeof file.price_change_mean != "number") throw new Error(`The provided price_change_mean (${file.price_change_mean}) is invalid.`);
		if (!Array.isArray(file.selection)) throw new Error(`The provided selection is invalid.`);
	}
}
