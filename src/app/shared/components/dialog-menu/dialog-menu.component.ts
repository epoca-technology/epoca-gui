import { Component, OnInit, Inject } from '@angular/core';
import {MatDialogRef, MAT_DIALOG_DATA} from "@angular/material/dialog";
import { IDialogMenuComponent, IDialogMenuItem, IDialogMenuData } from './interfaces';

@Component({
  selector: 'app-dialog-menu',
  templateUrl: './dialog-menu.component.html',
  styleUrls: ['./dialog-menu.component.scss']
})
export class DialogMenuComponent implements OnInit, IDialogMenuComponent {
	public title!: string;
	public items!: IDialogMenuItem[];
	constructor(
		public dialogRef: MatDialogRef<DialogMenuComponent>,
		@Inject(MAT_DIALOG_DATA) private data: IDialogMenuData,
	) { }

	ngOnInit(): void {
		this.title = this.data.title;
		this.items = this.data.items;
	}




	/*
	* Closes the dialog.
	* @returns void
	* */
	public clickAction(response: any): void { this.dialogRef.close(response) }
}
