import { Component, OnInit } from '@angular/core';
import {MatDialogRef} from "@angular/material/dialog";
import { IAccountBalance, TransactionService } from "../../../core";
import { AppService, NavService } from '../../../services';
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
		private _nav: NavService,
		private _tx: TransactionService
	) { }

	async ngOnInit(): Promise<void> {
		try {
			this.balance = await this._tx.getBalance();
		} catch (e) { this._app.error(e) }
		this.loaded = true;
	}




	/**
	 * Refreshes the account balance.
	 */
	public refreshBalance(): void {
		this._nav.displayConfirmationDialog({
			title: "Refresh Balance",
			content: `<p class="align-center">Are you sure that you wish to <strong>refresh</strong> the account's balance?</p>`,
			otpConfirmation: true
		}).afterClosed().subscribe(
			async (otp: string|undefined) => {
				if (otp) {
					// Set Submission State
					this.loaded = false;
					try {
						this.balance = await this._tx.syncBalance(otp);
						this._app.success(`The balance has been synced successfully.`);
					} catch(e) { this._app.error(e) }

					// Set Submission State
					this.loaded = true;
				}
			}
		);
	}


	



	/* Trading Strategy */
	public displayTooltip(): void {
		this._nav.displayTooltip("Balance", [
			`@TODO`,
		]);
	}





	/*
	* Closes the dialog.
	* @returns void
	* */
	public close(): void { this.dialogRef.close() }
}
