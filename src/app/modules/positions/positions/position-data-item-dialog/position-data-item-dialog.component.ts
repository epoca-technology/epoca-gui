import { Component, OnInit, Inject } from '@angular/core';
import {MatDialogRef, MAT_DIALOG_DATA} from "@angular/material/dialog";
import { IPositionDataItem } from '../../../../core';
import { IPositionDataItemDialogComponent } from './interfaces';

@Component({
  selector: 'app-position-data-item-dialog',
  templateUrl: './position-data-item-dialog.component.html',
  styleUrls: ['./position-data-item-dialog.component.scss']
})
export class PositionDataItemDialogComponent implements OnInit, IPositionDataItemDialogComponent {
	constructor(
		public dialogRef: MatDialogRef<PositionDataItemDialogComponent>,
		@Inject(MAT_DIALOG_DATA) public items: IPositionDataItem[],
	) { }

	ngOnInit(): void {
	}

	/*
	* Closes the dialog.
	* @returns void
	* */
	public close(): void { this.dialogRef.close() }
}
