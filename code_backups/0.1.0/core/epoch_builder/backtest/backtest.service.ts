import { Injectable } from '@angular/core';
import { PredictionService, IBacktestResult } from '../../prediction';
import { FileService } from '../../file';
import { UtilsService } from '../../utils';
import { 
	IBacktestService, 
	IModels, 
	IBacktests, 
	IPerformances,
	IGeneralSectionMetadataValue,
	IPointsMetadata,
	IPointsHistoryMetadata,
	IAccuracyMetadata,
	IPositionsMetadata,
	IModelTypeNames,
	IBacktestOrder
} from './interfaces';

@Injectable({
  providedIn: 'root'
})
export class BacktestService implements IBacktestService {
	// Main Properties
	public modelIDs: string[] = [];
	public models: IModels = {};
	public modelTypeNames: IModelTypeNames = {};
	public backtests: IBacktests = {};
	public performances: IPerformances = {};

	// General Section Metadata
	public pointsMD: IPointsMetadata = this.getDefaultPointsMetadata();
	public pointsHistoryMD: IPointsHistoryMetadata = this.getDefaultPointsHistoryMetadata();
	public pointsMedianMD: IPointsHistoryMetadata = this.getDefaultPointsMedianMetadata();
	public accuracyMD: IAccuracyMetadata = this.getDefaultAccuracyMetadata();
	public positionsMD: IPositionsMetadata = this.getDefaultPositionsMetadata();


	constructor(
		private _utils: UtilsService,
		private _file: FileService,
		private _prediction: PredictionService
	) { }





	/* Initialization */




	/**
	 * Given a list of backtest files, it will retrieve the JSON data and initialize
	 * the service.
	 * @param event
	 * @param order
	 * @param limit?
	 * @returns Promise<void>
	 */
	public async init(event: any, order: IBacktestOrder, limit?: number): Promise<void> {
		// Reset the data if any
		this.resetBacktestResults();

		// Retrieve the Backtest Results List
		let results: IBacktestResult[] = await this.getResultsFromFiles(event, order);

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
		this.modelTypeNames[finalID] = this._prediction.getModelTypeName(res.model);
		this.backtests[finalID] = res.backtest;
		this.performances[finalID] = res.performance;
	}







	private initGeneralSectionsMetadata(): void {
		// Points
		let pointsMax: IGeneralSectionMetadataValue = {id: this.modelIDs[0], value: this.performances[this.modelIDs[0]].points};
		let pointsMin: IGeneralSectionMetadataValue = {id: this.modelIDs[0], value: this.performances[this.modelIDs[0]].points};

		// Points Hist
		let pointsHistMax: IGeneralSectionMetadataValue = {id: this.modelIDs[0], value: this._utils.getMax(this.performances[this.modelIDs[0]].points_hist)};
		let pointsHistMin: IGeneralSectionMetadataValue = {id: this.modelIDs[0], value: this._utils.getMin(this.performances[this.modelIDs[0]].points_hist)};

		// Points Median
		let pointsMedianMax: IGeneralSectionMetadataValue = {id: this.modelIDs[0], value: this.performances[this.modelIDs[0]].points_median};
		let pointsMedianMin: IGeneralSectionMetadataValue = {id: this.modelIDs[0], value: this.performances[this.modelIDs[0]].points_median};

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

		// Iterate over each model and build all the metadata
		for (let i = 1; i < this.modelIDs.length; i++) {
			// Points
			if (this.performances[this.modelIDs[i]].points > pointsMax.value) { pointsMax = { id: this.modelIDs[i], value: this.performances[this.modelIDs[i]].points } }
			if (this.performances[this.modelIDs[i]].points < pointsMin.value) { pointsMin = { id: this.modelIDs[i], value: this.performances[this.modelIDs[i]].points } }

			// Points Hist Data
			const phMax: number = this._utils.getMax(this.performances[this.modelIDs[i]].points_hist);
			const phMin: number = this._utils.getMin(this.performances[this.modelIDs[i]].points_hist);
			if (phMax > pointsHistMax.value) { pointsHistMax = { id: this.modelIDs[i], value: phMax } }
			if (phMin < pointsHistMin.value) { pointsHistMin = { id: this.modelIDs[i], value: phMin } }

			// Points Median
			if (this.performances[this.modelIDs[i]].points_median > pointsMedianMax.value) { pointsMedianMax = { id: this.modelIDs[i], value: this.performances[this.modelIDs[i]].points_median } }
			if (this.performances[this.modelIDs[i]].points_median < pointsMedianMin.value) { pointsMedianMin = { id: this.modelIDs[i], value: this.performances[this.modelIDs[i]].points_median } }

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
		}

		// Points
		this.pointsMD = { max: pointsMax, min: pointsMin};

		// Points Hist Results
		this.pointsHistoryMD = { max: pointsHistMax, min: pointsHistMin};

		// Points Median
		this.pointsMedianMD = { max: pointsMedianMax, min: pointsMedianMin};
		
		// Accuracy Results
		this.accuracyMD = {long:{max:longAccMax,min:longAccMin},short:{max:shortAccMax,min:shortAccMin},general:{max:accMax,min:accMin}}

		// Positions Results
		this.positionsMD = {long:{max:longMax,min:longMin},short:{max:shortMax,min:shortMin},general:{max:genMax,min:genMin}}
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
		this.pointsMedianMD = this.getDefaultPointsMedianMetadata();
		this.accuracyMD = this.getDefaultAccuracyMetadata();
		this.positionsMD = this.getDefaultPositionsMetadata();
	}











	/* Init Helpers */





	/**
	 * Given a list of files, it will attempt to extract the backtesting results and
	 * retrieve them.
	 * @param event 
	 * @param order 
	 * @returns Promise<IBacktestResult[]>
	 */
	private async getResultsFromFiles(event: any, order: IBacktestOrder): Promise<IBacktestResult[]> {
		// Read the parsed JSON Files
		const parsed: Array<IBacktestResult[]> = await this._file.readJSONFiles(event);

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

		/* Order the Backtests accordingly */

		// Points
		if (order == "points") {
			return results.sort((a, b) => (a.performance.points < b.performance.points) ? 1 : -1);
		} 
		
		// Points Median
		else if (order == "point_medians") {
			return results.sort((a, b) => (a.performance.points_median < b.performance.points_median) ? 1 : -1);
		}

		// Accuracy
		else {
			return results.sort((a, b) => (a.performance.general_acc < b.performance.general_acc) ? 1 : -1);
		}
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
	private getDefaultPointsMedianMetadata(): IPointsHistoryMetadata { 
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
}