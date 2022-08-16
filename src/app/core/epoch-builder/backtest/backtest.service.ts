import { Injectable } from '@angular/core';
import { UtilsService } from '../../utils';
import { FileService } from '../../file';
import { IBacktestService, IModels, IBacktests, IPerformances, IBacktestMetadata } from './interfaces';

@Injectable({
  providedIn: 'root'
})
export class BacktestService implements IBacktestService {
	// List of model ids
	public modelIDs: string[] = [];

	// Models object organized by ID
	public models: IModels = {};

	// Backtest results organized by model ID
	public backtests: IBacktests = {};

	// Performances ordered by model ID
	public performances: IPerformances = {};

	// Backtests metadata
	public md: IBacktestMetadata = <IBacktestMetadata>{};


  	constructor(
		private _utils: UtilsService,
		private _file: FileService,
	) { }
}
