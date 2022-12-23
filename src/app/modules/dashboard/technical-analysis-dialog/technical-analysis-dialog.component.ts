import { Component, OnInit, Inject } from '@angular/core';
import {MatDialogRef, MAT_DIALOG_DATA} from "@angular/material/dialog";
import { IRegressionConfig, ITAIntervalID, ITAIntervalState, ITAState } from '../../../core';
import { AppService, ILayout, NavService } from '../../../services';
import { ITechnicalAnalysisDialogComponent, ITechnicalAnalysisDialogData } from './interfaces';

@Component({
  selector: 'app-technical-analysis-dialog',
  templateUrl: './technical-analysis-dialog.component.html',
  styleUrls: ['./technical-analysis-dialog.component.scss']
})
export class TechnicalAnalysisDialogComponent implements OnInit, ITechnicalAnalysisDialogComponent {
	// User's Layout
	public layout: ILayout = this._app.layout.value;
	
	// Inherited properties
	public intervalID: ITAIntervalID;
	public intervalState: ITAIntervalState;
	private state: ITAState;

	// Tabs
	public activeIndex: number = 0;

	constructor(
		public dialogRef: MatDialogRef<TechnicalAnalysisDialogComponent>,
		@Inject(MAT_DIALOG_DATA) private data: ITechnicalAnalysisDialogData,
		public _nav: NavService,
		public _app: AppService,
	) { 
		// Populate the core properties
		this.intervalID = this.data.id;
		this.intervalState = this.data.state[this.data.id]
		this.state = this.data.state;

		// Build the charts
		// @TODO
	}

	ngOnInit(): void {
	}




	// Close Dialog
	public close(): void { this.dialogRef.close() }
}
