import {Component, Inject, OnInit} from '@angular/core';
import {MatDialogRef, MAT_DIALOG_DATA} from "@angular/material/dialog";
import { IModel, IModelType, PredictionService } from '../../../../core';
import { SnackbarService } from '../../../../services';
import { IModelListDialogComponent } from './interfaces';

@Component({
  selector: 'app-model-list-dialog',
  templateUrl: './model-list-dialog.component.html',
  styleUrls: ['./model-list-dialog.component.scss']
})
export class ModelListDialogComponent implements OnInit, IModelListDialogComponent {
	public types: {[modelID: string]: IModelType} = {};
	public expanded: {[modelID: string]: boolean} = {};

	constructor(
		public dialogRef: MatDialogRef<ModelListDialogComponent>,
		private _snackbar: SnackbarService,
		private _prediction: PredictionService,
		@Inject(MAT_DIALOG_DATA) public models: IModel[],
	) { }

	ngOnInit(): void {
		// Make sure the model was provided
		if (!this.models.length) {
			console.error(this.models)
			this._snackbar.error('A valid list of models must be provided.');
			setTimeout(() => { this.close() }, 700)
		}

		// Init the type names
		this.types = this.models.reduce((prev, model, index) => {
			Object.assign(prev, {[model.id]: this._prediction.getModelTypeName(model)})
			return prev;
		}, {});
	}



	// Close Dialog
	public close(): void { this.dialogRef.close() }
}
