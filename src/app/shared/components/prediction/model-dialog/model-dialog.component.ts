import {Component, Inject, OnInit} from '@angular/core';
import {MatDialogRef, MAT_DIALOG_DATA} from "@angular/material/dialog";
import { IModel, IModelTypeName, PredictionService } from '../../../../core';
import { SnackbarService } from '../../../../services';
import { IModelDialogComponent } from './interfaces';

@Component({
  selector: 'app-model-dialog',
  templateUrl: './model-dialog.component.html',
  styleUrls: ['./model-dialog.component.scss']
})
export class ModelDialogComponent implements OnInit, IModelDialogComponent {
	// Model Type
	public modelTypeName!: IModelTypeName;


    constructor(
		public dialogRef: MatDialogRef<ModelDialogComponent>,
		private _snackbar: SnackbarService,
		private _prediction: PredictionService,
		@Inject(MAT_DIALOG_DATA) public model: IModel,
	) { }


    ngOnInit(): void {
		// Make sure the model was provided
		if (!this.model) {
			console.error(this.model)
			this._snackbar.error('A valid model must be provided in order to visualize it.');
			setTimeout(() => { this.close() }, 700)
		}

		// Retrieve the Type
		this.modelTypeName = this._prediction.getModelTypeName(this.model);
    }








	// Close Dialog
	public close(): void { this.dialogRef.close() }
}
