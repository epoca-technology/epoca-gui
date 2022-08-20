import { Component, Inject, OnInit } from '@angular/core';
import {MatDialogRef, MAT_DIALOG_DATA} from "@angular/material/dialog";
import { ICandlestick } from '../../../../core';
import { AppService, ModelSelectionService } from '../../../../services';
import { IModelSelectionDialogComponent } from './interfaces';

@Component({
  selector: 'app-model-selection-dialog',
  templateUrl: './model-selection-dialog.component.html',
  styleUrls: ['./model-selection-dialog.component.scss']
})
export class ModelSelectionDialogComponent implements OnInit, IModelSelectionDialogComponent {

	constructor(
		public dialogRef: MatDialogRef<ModelSelectionDialogComponent>,
		@Inject(MAT_DIALOG_DATA) public candlestick: ICandlestick,
		public _selection: ModelSelectionService,
		public _app: AppService
	) { }

	ngOnInit(): void {
	}




	/*
	* Closes the dialog.
	* @returns void
	* */
	public close(): void { this.dialogRef.close() }

}
