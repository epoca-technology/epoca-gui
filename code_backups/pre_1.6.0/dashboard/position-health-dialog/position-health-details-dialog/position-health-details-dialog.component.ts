import { Component, OnInit, Inject } from '@angular/core';
import {MatDialogRef, MAT_DIALOG_DATA} from "@angular/material/dialog";
import { IPositionSideHealth } from '../../../../core';
import { IPositionHealthDetailsDialogComponent } from './interfaces';

@Component({
  selector: 'app-position-health-details-dialog',
  templateUrl: './position-health-details-dialog.component.html',
  styleUrls: ['./position-health-details-dialog.component.scss']
})
export class PositionHealthDetailsDialogComponent implements OnInit, IPositionHealthDetailsDialogComponent {

	constructor(
		private dialogRef: MatDialogRef<PositionHealthDetailsDialogComponent>,
		@Inject(MAT_DIALOG_DATA) public health: IPositionSideHealth,
	) { }

	ngOnInit(): void {
	}

	/*
	* Closes the dialog.
	* @returns void
	* */
	public close(): void { this.dialogRef.close() }
}
