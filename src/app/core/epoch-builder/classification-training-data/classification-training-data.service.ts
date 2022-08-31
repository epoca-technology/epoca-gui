import { Injectable } from '@angular/core';
import { FileService } from '../../file';
import { IModel, ITrainingDataDatasetSummary, ICompressedTrainingData, ITrainingDataFile } from '../_interfaces';
import { IClassificationTrainingDataService } from './interfaces';

@Injectable({
  providedIn: 'root'
})
export class ClassificationTrainingDataService implements IClassificationTrainingDataService {
	// Training Data Identifier
	public id!: string;

	// Regression Selection Identifier
	public regressionSelectionID!: string;

	// Info regarding the training data
	public description!: string;

	// The timestamps in which the Training Data process started and ended
	public creationStart!: number;
	public creationEnd!: number;

	// The timestamps of the range covered by the data
	public start!: number;
	public end!: number;

	// Candlestick Steps
	public steps!: number;

	// Percentage that will determine if the price moved up or down after a position is opened
	public priceChangeRequirement!: number;

	// List of RegressionModels
	public regressions!: IModel[];

	// Optional Technical Analysis Features
	public includeRSI!: boolean;
	public includeAROON!: boolean;

	// The total number of features that will be used by the model to predict
	public featuresNum!: number;

	// The real price outcomes when generating the training data
	public increaseOutcomeNum!: number;
	public decreaseOutcomeNum!: number;

	// Summary of the dataset extracted directly from the DataFrame
	public datasetSummary!: ITrainingDataDatasetSummary;

	// The training data generated in a compressed format.
	public trainingData!: ICompressedTrainingData;

	// Feature & Label column helpers
	public trainingDataFeatures!: string[];
	public trainingDataFeaturesAndLabel!: string[];


	constructor(private _file: FileService) { }





	/**
	 * Initializes the Regression Selection based on an input file change or
	 * an ID that is stored in the db.
	 * @param event
	 * @returns Promise<void>
	 */
	 public async init(event: any|string): Promise<void> {
		// Load the file
		const file: ITrainingDataFile = await this.getFile(event);

		// Init values
		this.id = file.id;
		this.regressionSelectionID = file.regression_selection_id;
		this.description = file.description;
		this.creationStart = file.creation_start;
		this.creationEnd = file.creation_end;
		this.start = file.start;
		this.end = file.end;
		this.steps = file.steps;
		this.priceChangeRequirement = file.price_change_requirement;
		this.regressions = file.regressions;
		this.includeRSI = file.include_rsi;
		this.includeAROON = file.include_aroon;
		this.featuresNum = file.features_num;
		this.increaseOutcomeNum = file.increase_outcome_num;
		this.decreaseOutcomeNum = file.decrease_outcome_num;
		this.datasetSummary = file.dataset_summary;
		this.trainingData = file.training_data;

		// Init features & labels helpers
		this.trainingDataFeatures = this.trainingData.columns.filter((column) => { return column != "up" && column != "down" });
		this.trainingDataFeaturesAndLabel = this.trainingDataFeatures.slice();
		this.trainingDataFeaturesAndLabel.push("label");
	}




	/**
	 * Resets all the data in the service and releases de memory.
	 */
	 public reset(): void {
		this.id = "";
		this.regressionSelectionID = "";
		this.description = "";
		this.creationStart = 0;
		this.creationEnd = 0;
		this.start = 0;
		this.end = 0;
		this.steps = 0;
		this.priceChangeRequirement = 0;
		this.regressions = [];
		this.includeRSI = false;
		this.includeAROON = false;
		this.featuresNum = 0;
		this.increaseOutcomeNum = 0;
		this.decreaseOutcomeNum = 0;
		this.datasetSummary = {};
		this.trainingData = <ICompressedTrainingData>{};
		this.trainingDataFeatures = []
		this.trainingDataFeaturesAndLabel = []
	}





	/**
	 * If the provided event is a string, it will download the training data
	 * from the database. Otherwise, it will load and parse the json file.
	 * An error is thrown if the validations dont pass or if no final results are
	 * found after the filtering.
	 * @param event 
	 * @returns Promise<ITrainingDataFile>
	 */
	 private async getFile(event: any|string): Promise<ITrainingDataFile> {
		// If it is a string, retrieve the data from the db
		if (typeof event == "string") {
			throw new Error("Training Data Init from db has not been implemented yet.")
		}

		// Extract the data from a JSON File
		else {
			// Retrieve the regression selection file
			const files: ITrainingDataFile[] = await this._file.readJSONFiles(event);

			// Only 1 file can be provided to the regression selection
			if (files.length == 1) {
				// Make sure the file is valid
				this.validateTrainingDataFile(files[0]);

				// Return the first (only) item of the list
				return files[0];
			} else {
				throw new Error("The Training Data input must be 1 file.");
			}
		}
	}





	/**
	 * Checks if the provided file corresponds to a Training Data
	 * File. Throws an error if it is not.
	 * @param file 
	 * @returns void
	 */
	 private validateTrainingDataFile(file: ITrainingDataFile): void {
		// Make sure it is an object
		if (!file || typeof file != "object") throw new Error("The provided file is not an object.");

		// Validate general values
		if (typeof file.id != "string") throw new Error(`The provided id (${file.id}) is invalid.`);
		if (typeof file.regression_selection_id != "string") throw new Error(`The provided regression_selection_id (${file.regression_selection_id}) is invalid.`);
		if (typeof file.description != "string") throw new Error(`The provided description (${file.description}) is invalid.`);
		if (typeof file.creation_start != "number") throw new Error(`The provided creation_start (${file.creation_start}) is invalid.`);
		if (typeof file.creation_end != "number") throw new Error(`The provided creation_end (${file.creation_end}) is invalid.`);
		if (typeof file.start != "number") throw new Error(`The provided start (${file.start}) is invalid.`);
		if (typeof file.end != "number") throw new Error(`The provided end (${file.end}) is invalid.`);
		if (typeof file.steps != "number") throw new Error(`The provided steps (${file.steps}) is invalid.`);
		if (typeof file.price_change_requirement != "number") throw new Error(`The provided price_change_requirement (${file.price_change_requirement}) is invalid.`);
		if (!Array.isArray(file.regressions)) {
			console.log(file.regressions);
			throw new Error(`The provided regressions is invalid.`);
		}
		if (typeof file.include_rsi != "boolean") throw new Error(`The provided include_rsi (${file.include_rsi}) is invalid.`);
		if (typeof file.include_aroon != "boolean") throw new Error(`The provided include_aroon (${file.include_aroon}) is invalid.`);
		if (typeof file.features_num != "number") throw new Error(`The provided features_num (${file.features_num}) is invalid.`);
		if (typeof file.increase_outcome_num != "number") throw new Error(`The provided increase_outcome_num (${file.increase_outcome_num}) is invalid.`);
		if (typeof file.decrease_outcome_num != "number") throw new Error(`The provided decrease_outcome_num (${file.decrease_outcome_num}) is invalid.`);
		if (!file.dataset_summary) {
			console.log(file.dataset_summary);
			throw new Error(`The provided dataset_summary is invalid.`);
		}		
		if (!file.training_data) {
			console.log(file.training_data);
			throw new Error(`The provided training_data is invalid.`);
		}
	}
}
