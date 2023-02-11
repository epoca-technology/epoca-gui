import { Component, OnInit, Inject } from '@angular/core';
import {MatDialogRef, MAT_DIALOG_DATA} from "@angular/material/dialog";
import { IPosition } from '../../../../../core';
import { IPositionTradeDialogComponent } from './interfaces';

@Component({
  selector: 'app-position-trade-dialog',
  templateUrl: './position-trade-dialog.component.html',
  styleUrls: ['./position-trade-dialog.component.scss']
})
export class PositionTradeDialogComponent implements OnInit, IPositionTradeDialogComponent {

	constructor(
		public dialogRef: MatDialogRef<PositionTradeDialogComponent>,
		@Inject(MAT_DIALOG_DATA) public position: IPosition
	) { }

	ngOnInit(): void {
	}







	/*
	* Closes the dialog.
	* @returns void
	* */
	public close(): void { this.dialogRef.close() }
}
