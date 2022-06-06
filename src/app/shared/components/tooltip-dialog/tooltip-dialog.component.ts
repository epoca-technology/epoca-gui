import { Component, OnInit, Inject } from '@angular/core';
import {MatDialogRef, MAT_DIALOG_DATA} from "@angular/material/dialog";
import { ITooltipDialogComponent, ITooltipData } from './interfaces';

@Component({
  selector: 'app-tooltip-dialog',
  templateUrl: './tooltip-dialog.component.html',
  styleUrls: ['./tooltip-dialog.component.scss']
})
export class TooltipDialogComponent implements OnInit, ITooltipDialogComponent {
	public title: string;
	public content: string[];
	constructor(
		public dialogRef: MatDialogRef<TooltipDialogComponent>,
		@Inject(MAT_DIALOG_DATA) private data: ITooltipData,
	) { 
		this.title = this.data.title;
		this.content = Array.isArray(this.data.content) ? this.data.content: [this.data.content]
	}

	ngOnInit(): void {
	}

}
