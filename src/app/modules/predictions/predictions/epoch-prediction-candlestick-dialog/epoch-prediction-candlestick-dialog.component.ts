import { Component, Inject, OnInit } from '@angular/core';
import {MatDialogRef, MAT_DIALOG_DATA} from "@angular/material/dialog";
import { 
	IEpochRecord, 
	IPrediction, 
	IPredictionCandlestick, 
	LocalDatabaseService,
	PredictionService
} from '../../../../core';
import { AppService, NavService } from '../../../../services';
import { IEpochPredictionCandlestickDialogComponent, IPredictionCandlestickDialogData } from './interfaces';

@Component({
  selector: 'app-epoch-prediction-candlestick-dialog',
  templateUrl: './epoch-prediction-candlestick-dialog.component.html',
  styleUrls: ['./epoch-prediction-candlestick-dialog.component.scss']
})
export class EpochPredictionCandlestickDialogComponent implements OnInit, IEpochPredictionCandlestickDialogComponent {
	// Data passed from parent component
	public candlestick: IPredictionCandlestick;
	public epoch: IEpochRecord;

	// Tabs
	public activeTab: number = 0;

	// Predictions
	public preds: IPrediction[] = [];
	public loadingPreds: boolean = false;

	constructor(
		public dialogRef: MatDialogRef<EpochPredictionCandlestickDialogComponent>,
		@Inject(MAT_DIALOG_DATA) public data: IPredictionCandlestickDialogData,
		private _app: AppService,
		public _nav: NavService,
		private _localDB: LocalDatabaseService,
		public _prediction: PredictionService
	) { 
		this.candlestick = this.data.candlestick;
		this.epoch = this.data.epoch;
	}

	ngOnInit(): void {
	}





	/**
	 * Triggers whenever the tab changes. It loads the predictions
	 * once if the tab is enabled.
	 * @param newIndex 
	 */
	public async tabChanged(newIndex: number): Promise<void> {
		// Activate the tab
		this.activeTab = newIndex;

		// If the second tab is being enabled and the predictions havent been loaded, do so
		if (this.activeTab == 1 && !this.preds.length) {
			this.loadingPreds = true;
			try {
				this.preds = await this._localDB.listPredictions(
					this.epoch.id,
					this.candlestick.ot,
					this.candlestick.ct,
					this.epoch.installed
				);
			} catch (e) { this._app.error(e) }
			this.loadingPreds = false;
		}
	}





	/**
	 * Displays a prediction dialog.
	 * @param pred 
	 */
	public displayPrediction(pred: IPrediction): void {
		this._nav.displayPredictionDialog(
			this.epoch.model,
			pred,
			undefined,
			this.epoch
		);
	}





	/*
	* Closes the dialog.
	* @returns void
	* */
	public close(): void { this.dialogRef.close() }
}
