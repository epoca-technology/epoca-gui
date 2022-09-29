import { Component, OnInit, Inject } from '@angular/core';
import {MatDialogRef, MAT_DIALOG_DATA} from "@angular/material/dialog";
import { IPredictionModelConfig } from '../../../../../core';
import { NavService, AppService } from '../../../../../services';
import { IPredictionModelConfigDialogComponent } from './interfaces';

@Component({
  selector: 'app-prediction-model-config-dialog',
  templateUrl: './prediction-model-config-dialog.component.html',
  styleUrls: ['./prediction-model-config-dialog.component.scss']
})
export class PredictionModelConfigDialogComponent implements OnInit, IPredictionModelConfigDialogComponent {
	// Model Data
	public model: IPredictionModelConfig;

	// Tabs
	public activeIndex: number = 0;

	constructor(
		public dialogRef: MatDialogRef<PredictionModelConfigDialogComponent>,
		@Inject(MAT_DIALOG_DATA) private data: IPredictionModelConfig,
		public _nav: NavService,
		public _app: AppService,
	) { 
		this.model = this.data;
	}

	ngOnInit(): void {

	}



	// Close Dialog
	public close(): void { this.dialogRef.close() }
}
