import { Component, OnInit, Inject } from '@angular/core';
import {MatDialogRef, MAT_DIALOG_DATA} from "@angular/material/dialog";
import { AppService } from '../../../../services';
import { 
	IEpochBuilderConfigDialogComponent, 
	IEpochBuilderConfigDialog,
	IEpochBuilderConfigDialogItem, 
	IEpochBuilderConfigDialogResponse 
} from './interfaces';

@Component({
  selector: 'app-epoch-builder-config-dialog',
  templateUrl: './epoch-builder-config-dialog.component.html',
  styleUrls: ['./epoch-builder-config-dialog.component.scss']
})
export class EpochBuilderConfigDialogComponent implements OnInit, IEpochBuilderConfigDialogComponent {
	// Properties
	public title: string;
	public items: IEpochBuilderConfigDialogItem[];
	public active: string|undefined;
	public quantities: number[] = [ 5, 10, 15, 20, 40, 60, 80, 100, 150, 200, 500, 1000 ]

	constructor(
		private dialogRef: MatDialogRef<EpochBuilderConfigDialogComponent>,
		@Inject(MAT_DIALOG_DATA) private data: IEpochBuilderConfigDialog,
		public _app: AppService
	) { 
		this.title = this.data.title;
		this.items = this.data.items;
	}

	ngOnInit(): void {
	}



	/**
	 * Toggles an item ID.
	 * @param id 
	 * @returns void
	 */
	 public toggle(id: string|any): void {
		this.active = id == this.active ? undefined: id
	}




	/*
	* Closes the dialog.
	* @returns void
	* */
	public close(limit?: number): void { 
		if (typeof limit == "number") {
			this.dialogRef.close(<IEpochBuilderConfigDialogResponse>{ id: this.active, limit: limit})
		} else {
			this.dialogRef.close(undefined) 
		}
	}
}
