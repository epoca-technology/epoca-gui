import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import * as moment from "moment";
import { ISignalRecord, SignalService } from '../../../../core';
import { AppService, NavService } from '../../../../services';
import { ISignalRecordsDialogComponent, IRecordHistoryRange, IIRecordHistoryRangeID } from './interfaces';

@Component({
  selector: 'app-signal-records-dialog',
  templateUrl: './signal-records-dialog.component.html',
  styleUrls: ['./signal-records-dialog.component.scss']
})
export class SignalRecordsDialogComponent implements OnInit, ISignalRecordsDialogComponent {

	// Signals History
	public hist: ISignalRecord[] = [];
	public histMenu: IRecordHistoryRange[] = [
		{id: "24h", name: "Last 24 hours"},
		{id: "48h", name: "Last 48 hours"},
		{id: "72h", name: "Last 72 hours"},
		{id: "1w", name: "Last week"},
		{id: "2w", name: "Last 2 weeks"},
		{id: "1m", name: "Last month"},
	];
	public activeHistMenuItem: IRecordHistoryRange = this.histMenu[0];
	public loadingHist: boolean = false;

	// Tab Management
	public activeTab: number = 0;



	constructor(
		public dialogRef: MatDialogRef<SignalRecordsDialogComponent>,
		@Inject(MAT_DIALOG_DATA) public active: ISignalRecord,
		public _nav: NavService,
		public _app: AppService,
		private _signal: SignalService
	) { }

	ngOnInit(): void {
	}







	/**
	 * Handles the tab change event, if the history tab
	 * is activated and the data has not been initialized,
	 * it does so.
	 * @param newIndex 
	 */
	public tabChanged(newIndex: number): void {
		// Activate the new tab
		this.activeTab = newIndex;

		// Activate the signals history in case they haven't been loaded
		if (!this.hist.length) this.loadHist(this.histMenu[0]);
	}






	/**
	 * Loads the signal records history for a given range.
	 * @param range 
	 * @returns Promise<void>
	 */
	public async loadHist(range: IRecordHistoryRange): Promise<void> {
		// Calculate the range of the query
		const {startAt, endAt } = this.calculateDateRange(range.id);

		// Download the data
		this.loadingHist = true;
		try {
			this.hist = await this._signal.getSignalRecords(startAt, endAt);
			this.activeHistMenuItem = range;
		} catch (e) { this._app.error(e) }
		this.loadingHist = false;
	}






	/**
	 * Calculates the date range of the history based
	 * on the range id.
	 * @param id
	 * @returns {startAt: number, endAt: number}
	 */
	private calculateDateRange(id: IIRecordHistoryRangeID): {startAt: number, endAt: number} { 
		// Init values
		const endAt: number = this._app.serverTime.value!;
		let startAt: number;

		// Calculate the starting point
		if 		(id == "24h") { startAt = moment(endAt).subtract(24, "hours").valueOf() }
		else if (id == "48h") { startAt = moment(endAt).subtract(48, "hours").valueOf() }
		else if (id == "72h") { startAt = moment(endAt).subtract(72, "hours").valueOf() }
		else if (id == "1w") { startAt = moment(endAt).subtract(1, "week").valueOf() }
		else if (id == "2w") { startAt = moment(endAt).subtract(2, "weeks").valueOf() }
		else if (id == "1m") { startAt = moment(endAt).subtract(1, "month").valueOf() }
		else { throw new Error("Invalid History Range ID.") }


		// Finally, return the range
		return {startAt: startAt, endAt: endAt};
	}

	






	/**
	 * Displays the Keyzones Module Tooltip.
	 */
	public displayTooltip(): void {
        this._nav.displayTooltip("Signal Records", [
			`@TODO`,
        ]);
	}






	
	/*
	* Closes the dialog.
	* @returns void
	* */
	public close(): void { this.dialogRef.close() }
}
