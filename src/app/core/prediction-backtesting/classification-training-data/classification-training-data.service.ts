import { Injectable } from '@angular/core';
import { 
	ITrainingDataFile,
	ITrainingDataPredictionInsights, 
	ITrainingDataPriceActionsInsight, 
	PredictionService,
	ICompressedTrainingData
} from '../../prediction';
import { FileService } from '../../file';
import { IModels, IModelTypeNames } from '../backtest'
import { IClassificationTrainingService, IDecompressedTrainingData } from './interfaces';

@Injectable({
  providedIn: 'root'
})
export class ClassificationTrainingDataService implements IClassificationTrainingService {
	// Global Helpers
	public modelIDs!: string[];
	public models!: IModels;
	public modelTypeNames!: IModelTypeNames;

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

    // Percentages that will determine if the price moved up or down after a position is opened
    public up_percent_change!: number;
    public down_percent_change!: number;

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
	 * Initializes the Training Data based on an input file change.
	 * @param event 
	 * @returns Promise<void>
	 */
	public async init(event: any): Promise<void> {
		// Retrieve the training data file
		const file: ITrainingDataFile = await this.getFile(event);

		// Populate the general data
		this.id = file.id;
		this.description = file.description;
		this.creation = file.creation;
		this.start = file.start;
		this.end = file.end;
		this.duration_minutes = file.duration_minutes;
		this.up_percent_change = file.up_percent_change;
		this.down_percent_change = file.down_percent_change;
		this.price_actions_insight = file.price_actions_insight;
		this.predictions_insight = file.predictions_insight;

		// Populate the general helpers
		this.modelIDs = [];
		this.models = {};
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
	 * Reads the json file, extracts the Training Data and validates it.
	 * An error is thrown if the validations dont pass.
	 * @param event 
	 * @returns Promise<ITrainingDataFile>
	 */
	 private async getFile(event: any): Promise<ITrainingDataFile> {
		// Retrieve the training data file
		const files: ITrainingDataFile[] = await this._file.readJSONFiles(event);

		// Make sure the file is valid
		this.validateTrainingDataFile(files[0])

		// Return the first (only) item of the list
		return files[0];
	}







	/**
	 * Given a compressed training data object, it will iterate over each column
	 * and row converting the data into a record list.
	 * @param data 
	 * @returns IDecompressedTrainingData[]
	 */
	private decompressTrainingData(data: ICompressedTrainingData): IDecompressedTrainingData[] {
		// Init the records
		let records: IDecompressedTrainingData[] = [];

		// Iterate over the rows
		for (let r = 0; r < data.rows.length; r++) {
			// Init the record
			let record: IDecompressedTrainingData = {};

			// Iterate over the columns and build the record
			for (let c = 0; c < data.columns.length; c++) { record[data.columns[c]] = data.rows[r][c] }

			// Append the record to the list
			records.push(record);
		}

		// Return the final build
		return records;
	}











	/* Misc Helpers */












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
		if (typeof file.id != "string") throw new Error(`The provided id (${file.id}) is invalid.`);
		if (typeof file.description != "string") throw new Error(`The provided description (${file.description}) is invalid.`);
		if (typeof file.creation != "number") throw new Error(`The provided creation (${file.creation}) is invalid.`);
		if (typeof file.start != "number") throw new Error(`The provided start (${file.start}) is invalid.`);
		if (typeof file.end != "number") throw new Error(`The provided end (${file.end}) is invalid.`);
		if (typeof file.duration_minutes != "number") throw new Error(`The provided duration_minutes (${file.duration_minutes}) is invalid.`);
		if (typeof file.up_percent_change != "number") throw new Error(`The provided up_percent_change (${file.up_percent_change}) is invalid.`);
		if (typeof file.down_percent_change != "number") throw new Error(`The provided down_percent_change (${file.down_percent_change}) is invalid.`);
		if (!Array.isArray(file.models)) throw new Error(`The provided models are invalid.`);
		if (!file.price_actions_insight || typeof file.price_actions_insight != "object") throw new Error("The provided price_actions_insight is not an object.")
		if (!file.predictions_insight || typeof file.predictions_insight != "object") throw new Error("The provided predictions_insight is not an object.")
		if (!file.training_data || typeof file.training_data != "object") throw new Error("The provided training_data is not an object.")
	}


}
