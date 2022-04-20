import { Component, Inject, OnInit } from '@angular/core';
import {MatDialogRef, MAT_DIALOG_DATA} from "@angular/material/dialog";
import { ICandlestick } from '../../../../core';
import { SnackbarService } from '../../../../services';
import { ICandlestickDialogComponent } from './interfaces';

@Component({
  selector: 'app-candlestick-dialog',
  templateUrl: './candlestick-dialog.component.html',
  styleUrls: ['./candlestick-dialog.component.scss']
})
export class CandlestickDialogComponent implements ICandlestickDialogComponent, OnInit {

	constructor(
		public dialogRef: MatDialogRef<CandlestickDialogComponent>,
		@Inject(MAT_DIALOG_DATA) public candlestick: ICandlestick,
		private _snackbar: SnackbarService
	) { }

	ngOnInit(): void {
		if (!this.candlestick) {
			this._snackbar.error('A valid candlestick must be provided.');
			setTimeout(() => { this.close() }, 500);
		}
	}





	/*
	* Closes the dialog.
	* @returns void
	* */
	public close(): void { this.dialogRef.close() }

}
