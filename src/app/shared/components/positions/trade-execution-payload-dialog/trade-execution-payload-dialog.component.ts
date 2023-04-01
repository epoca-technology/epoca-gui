import { Component, Inject, OnInit } from '@angular/core';
import {MatDialogRef, MAT_DIALOG_DATA} from "@angular/material/dialog";
import { IBinanceTradeExecutionPayload } from '../../../../core';
import { AppService, NavService } from '../../../../services';
import { ITradeExecutionPayloadDialogComponent } from './interfaces';

@Component({
  selector: 'app-trade-execution-payload-dialog',
  templateUrl: './trade-execution-payload-dialog.component.html',
  styleUrls: ['./trade-execution-payload-dialog.component.scss']
})
export class TradeExecutionPayloadDialogComponent implements OnInit, ITradeExecutionPayloadDialogComponent {

	constructor(
		public dialogRef: MatDialogRef<TradeExecutionPayloadDialogComponent>,
		@Inject(MAT_DIALOG_DATA) public payload: IBinanceTradeExecutionPayload,
		private _app: AppService,
		public _nav: NavService
	) { }

	ngOnInit(): void {

	}





	/*
	* Closes the dialog.
	* @returns void
	* */
	public close(): void { this.dialogRef.close() }


}
