import { Injectable } from '@angular/core';
import { AppService } from '../app';
import { IModelSelectionService, ISelectedModel } from './interfaces';

@Injectable({
  providedIn: 'root'
})
export class ModelSelectionService implements IModelSelectionService {
	// Properties
	public selected: {[modelID: string]: ISelectedModel} = {};
	public selectedList: ISelectedModel[] = [];
	

  	constructor(
		private _app: AppService
	) { }






	/* Selection Management */





	/**
	 * Selects a model and stores it in memory.
	 * @param id 
	 * @param points 
	 * @returns void
	 */
	public select(id: string, points: number): void {
		// Make sure the model hasn't been selected already
		if (this.selected[id]) {
			this._app.error(`The model ${id} has already been selected.`);
			return;
		}

		// Select the model
		this.selected[id] = { id: id, points: points };

		// Broadcast the selection change event
		this.selectionChanged();
	}





	/**
	 * Unselects a given model. It does not throw an error if the model 
	 * has not been selected
	 * @param id: string
	 */
	public unselect(id: string): void {
		// Delete the model from the selection
		delete this.selected[id];

		// Broadcast the selection change event
		this.selectionChanged();
	}





	/**
	 * Builds the model's list whener there is a change.
	 */
	private selectionChanged(): void {
		// Init the list
		this.selectedList = [];

		// Iterate over the current selection
		for (let id in this.selected) { this.selectedList.push(this.selected[id]) }

		// Sort the models by points descending
		this.selectedList.sort((a, b) => (a.points < b.points) ? 1 : -1);
	}	





	/**
	 * Resets the selection data.
	 */
	public reset(): void {
		this.selected = {};
		this.selectedList = [];
	}








	/* Selection Output */





	/**
	 * Builds the selection string and places it in the clipboard.
	 */
	public copySelectionString(): void {
		let selection: string = '';
		for (let i = 0; i < this.selectedList.length; i++) {
			selection += this.selectedList[i].id;
			if (i < this.selectedList.length - 1) selection += ',';
		}
		this._app.copy(selection, false);
		this._app.success("The model selection string has been placed in the clipboard.")
	}
}
