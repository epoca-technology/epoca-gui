import { Component, Inject, OnInit } from '@angular/core';
import {MatDialogRef, MAT_DIALOG_DATA} from "@angular/material/dialog";
import { IBacktestPosition, IPredictionModelConfig } from '../../../../core';
import { NavService } from '../../../../services';
import { IPredictionModelBacktestPositionDialogComponent, IBacktestPositionDialogData } from './interfaces';

@Component({
  selector: 'app-prediction-model-backtest-position-dialog',
  templateUrl: './prediction-model-backtest-position-dialog.component.html',
  styleUrls: ['./prediction-model-backtest-position-dialog.component.scss']
})
export class PredictionModelBacktestPositionDialogComponent implements OnInit, IPredictionModelBacktestPositionDialogComponent {
	public model: IPredictionModelConfig;
	public position: IBacktestPosition;

	constructor(
		public dialogRef: MatDialogRef<PredictionModelBacktestPositionDialogComponent>,
		@Inject(MAT_DIALOG_DATA) private data: IBacktestPositionDialogData,
		public _nav: NavService
	) { 
		this.model = this.data.model;
		this.position = this.data.position;
	}

	ngOnInit(): void {
	}











	/*
	* Closes the dialog.
	* @returns void
	* */
	public close(): void { this.dialogRef.close() }
}
