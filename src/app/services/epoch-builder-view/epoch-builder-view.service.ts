import { Injectable } from '@angular/core';
import { ChartService } from '../chart';
import { IEpochBuilderViewService, IEBEPointsView } from './interfaces';

@Injectable({
  providedIn: 'root'
})
export class EpochBuilderViewService implements IEpochBuilderViewService{

  	constructor(
		private _chart: ChartService
	) { }





	public buildEBEPointsView(): any {
		
	}
}
