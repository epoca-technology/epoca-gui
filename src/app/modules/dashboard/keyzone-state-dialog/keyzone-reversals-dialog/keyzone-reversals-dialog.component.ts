import { Component, OnInit, Inject } from '@angular/core';
import {MatDialogRef, MAT_DIALOG_DATA} from "@angular/material/dialog";
import {  IReversal } from '../../../../core';
import { IKeyZoneReversalsDialogComponent } from './interfaces';

@Component({
  selector: 'app-keyzone-reversals-dialog',
  templateUrl: './keyzone-reversals-dialog.component.html',
  styleUrls: ['./keyzone-reversals-dialog.component.scss']
})
export class KeyzoneReversalsDialogComponent implements OnInit, IKeyZoneReversalsDialogComponent {

	constructor(
		public dialogRef: MatDialogRef<KeyzoneReversalsDialogComponent>,
		@Inject(MAT_DIALOG_DATA) public reversals: IReversal[],
	) { }

	ngOnInit(): void {
	}

	
	/*
	* Closes the dialog.
	* @returns void
	* */
	public close(): void { this.dialogRef.close() }
}
