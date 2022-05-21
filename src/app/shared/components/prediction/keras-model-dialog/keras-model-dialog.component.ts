import { Component, OnInit, Inject } from '@angular/core';
import {MatDialogRef, MAT_DIALOG_DATA} from "@angular/material/dialog";
import { IKerasModelSummary } from '../../../../core';
import { NavService } from '../../../../services';
import { IKerasModelDialogComponent, IKerasModelDialogData } from './interfaces';

@Component({
  selector: 'app-keras-model-dialog',
  templateUrl: './keras-model-dialog.component.html',
  styleUrls: ['./keras-model-dialog.component.scss']
})
export class KerasModelDialogComponent implements OnInit, IKerasModelDialogComponent {
	// Model Data
	public id!: string;
	public description!: string;
	public sum!: IKerasModelSummary;

	// Tabs
	public activeIndex: number = 0;

	constructor(
		public dialogRef: MatDialogRef<KerasModelDialogComponent>,
		@Inject(MAT_DIALOG_DATA) private data: IKerasModelDialogData,
		public _nav: NavService
	) { }

	ngOnInit(): void {
		// Init the model data
		this.id = this.data.id;
		this.description = this.data.description;
		this.sum = this.data.summary;
	}



	// Close Dialog
	public close(): void { this.dialogRef.close() }
}
