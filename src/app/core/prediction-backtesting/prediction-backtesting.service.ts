import { Injectable } from '@angular/core';
import { UtilsService } from '../utils';
import { 
	IPredictionBacktestingService, 
	IBacktestResult, 
	IModels, 
	IBacktests, 
	IPerformances,
	IGeneralSectionMetadataValue,
	IPointsMetadata,
	IPointsHistoryMetadata,
	IAccuracyMetadata,
	IPositionsMetadata,
	IDurationMetadata,
} from './interfaces';

@Injectable({
  providedIn: 'root'
})
export class PredictionBacktestingService implements IPredictionBacktestingService {
	// Main Properties
	public modelIDs: string[] = [];
	public models: IModels = {};
	public backtests: IBacktests = {};
	public performances: IPerformances = {};

	// General Section Metadata
	public pointsMD: IPointsMetadata = this.getDefaultPointsMetadata();
	public pointsHistoryMD: IPointsHistoryMetadata = this.getDefaultPointsHistoryMetadata();
	public accuracyMD: IAccuracyMetadata = this.getDefaultAccuracyMetadata();
	public positionsMD: IPositionsMetadata = this.getDefaultPositionsMetadata();
	public durationMD: IDurationMetadata = this.getDefaultDurationMetadata();


	constructor(
		private _utils: UtilsService
	) { }





	/* Initialization */




	/**
	 * Given a list of backtest files, it will retrieve the JSON data and initialize
	 * the service.
	 * @param event
	 * @param limit?
	 * @returns Promise<void>
	 */
	public async init(event: any, limit?: number): Promise<void> {
		// Reset the data if any
		this.resetBacktestResults();

		// Retrieve the Backtest Results List
		let results: IBacktestResult[] = await this.getResultsFromFiles(event);

		// Check if it should limit the number of items
		if (typeof limit == "number") results = results.slice(0, limit);
		
		// Iterate over each result and initialize the data
		results.forEach(r => this.initBacktestResult(r))

		// Once everything has been loaded, populate the general sections' metadata
		this.initGeneralSectionsMetadata();
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

		// Populate the main properties
		this.modelIDs.push(finalID);
		this.models[finalID] = res.model;
		this.backtests[finalID] = res.backtest;
		this.performances[finalID] = res.performance;
	}







