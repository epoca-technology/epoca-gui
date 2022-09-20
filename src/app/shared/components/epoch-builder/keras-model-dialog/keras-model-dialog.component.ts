import { Component, OnInit, Inject } from '@angular/core';
import {MatDialogRef, MAT_DIALOG_DATA} from "@angular/material/dialog";
import { IRegressionConfig } from '../../../../core';
import { AppService, NavService } from '../../../../services';
import { IKerasModelDialogComponent } from './interfaces';

@Component({
  selector: 'app-keras-model-dialog',
  templateUrl: './keras-model-dialog.component.html',
  styleUrls: ['./keras-model-dialog.component.scss']
})
export class KerasModelDialogComponent implements OnInit, IKerasModelDialogComponent {
	// Model Data
	public model: IRegressionConfig;

	// Tabs
	public activeIndex: number = 0;

	constructor(
		public dialogRef: MatDialogRef<KerasModelDialogComponent>,
		@Inject(MAT_DIALOG_DATA) private data: IRegressionConfig,
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
