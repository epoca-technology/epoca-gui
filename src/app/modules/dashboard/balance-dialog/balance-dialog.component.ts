import { Component, OnInit } from '@angular/core';
import {MatDialogRef} from "@angular/material/dialog";
import { IAccountBalance, PositionService } from "../../../core";
import { AppService } from '../../../services';
import { IBalanceDialogComponent } from "./interfaces";


@Component({
  selector: 'app-balance-dialog',
  templateUrl: './balance-dialog.component.html',
  styleUrls: ['./balance-dialog.component.scss']
})
export class BalanceDialogComponent implements OnInit, IBalanceDialogComponent {
	public balance!: IAccountBalance;
	public loaded: boolean = false;
	constructor(
		public dialogRef: MatDialogRef<BalanceDialogComponent>,
		private _app: AppService,
		private _position: PositionService
	) { }

	async ngOnInit(): Promise<void> {
		try {
			this.balance = await this._position.getBalance();
		} catch (e) { this._app.error(e) }
		this.loaded = true;
	}

	
	/*
	* Closes the dialog.
	* @returns void
	* */
	public close(): void { this.dialogRef.close() }
}
