import { Component, OnInit, Inject } from '@angular/core';
import {MatDialogRef, MAT_DIALOG_DATA} from "@angular/material/dialog";
import {  IKeyZone, UtilsService } from '../../../../core';
import { IKeyZoneDetailsDialogComponent } from './interfaces';

@Component({
  selector: 'app-keyzone-details-dialog',
  templateUrl: './keyzone-details-dialog.component.html',
  styleUrls: ['./keyzone-details-dialog.component.scss']
})
export class KeyzoneDetailsDialogComponent implements OnInit, IKeyZoneDetailsDialogComponent {
	public zoneSize: number;
	constructor(
		public dialogRef: MatDialogRef<KeyzoneDetailsDialogComponent>,
		@Inject(MAT_DIALOG_DATA) public zone: IKeyZone,
		private _utils: UtilsService
	) { 
		this.zoneSize = <number>this._utils.calculatePercentageChange(this.zone.s, this.zone.e);
	}

	ngOnInit(): void {
	}

	
	/*
	* Closes the dialog.
	* @returns void
	* */
	public close(): void { this.dialogRef.close() }
}
