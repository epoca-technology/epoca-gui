import { Component, OnInit, Inject } from '@angular/core';
import {MatDialogRef, MAT_DIALOG_DATA} from "@angular/material/dialog";
import { IKerasClassificationConfig, IKerasRegressionConfig } from '../../../../core';
import { AppService, NavService } from '../../../../services';
import { IKerasModelDialogComponent } from './interfaces';

@Component({
  selector: 'app-keras-model-dialog',
  templateUrl: './keras-model-dialog.component.html',
  styleUrls: ['./keras-model-dialog.component.scss']
})
export class KerasModelDialogComponent implements OnInit, IKerasModelDialogComponent {
	// Model Data
	public model: IKerasRegressionConfig|IKerasClassificationConfig|any;
	public isRegression: boolean;

	// Tabs
	public activeIndex: number = 0;

	constructor(
		public dialogRef: MatDialogRef<KerasModelDialogComponent>,
		@Inject(MAT_DIALOG_DATA) private data: IKerasRegressionConfig|IKerasClassificationConfig|any,
		public _nav: NavService,
		public _app: AppService,
	) { 
		this.model = this.data;
		this.isRegression = this.data.training_data_id == undefined;
	}

	ngOnInit(): void {

	}



	// Close Dialog
	public close(): void { this.dialogRef.close() }

}
