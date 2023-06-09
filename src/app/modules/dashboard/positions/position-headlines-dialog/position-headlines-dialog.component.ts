import { Component, OnInit } from '@angular/core';
import { MatDialogRef, MatDialog } from '@angular/material/dialog';
import * as moment from "moment";
import { IPositionHeadline, PositionService } from '../../../../core';
import { AppService, NavService } from '../../../../services';
import { IDateRangeConfig } from '../../../../shared/components/date-range-form-dialog';
import { PositionActionPayloadsDialogComponent } from '../position-action-payloads-dialog';
import { IIPosRecordHistoryRangeID, IPositionHeadlinesDialogComponent, IPosRecordHistoryRange } from './interfaces';

@Component({
  selector: 'app-position-headlines-dialog',
  templateUrl: './position-headlines-dialog.component.html',
  styleUrls: ['./position-headlines-dialog.component.scss']
})
export class PositionHeadlinesDialogComponent implements OnInit, IPositionHeadlinesDialogComponent {
	// History
	public hist: IPositionHeadline[] = [];
	public histMenu: IPosRecordHistoryRange[] = [
		{id: "1w", name: "Last week"},
		{id: "2w", name: "Last 2 weeks"},
		{id: "1m", name: "Last month"},
		{id: "2m", name: "Last 2 months"},
		{id: "3m", name: "Last 3 months"},
		{id: "6m", name: "Last 6 months"},
		{id: "9m", name: "Last 9 months"},
		{id: "1y", name: "Last 12 months"},
		{id: "custom", name: "Custom Date Range"},
	];
	public activeHistMenuItem: IPosRecordHistoryRange = this.histMenu[2];
	private activeRange!: IDateRangeConfig;

	// Load State
	public loaded: boolean = false;

	constructor(
		public dialogRef: MatDialogRef<PositionHeadlinesDialogComponent>,
		public _nav: NavService,
		public _app: AppService,
		private _position: PositionService,
		private dialog: MatDialog
	) { }

	ngOnInit(): void {
		this.loadHist(this.histMenu[2]);
	}









	/**
	 * Loads the signal records history for a given range.
	 * @param range 
	 * @returns Promise<void>
	 */
	public async loadHist(range: IPosRecordHistoryRange): Promise<void> {
		// Calculate the range of the query
		const newRange: IDateRangeConfig|undefined = await this.calculateDateRange(range.id);

		// Proceed if a new range has been selected
		if (newRange) {
			this.activeRange = newRange

			// Download the data
			this.loaded = false;
			try {
				this.hist = await this._position.listPositionHeadlines(this.activeRange.startAt, this.activeRange.endAt);
				this.hist.reverse();
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
	private calculateDateRange(id: IIPosRecordHistoryRangeID): Promise<IDateRangeConfig|undefined> { 
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
				if 		(id == "1w") { startAt = moment(endAt).subtract(1, "week").valueOf() }
				else if (id == "2w") { startAt = moment(endAt).subtract(2, "weeks").valueOf() }
				else if (id == "1m") { startAt = moment(endAt).subtract(1, "month").valueOf() }
				else if (id == "2m") { startAt = moment(endAt).subtract(2, "months").valueOf() }
				else if (id == "3m") { startAt = moment(endAt).subtract(3, "months").valueOf() }
				else if (id == "6m") { startAt = moment(endAt).subtract(6, "months").valueOf() }
				else if (id == "9m") { startAt = moment(endAt).subtract(9, "months").valueOf() }
				else if (id == "1y") { startAt = moment(endAt).subtract(1, "year").valueOf() }
				else { throw new Error("Invalid History Range ID.") }


				// Finally, return the range
				resolve({startAt: startAt, endAt: endAt});
			}
		});
	}

	









	/**
	 * Displays the position action payloads dialog.
     * @param taInterval
	 */
    public displayPositionActionPayloadsDialog(): void {
		this.dialog.open(PositionActionPayloadsDialogComponent, {
			hasBackdrop: this._app.layout.value != "mobile",
			panelClass: "small-dialog",
			data: {}
		})
	}











	/**
	 * Displays the Keyzones Module Tooltip.
	 */
	public displayTooltip(): void {
        this._nav.displayTooltip("Position Headlines", [
			`@TODO`,
        ]);
	}






	
	/*
	* Closes the dialog.
	* @returns void
	* */
	public close(): void { this.dialogRef.close() }

}
