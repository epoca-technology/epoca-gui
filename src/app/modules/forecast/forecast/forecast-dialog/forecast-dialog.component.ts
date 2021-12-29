import { Component, OnInit, Inject } from '@angular/core';
import {MatDialogRef, MAT_DIALOG_DATA} from "@angular/material/dialog";
import { ForecastService, IForecastResult } from '../../../../core';
import { IForecastDialogComponent } from './interfaces';

@Component({
  selector: 'app-forecast-dialog',
  templateUrl: './forecast-dialog.component.html',
  styleUrls: ['./forecast-dialog.component.scss']
})
export class ForecastDialogComponent implements OnInit, IForecastDialogComponent {

	constructor(
		private dialogRef: MatDialogRef<ForecastDialogComponent>,
		@Inject(MAT_DIALOG_DATA) public forecast: IForecastResult,
		public _forecast: ForecastService
	) { }





	ngOnInit(): void {
	}




	



	/*
	* Closes the dialog.
	* @returns void
	* */
	public close(): void { this.dialogRef.close() }
}
