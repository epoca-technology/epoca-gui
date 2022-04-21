import { Injectable } from '@angular/core';
import { IPredictionBacktestingService, IBacktestResult, IModels, IBacktests, IPerformances } from './interfaces';

@Injectable({
  providedIn: 'root'
})
export class PredictionBacktestingService implements IPredictionBacktestingService {
	// Properties
	public modelIDs: string[] = [];
	public models: IModels = {};
	public backtests: IBacktests = {};
	public performances: IPerformances = {};

	constructor() { }





	/* Initialization */




	/**
	 * Given a list of backtest files, it will retrieve the JSON data and initialize
	 * the service.
	 * @param event 
	 * @returns Promise<void>
	 */
	public async init(event: any): Promise<void> {
		// Reset the data if any
		this.resetBacktestResults();

		// Retrieve the Backtest Results List
		const results: IBacktestResult[] = await this.getResultsFromFiles(event);
		
		// Iterate over each result and initialize the data
		results.forEach(r => this.initBacktestResult(r))
	}






	/**
	 * Initializes the backtest result data required. Notice that if a model id
	 * is duplicated, it will be changed.
	 * @param res 
	 * @returns void
	 */
	private initBacktestResult(res: IBacktestResult): void {
		// Check if the ID is already in use
		let finalID: string = res.model.id;
		if (this.modelIDs.includes(finalID)) {
			finalID = this.getRandomizedDuplicateModelID(finalID);
			res.model.id = finalID;
		}

		// Populate the data
		this.modelIDs.push(finalID);
		this.models[finalID] = res.model;
		this.backtests[finalID] = res.backtest;
		this.performances[finalID] = res.performance;
	}







	/**
	 * Resets the Backtest Results data to a pristine state.
	 * @returns void
	 */
	public resetBacktestResults(): void {
		this.modelIDs = [];
		this.models = {};
		this.backtests = {};
		this.performances = {};
	}






	/**
	 * Given a list of files, it will attempt to extract the backtesting results and
	 * retrieve them.
	 * @param event 
	 * @returns Promise<IBacktestResult[]>
	 */
	private async getResultsFromFiles(event: any): Promise<IBacktestResult[]> {
		// Make sure 1 or more files have been provided
		if (!event || !event.target || !event.target.files || !event.target.files.length) {
			throw new Error('A minimum of 1 backtest file must be provided.');
		}

		// Convert the FileList into an array and iterate
		const files: Promise<IBacktestResult[]>[] = Array.from(event.target.files).map(file => {
			// Define a new file reader
			let reader = new FileReader();

			// Create a new promise
			return new Promise((resolve, reject) => {
				// Resolve the promise after reading file
				reader.onload = () => {
					// Make sure the result is a string
					if (!reader || typeof reader.result != "string") {
						console.error(reader.result);
						reject('The file reader result is not a valid string that can be parsed.');
					}

					// Resolve the parsed file
					resolve(JSON.parse(<string>reader.result))
				};

				// Read the file as a text
				reader.readAsText(<Blob>file);
			});
		});

		// Extract the parsed files
		const parsed: Array<IBacktestResult[]> = await Promise.all(files);

		// Flatten the results
		const results: IBacktestResult[] = parsed.flat();

		// Make sure that at least 1 file has been extracted
		if (!results || !results.length) {
			console.error(results)
			throw new Error('The reader could not extract any valid backtest result files.')
		}

		// Iterate over each result and make sure the properties have been provided correctly
		for (let result of results) {
			if (!result.backtest || !result.model || !result.performance) {
				console.error(result)
				throw new Error('One of the backtest results is missing one of the key properties.');
			}
		}

		// Return the final results sorted by points
		return results.sort((a, b) => (a.performance.points < b.performance.points) ? 1 : -1);
	}









	/**
	 * Generates a new ID with 6 random characters at the end of the provided
	 * id. This functionality is to be used when a duplicate model ID is found.
	 * @param id 
	 * @returns string
	 */
	private getRandomizedDuplicateModelID(id: string): string {
		// Init the result
		let result: string = '';

		// Init the characters to be used
		const characters: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
		
		// Generate 4 random characters
		for ( var i = 0; i < 6; i++ ) {
		  result += characters.charAt(Math.floor(Math.random() * characters.length));
	   	}

		// Return the modified id
	   	return id + "_" + result;
	}
}