	private initGeneralSectionsMetadata(): void {
		// Init the points accumulated metadata
		this.pointsMD = {
			min: {id:this.modelIDs[this.modelIDs.length - 1],value: this.performances[this.modelIDs[this.modelIDs.length - 1]].points},
			max: {id: this.modelIDs[0],value: this.performances[this.modelIDs[0]].points}
		};

		/* Initialize Data */

		// Points Hist
		let pointsHistMax: IGeneralSectionMetadataValue = {id: this.modelIDs[0], value: this._utils.getMax(this.performances[this.modelIDs[0]].points_hist)};
		let pointsHistMin: IGeneralSectionMetadataValue = {id: this.modelIDs[0], value: this._utils.getMin(this.performances[this.modelIDs[0]].points_hist)};

		// Acurracy
		let longAccMax: IGeneralSectionMetadataValue = {id: this.modelIDs[0], value: this.performances[this.modelIDs[0]].long_acc};
		let longAccMin: IGeneralSectionMetadataValue = {id: this.modelIDs[0], value: this.performances[this.modelIDs[0]].long_acc};
		let shortAccMax: IGeneralSectionMetadataValue = {id: this.modelIDs[0], value: this.performances[this.modelIDs[0]].short_acc};
		let shortAccMin: IGeneralSectionMetadataValue = {id: this.modelIDs[0], value: this.performances[this.modelIDs[0]].short_acc};
		let accMax: IGeneralSectionMetadataValue = {id: this.modelIDs[0], value: this.performances[this.modelIDs[0]].general_acc};
		let accMin: IGeneralSectionMetadataValue = {id: this.modelIDs[0], value: this.performances[this.modelIDs[0]].general_acc};

		// Positions
		let longMax: IGeneralSectionMetadataValue = {id: this.modelIDs[0], value: this.performances[this.modelIDs[0]].long_num};
		let longMin: IGeneralSectionMetadataValue = {id: this.modelIDs[0], value: this.performances[this.modelIDs[0]].long_num};
		let shortMax: IGeneralSectionMetadataValue = {id: this.modelIDs[0], value: this.performances[this.modelIDs[0]].short_num};
		let shortMin: IGeneralSectionMetadataValue = {id: this.modelIDs[0], value: this.performances[this.modelIDs[0]].short_num};
		let genMax: IGeneralSectionMetadataValue = {id: this.modelIDs[0], value: this.performances[this.modelIDs[0]].positions.length};
		let genMin: IGeneralSectionMetadataValue = {id: this.modelIDs[0], value: this.performances[this.modelIDs[0]].positions.length};

		// Duration
		let durationMax: IGeneralSectionMetadataValue = {id: this.modelIDs[0], value: this.backtests[this.modelIDs[0]].model_duration};
		let durationMin: IGeneralSectionMetadataValue = {id: this.modelIDs[0], value: this.backtests[this.modelIDs[0]].model_duration};

		// Iterate over each model and build all the metadata
		for (let i = 1; i < this.modelIDs.length; i++) {
			/* Build the Metadata */

			// Points Hist Data
			const phMax: number = this._utils.getMax(this.performances[this.modelIDs[i]].points_hist);
			const phMin: number = this._utils.getMin(this.performances[this.modelIDs[i]].points_hist);
			if (phMax > pointsHistMax.value) { pointsHistMax = { id: this.modelIDs[i], value: phMax } }
			if (phMin < pointsHistMin.value) { pointsHistMin = { id: this.modelIDs[i], value: phMin } }

			// Accuracy
			if (this.performances[this.modelIDs[i]].long_acc > longAccMax.value) { longAccMax = { id: this.modelIDs[i], value: this.performances[this.modelIDs[i]].long_acc }}
			if (this.performances[this.modelIDs[i]].long_acc < longAccMin.value) { longAccMin = { id: this.modelIDs[i], value: this.performances[this.modelIDs[i]].long_acc }}
			if (this.performances[this.modelIDs[i]].short_acc > shortAccMax.value) { shortAccMax = { id: this.modelIDs[i], value: this.performances[this.modelIDs[i]].short_acc }}
			if (this.performances[this.modelIDs[i]].short_acc < shortAccMin.value) { shortAccMin = { id: this.modelIDs[i], value: this.performances[this.modelIDs[i]].short_acc }}
			if (this.performances[this.modelIDs[i]].general_acc > accMax.value) { accMax = { id: this.modelIDs[i], value: this.performances[this.modelIDs[i]].general_acc }}
			if (this.performances[this.modelIDs[i]].general_acc < accMin.value) { accMin = { id: this.modelIDs[i], value: this.performances[this.modelIDs[i]].general_acc }}

			// Positions
			if (this.performances[this.modelIDs[i]].long_num > longMax.value) { longMax = { id: this.modelIDs[i], value: this.performances[this.modelIDs[i]].long_num }}
			if (this.performances[this.modelIDs[i]].long_num < longMin.value) { longMin = { id: this.modelIDs[i], value: this.performances[this.modelIDs[i]].long_num }}
			if (this.performances[this.modelIDs[i]].short_num > shortMax.value) { shortMax = { id: this.modelIDs[i], value: this.performances[this.modelIDs[i]].short_num }}
			if (this.performances[this.modelIDs[i]].short_num < shortMin.value) { shortMin = { id: this.modelIDs[i], value: this.performances[this.modelIDs[i]].short_num }}
			if (this.performances[this.modelIDs[i]].positions.length > genMax.value) { genMax = { id: this.modelIDs[i], value: this.performances[this.modelIDs[i]].positions.length }}
			if (this.performances[this.modelIDs[i]].positions.length < genMin.value) { genMin = { id: this.modelIDs[i], value: this.performances[this.modelIDs[i]].positions.length }}

			// Durations
			if (this.backtests[this.modelIDs[i]].model_duration > durationMax.value) { durationMax = { id: this.modelIDs[i], value: this.backtests[this.modelIDs[i]].model_duration } }
			if (this.backtests[this.modelIDs[i]].model_duration < durationMin.value) { durationMin = { id: this.modelIDs[i], value: this.backtests[this.modelIDs[i]].model_duration } }
		}

		// Points Hist Results
		this.pointsHistoryMD = { max: pointsHistMax, min: pointsHistMin};
		
		// Accuracy Results
		this.accuracyMD = {long:{max:longAccMax,min:longAccMin},short:{max:shortAccMax,min:shortAccMin},general:{max:accMax,min:accMin}}

		// Positions Results
		this.positionsMD = {long:{max:longMax,min:longMin},short:{max:shortMax,min:shortMin},general:{max:genMax,min:genMin}}

		// Duration Results
		this.durationMD = { max: durationMax, min: durationMin};
	}











	/* Resetter */





	/**
	 * Resets the Backtest Results data to a pristine state.
	 * @returns void
	 */
	public resetBacktestResults(): void {
		this.modelIDs = [];
		this.models = {};
		this.backtests = {};
		this.performances = {};
		this.pointsMD = this.getDefaultPointsMetadata();
		this.pointsHistoryMD = this.getDefaultPointsHistoryMetadata();
		this.accuracyMD = this.getDefaultAccuracyMetadata();
		this.positionsMD = this.getDefaultPositionsMetadata();
		this.durationMD = this.getDefaultDurationMetadata();
	}











	/* Init Helpers */





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









	/* Misc Helpers */










	/* Metadata Defaults Helpers */


	private getDefaultMDValue(): IGeneralSectionMetadataValue {return {id: '', value: 0} }
	private getDefaultPointsMetadata(): IPointsMetadata { 
		return { min: this.getDefaultMDValue(), max: this.getDefaultMDValue()}
	}
	private getDefaultPointsHistoryMetadata(): IPointsHistoryMetadata { 
		return { min: this.getDefaultMDValue(), max: this.getDefaultMDValue()}
	}
	private getDefaultAccuracyMetadata(): IAccuracyMetadata { 
		return { 
			long: {min: this.getDefaultMDValue(), max: this.getDefaultMDValue()}, 
			short: {min: this.getDefaultMDValue(), max: this.getDefaultMDValue()}, 
			general: {min: this.getDefaultMDValue(), max: this.getDefaultMDValue()}
		}
	}
	private getDefaultPositionsMetadata(): IPositionsMetadata { 
		return { 
			long: {min: this.getDefaultMDValue(), max: this.getDefaultMDValue()}, 
			short: {min: this.getDefaultMDValue(), max: this.getDefaultMDValue()}, 
			general: {min: this.getDefaultMDValue(), max: this.getDefaultMDValue()}
		}
	}
	private getDefaultDurationMetadata(): IDurationMetadata { 
		return { min: this.getDefaultMDValue(), max: this.getDefaultMDValue()}
	}
}
