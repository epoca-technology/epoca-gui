import { Component, OnInit, Inject } from '@angular/core';
import {MatDialogRef, MAT_DIALOG_DATA} from "@angular/material/dialog";
import { IDataDialogComponent, IDataDialogData } from './interfaces';

@Component({
  selector: 'app-data-dialog',
  templateUrl: './data-dialog.component.html',
  styleUrls: ['./data-dialog.component.scss']
})
export class DataDialogComponent implements OnInit, IDataDialogComponent {
	public name!: string;
	public valueType!: string;
	public value!: any;
	constructor(
		public dialogRef: MatDialogRef<DataDialogComponent>,
		@Inject(MAT_DIALOG_DATA) private data: IDataDialogData,
	) { }

	ngOnInit(): void {
		this.name = this.data.name;
		this.valueType = typeof this.data.value;
		this.value = this.data.value;
	}




	/*
	* Closes the dialog.
	* @returns void
	* */
	public close(): void { this.dialogRef.close() }
}
