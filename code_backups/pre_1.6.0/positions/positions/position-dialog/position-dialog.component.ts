import { Component, OnInit, Inject } from '@angular/core';
import {MatDialogRef, MAT_DIALOG_DATA, MatDialog} from "@angular/material/dialog";
import { IPosition } from '../../../../core';
import { AppService, NavService } from '../../../../services';
import { PositionTradeDialogComponent } from './position-trade-dialog';
import { PositionHistoryDialogComponent } from './position-history-dialog';
import { IPositionDialogComponent } from './interfaces';

@Component({
  selector: 'app-position-dialog',
  templateUrl: './position-dialog.component.html',
  styleUrls: ['./position-dialog.component.scss']
})
export class PositionDialogComponent implements OnInit, IPositionDialogComponent {

	constructor(
		public dialogRef: MatDialogRef<PositionDialogComponent>,
		@Inject(MAT_DIALOG_DATA) public position: IPosition,
		public _app: AppService,
        private dialog: MatDialog,
		public _nav: NavService
	) { }

	ngOnInit(): void {
	}





	/**
	 * Displays the position's history on a new dialog.
	 */
	public displayHistory(): void {
		// Finally, display the dialog
		this.dialog.open(PositionHistoryDialogComponent, {
			hasBackdrop: this._app.layout.value != 'mobile', // Mobile optimization
			panelClass: 'large-dialog',
			data: this.position
		})
	}



	/**
	 * Displays the position's trades on a new dialog.
	 */
	public displayTrades(): void {
		// Finally, display the dialog
		this.dialog.open(PositionTradeDialogComponent, {
			hasBackdrop: this._app.layout.value != 'mobile', // Mobile optimization
			panelClass: 'small-dialog',
			data: this.position
		})
	}




	

	/*
	* Closes the dialog.
	* @returns void
	* */
	public close(): void { this.dialogRef.close() }
}
