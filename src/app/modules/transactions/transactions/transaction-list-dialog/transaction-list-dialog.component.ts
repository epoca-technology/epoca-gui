import { Component, OnInit, Inject } from '@angular/core';
import * as moment from "moment";
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { IAccountIncomeType, UtilsService } from '../../../../core';
import { AppService, ILayout, NavService } from '../../../../services';
import { IExtendedAccountIncomeRecord, ITransactionListDialogComponent, ITransactionListDialogConfig } from './interfaces';

@Component({
  selector: 'app-transaction-list-dialog',
  templateUrl: './transaction-list-dialog.component.html',
  styleUrls: ['./transaction-list-dialog.component.scss']
})
export class TransactionListDialogComponent implements OnInit, ITransactionListDialogComponent {
	// Layout
	public layout: ILayout = this._app.layout.value;

	// Inherited Data
	public title!: string;
	public records: IExtendedAccountIncomeRecord[] = [];

	
	constructor(
		public dialogRef: MatDialogRef<TransactionListDialogComponent>,
		@Inject(MAT_DIALOG_DATA) private config: ITransactionListDialogConfig,
		public _nav: NavService,
		public _app: AppService,
		private _utils: UtilsService
	) { }

	ngOnInit(): void {
		// Initialize the title
		this.title = this.getIncomeTitle(this.config.incomeType);

		// Build the extended records
		let accum: number = 0;
		for (let rec of this.config.records) {
			accum = accum + rec.v;
			this.records.push({accum: accum, ...rec});
		}
		this.records.reverse();
	}






    /**
     * Retrieves the title of a given income type.
     * @param incomeType 
     * @returns string
     */
    private getIncomeTitle(incomeType?: IAccountIncomeType): string {
		switch (incomeType) {
			case "REALIZED_PNL":
				return "Realized PNL";
			case "COMMISSION":
				return "Commission";
			case "FUNDING_FEE":
				return "Funding Fee";
			default:
				return "Income";
		}
  	}







	/**
	 * Displays a transaction record.
	 * @param record 
	 */
	public displayRecord(record: IExtendedAccountIncomeRecord): void {
		this._nav.displayTooltip(record.it, [
			`ID`,
			record.id,
			`DATE`,
			`${moment(record.t).format("dddd, MMMM Do, h:mm:ss a")}`,
			`AMOUNT`,
			`${record.v > 0 ? '+': ''}${this._utils.formatNumber(record.v)}$`
		]);
	}


	
	



	/*
	* Closes the dialog.
	* @returns void
	* */
	public close(): void { this.dialogRef.close() }
}
