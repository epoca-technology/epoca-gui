import { Component, OnInit, Inject } from '@angular/core';
import {MatDialogRef, MAT_DIALOG_DATA} from "@angular/material/dialog";
import { IPositionSideHealth } from '../../../../core';
import { IPositionHealthDialogComponent } from './interfaces';

@Component({
  selector: 'app-position-health-dialog',
  templateUrl: './position-health-dialog.component.html',
  styleUrls: ['./position-health-dialog.component.scss']
})
export class PositionHealthDialogComponent implements OnInit, IPositionHealthDialogComponent {

	constructor(
		private dialogRef: MatDialogRef<PositionHealthDialogComponent>,
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
