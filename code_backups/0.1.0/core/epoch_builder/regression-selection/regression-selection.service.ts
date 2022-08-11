import { Injectable } from '@angular/core';
import { FileService } from '../../file';
import { ICombinationResult, IRegressionSelectionFile, IModel } from '../../prediction';
import { IRegressionSelectionService } from './interfaces';

@Injectable({
  providedIn: 'root'
})
export class RegressionSelectionService implements IRegressionSelectionService {
    // Universally Unique Identifier (uuid4)
    public id!: string;
    
    // The number of models that were selected based on their points medians
    public models_limit!: number;

    // The data range covered in the backtest results
    public start!: number;
    public end!: number;

    // The number of models that were put through the selection
    public models_num!: number;

    // The list of ordered combination results 
    public results!: ICombinationResult[];

	// Helpers
	public combinations!: string[];

  	constructor(private _file: FileService) { }




	/**
	 * Initializes the Training Data based on an input file change or
	 * an ID that is stored in the db.
	 * @param event 
	 * @returns Promise<void>
	 */
	 public async init(event: any|string): Promise<void> {
		// Retrieve the regression selection file
		const file: IRegressionSelectionFile = await this.getFile(event);

		// Populate the general data
		this.id = file.id;
		this.models_limit = file.models_limit;
		this.start = file.start;
		this.end = file.end;
		this.models_num = file.models_num;
		this.results = file.results;

		// Populate the helpers
		this.combinations = this.results.map((cr) => {return cr.combination_id});
	}








	/**
	 * Returns a model based on combination and model indexes.
	 * @param combinationIndex 
	 * @param modelIndex 
	 * @returns IModel
	 */
	public getModelFromCombinationIDAndIndex(combinationIndex: number, modelIndex: number): IModel {
		return this.results[combinationIndex].model_results[modelIndex].model;
	}








	/**
	 * If the provided event is a string, it will download the regression selection file
	 * from the Database. Otherwise, it reads the json file, extracts the 
	 * Regresion Selection and validates it.
	 * An error is thrown if the validations dont pass.
	 * @param event 
	 * @returns Promise<IRegressionSelectionFile>
	 */
	 private async getFile(event: any|string): Promise<IRegressionSelectionFile> {
		// If it is a string, retrieve the file from the db
		if (typeof event == "string") {
			throw new Error("Training Data Init from db not implemented yet.")
		}

		// Extract the data from a JSON File
		else {
			// Retrieve the regression selection file
			const files: IRegressionSelectionFile[] = await this._file.readJSONFiles(event);

			// Make sure the file is valid
			this.validateRegressionSelectionFile(files[0])

			// Return the first (only) item of the list
			return files[0];
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
		if (typeof file.models_limit != "number") throw new Error(`The provided models_limit (${file.models_limit}) is invalid.`);
		if (typeof file.start != "number") throw new Error(`The provided start (${file.start}) is invalid.`);
		if (typeof file.end != "number") throw new Error(`The provided end (${file.end}) is invalid.`);
		if (typeof file.models_num != "number") throw new Error(`The provided models_num (${file.models_num}) is invalid.`);
		if (!Array.isArray(file.results)) throw new Error(`The provided results are invalid.`);
	}
}
