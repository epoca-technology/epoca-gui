import { Injectable } from '@angular/core';
import { 
	ITrainingDataFile,
	ITrainingDataPredictionInsights, 
	ITrainingDataPriceActionsInsight, 
	PredictionService,
	ICompressedTrainingData,
	IModel
} from '../../prediction';
import { FileService } from '../../file';
import { IModels, IModelTypeNames } from '../backtest'
import { IClassificationTrainingDataService } from './interfaces';

@Injectable({
  providedIn: 'root'
})
export class ClassificationTrainingDataService implements IClassificationTrainingDataService {
	// Global Helpers
	public modelIDs!: string[];
	public models!: IModels;
	public modelList!: IModel[];
	public modelTypeNames!: IModelTypeNames;

	// The ID of the Regression Selection that was used to pick the Regression Models
	public regression_selection_id!: string;

    // Universally Unique Identifier (uuid4)
    public id!: string;

    // The description of the Training Data that will be generated.
    public description!: string;

    // The timestamp in which the Training Data was generated
    public creation!: number;

    // Start and end time
    public start!: number;  // First candlestick's ot
    public end!: number;    // Last candlestick's ct

    // The number of minutes that took to generate the training data
    public duration_minutes!: number;

	// Training Data Steps
	public steps!: number;

    // Percentages that will determine if the price moved up or down after a position is opened
    public up_percent_change!: number;
    public down_percent_change!: number;

    // Optional Technical Analysis Features
    public include_rsi!: boolean;   	// Momentum
    public include_stoch!: boolean;   	// Momentum
    public include_aroon!: boolean; 	// Trend
    public include_stc!: boolean; 		// Trend
    public include_mfi!: boolean; 		// Volume

    // The total number of features that will be used by the model to predict
    public features_num!: number;

    // Price Actions Insight - The up and down counts
    public price_actions_insight!: ITrainingDataPriceActionsInsight;

    // Prediction Insight 
    // Position type count for each single model in this format:
    // {[modelID: str]: ITrainingDataPredictionInsight}
    public predictions_insight!: ITrainingDataPredictionInsights;

    // Training Data
    // The training data generated in a decompressed format.
	public training_data!: ICompressedTrainingData;

  	constructor(
		private _file: FileService,
		private _prediction: PredictionService
	) { }





	/**
	 * Initializes the Training Data based on an input file change or
	 * an ID that is stored in the db.
	 * @param event 
	 * @returns Promise<void>
	 */
	public async init(event: any|string): Promise<void> {
		// Retrieve the training data file
		const file: ITrainingDataFile = await this.getFile(event);

		// Populate the general data
		this.regression_selection_id = file.regression_selection_id;
		this.id = file.id;
		this.description = file.description;
		this.creation = file.creation;
		this.start = file.start;
		this.end = file.end;
		this.duration_minutes = file.duration_minutes;
		this.steps = file.steps;
		this.up_percent_change = file.up_percent_change;
		this.down_percent_change = file.down_percent_change;
		this.include_rsi = file.include_rsi;
		this.include_stoch = file.include_stoch;
		this.include_aroon = file.include_aroon;
		this.include_stc = file.include_stc;
		this.include_mfi = file.include_mfi;
		this.features_num = file.features_num;
		this.price_actions_insight = file.price_actions_insight;
		this.predictions_insight = file.predictions_insight;

		// Populate the general helpers
		this.modelIDs = [];
		this.models = {};
		this.modelList = file.models;
		this.modelTypeNames = {};
		for (let m of file.models) {
			this.modelIDs.push(m.id);
			this.models[m.id] = m;
			this.modelTypeNames[m.id] = this._prediction.getModelTypeName(m);
		}

		// Decompress the training data
		this.training_data = file.training_data;
	}








	/**
	 * If the provided event is a string, it will download the training data file
	 * from the Database. Otherwise, it reads the json file, extracts the 
	 * Training Data and validates it.
	 * An error is thrown if the validations dont pass.
	 * @param event 
	 * @returns Promise<ITrainingDataFile>
	 */
	 private async getFile(event: any|string): Promise<ITrainingDataFile> {
		// If it is a string, retrieve the file from the db
		if (typeof event == "string") {
			throw new Error("Training Data Init from db not implemented yet.")
		}

		// Extract the data from a JSON File
		else {
			// Retrieve the training data file
			const files: ITrainingDataFile[] = await this._file.readJSONFiles(event);

			// Make sure the file is valid
			this.validateTrainingDataFile(files[0])

			// Return the first (only) item of the list
			return files[0];
		}
	}












	/**
	 * Checks if the provided file corresponds to a Classification Training Data
	 * File. Throws an error if it is not.
	 * @param file 
	 * @returns void
	 */
	private validateTrainingDataFile(file: ITrainingDataFile): void {
		// Make sure it is an object
		if (!file || typeof file != "object") throw new Error("The provided file is not an object.");

		// Validate general values
		if (typeof file.regression_selection_id != "string") throw new Error(`The provided regression_selection_id (${file.regression_selection_id}) is invalid.`);
		if (typeof file.id != "string") throw new Error(`The provided id (${file.id}) is invalid.`);
		if (typeof file.description != "string") throw new Error(`The provided description (${file.description}) is invalid.`);
		if (typeof file.creation != "number") throw new Error(`The provided creation (${file.creation}) is invalid.`);
		if (typeof file.start != "number") throw new Error(`The provided start (${file.start}) is invalid.`);
		if (typeof file.end != "number") throw new Error(`The provided end (${file.end}) is invalid.`);
		if (typeof file.duration_minutes != "number") throw new Error(`The provided duration_minutes (${file.duration_minutes}) is invalid.`);
		if (typeof file.steps != "number") throw new Error(`The provided steps (${file.steps}) are invalid.`);
		if (typeof file.up_percent_change != "number") throw new Error(`The provided up_percent_change (${file.up_percent_change}) is invalid.`);
		if (typeof file.down_percent_change != "number") throw new Error(`The provided down_percent_change (${file.down_percent_change}) is invalid.`);
		if (!Array.isArray(file.models)) throw new Error(`The provided models are invalid.`);
		if (typeof file.include_rsi != "boolean") throw new Error(`The provided include_rsi (${file.include_rsi}) is invalid.`);
		if (typeof file.include_stoch != "boolean") throw new Error(`The provided include_stoch (${file.include_stoch}) is invalid.`);
		if (typeof file.include_aroon != "boolean") throw new Error(`The provided include_aroon (${file.include_aroon}) is invalid.`);
		if (typeof file.include_stc != "boolean") throw new Error(`The provided include_stc (${file.include_stc}) is invalid.`);
		if (typeof file.include_mfi != "boolean") throw new Error(`The provided include_mfi (${file.include_mfi}) is invalid.`);
		if (typeof file.features_num != "number") throw new Error(`The provided features_num (${file.features_num}) is invalid.`);
		if (!file.price_actions_insight || typeof file.price_actions_insight != "object") throw new Error("The provided price_actions_insight is not an object.")
		if (!file.predictions_insight || typeof file.predictions_insight != "object") throw new Error("The provided predictions_insight is not an object.")
		if (!file.training_data || typeof file.training_data != "object") throw new Error("The provided training_data is not an object.")
	}
}
