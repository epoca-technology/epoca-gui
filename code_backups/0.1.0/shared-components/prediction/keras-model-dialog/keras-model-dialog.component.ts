import { Component, OnInit, Inject } from '@angular/core';
import {MatDialogRef, MAT_DIALOG_DATA} from "@angular/material/dialog";
import { IKerasModelSummary } from '../../../../core';
import { ClipboardService, NavService } from '../../../../services';
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
	public training_data?: string;

	// Tabs
	public activeIndex: number = 0;

	constructor(
		public dialogRef: MatDialogRef<KerasModelDialogComponent>,
		@Inject(MAT_DIALOG_DATA) private data: IKerasModelDialogData,
		public _nav: NavService,
		public _clipboard: ClipboardService
	) { }

	ngOnInit(): void {
		// Init the model data
		this.id = this.data.id;
		this.description = this.data.description;
		this.sum = this.data.summary;
		this.training_data = this.data.training_data_id;
	}



	// Close Dialog
	public close(): void { this.dialogRef.close() }
}
