import { Component, OnInit, Inject } from '@angular/core';
import {MatDialogRef, MAT_DIALOG_DATA} from "@angular/material/dialog";
import { IAccountBalance } from "../../../core";
import { IBalanceDialogComponent } from "./interfaces";


@Component({
  selector: 'app-balance-dialog',
  templateUrl: './balance-dialog.component.html',
  styleUrls: ['./balance-dialog.component.scss']
})
export class BalanceDialogComponent implements OnInit, IBalanceDialogComponent {

	constructor(
		public dialogRef: MatDialogRef<BalanceDialogComponent>,
		@Inject(MAT_DIALOG_DATA) public balance: IAccountBalance,
	) { }

	ngOnInit(): void {
	}

	
	/*
	* Closes the dialog.
	* @returns void
	* */
	public close(): void { this.dialogRef.close() }
}
