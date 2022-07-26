import { Component, Inject, OnInit } from '@angular/core';
import {MatDialogRef, MAT_DIALOG_DATA} from "@angular/material/dialog";
import { IBacktestPosition, IModel } from '../../../../core';
import { NavService, SnackbarService } from '../../../../services';
import { IBacktestPositionDialogComponent, IBacktestPositionDialogData } from './interfaces';

@Component({
  selector: 'app-backtest-position-dialog',
  templateUrl: './backtest-position-dialog.component.html',
  styleUrls: ['./backtest-position-dialog.component.scss']
})
export class BacktestPositionDialogComponent implements OnInit, IBacktestPositionDialogComponent {
	public model: IModel;
	public position: IBacktestPosition;

	constructor(
		public dialogRef: MatDialogRef<BacktestPositionDialogComponent>,
		@Inject(MAT_DIALOG_DATA) private data: IBacktestPositionDialogData,
		private _snackbar: SnackbarService,
		public _nav: NavService
	) { 
		this.model = this.data.model;
		this.position = this.data.position;
	}

	ngOnInit(): void {
		if (!this.model) {
			this._snackbar.error('The position cannot be visualized because the model was not provided.');
			setTimeout(() => {this.close()}, 700);
		}
		if (!this.position) {
			this._snackbar.error('The position cannot be visualized because the position was not provided.');
			setTimeout(() => {this.close()}, 700);
		}
	}











	/*
	* Closes the dialog.
	* @returns void
	* */
	public close(): void { this.dialogRef.close() }
}
