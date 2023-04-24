import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import * as moment from "moment";
import { ISignalRecord, SignalService } from '../../../../core';
import { AppService, NavService } from '../../../../services';
import { IDateRangeConfig } from '../../../../shared/components/date-range-form-dialog';
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
		{id: "12h", name: "Last 12 hours"},
		{id: "24h", name: "Last 24 hours"},
		{id: "48h", name: "Last 48 hours"},
		{id: "72h", name: "Last 72 hours"},
		{id: "1w", name: "Last week"},
		{id: "2w", name: "Last 2 weeks"},
		{id: "1m", name: "Last month"},
		{id: "custom", name: "Custom Date Range"},
	];
	public activeHistMenuItem: IRecordHistoryRange = this.histMenu[0];
	private activeRange!: IDateRangeConfig;

	// Load State
	public loaded: boolean = false;

	constructor(
		public dialogRef: MatDialogRef<SignalRecordsDialogComponent>,
		public _nav: NavService,
		public _app: AppService,
		private _signal: SignalService
	) { }

	ngOnInit(): void {
		this.loadHist(this.histMenu[0]);
	}









	/**
	 * Loads the signal records history for a given range.
	 * @param range 
	 * @returns Promise<void>
	 */
	public async loadHist(range: IRecordHistoryRange): Promise<void> {
		// Calculate the range of the query
		const newRange: IDateRangeConfig|undefined = await this.calculateDateRange(range.id);

		// Proceed if a new range has been selected
		if (newRange) {
			this.activeRange = newRange

			// Download the data
			this.loaded = false;
			try {
				this.hist = await this._signal.getSignalRecords(this.activeRange.startAt, this.activeRange.endAt);
				this.activeHistMenuItem = range;
			} catch (e) { this._app.error(e) }
			this.loaded = true;
		}
	}






	/**
	 * Calculates the date range of the history based
	 * on the range id.
	 * @param id
	 * @returns {startAt: number, endAt: number}
	 */
	private calculateDateRange(id: IIRecordHistoryRangeID): Promise<IDateRangeConfig|undefined> { 
		return new Promise((resolve, reject) => {
			// Init the end
			const endAt: number = this._app.marketState.value?.window.w[this._app.marketState.value?.window.w.length - 1].ct || this._app.serverTime.value!;

			// Handle a custom date range
			if (id == "custom") {
				this._nav.displayDateRangeDialog(this.activeRange).afterClosed().subscribe(
					(response) => {
						if (response) {
							resolve(response);
						} else {
							resolve(undefined)
						}
					}
				);
			} else {
				// Init values
				let startAt: number;

				// Calculate the starting point
				if 		(id == "12h") { startAt = moment(endAt).subtract(12, "hours").valueOf() }
				else if (id == "24h") { startAt = moment(endAt).subtract(24, "hours").valueOf() }
				else if (id == "48h") { startAt = moment(endAt).subtract(48, "hours").valueOf() }
				else if (id == "72h") { startAt = moment(endAt).subtract(72, "hours").valueOf() }
				else if (id == "1w") { startAt = moment(endAt).subtract(1, "week").valueOf() }
				else if (id == "2w") { startAt = moment(endAt).subtract(2, "weeks").valueOf() }
				else if (id == "1m") { startAt = moment(endAt).subtract(1, "month").valueOf() }
				else { throw new Error("Invalid History Range ID.") }


				// Finally, return the range
				resolve({startAt: startAt, endAt: endAt});
			}
		});
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
