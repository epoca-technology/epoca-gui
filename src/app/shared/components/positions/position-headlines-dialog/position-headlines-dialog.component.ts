import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import * as moment from "moment";
import { IPositionHeadline, PositionService } from '../../../../core';
import { AppService, NavService } from '../../../../services';
import { IDateRangeConfig } from '../../../../shared/components/date-range-form-dialog';
import { IPositionHeadlinesDialogComponent } from './interfaces';

@Component({
  selector: 'app-position-headlines-dialog',
  templateUrl: './position-headlines-dialog.component.html',
  styleUrls: ['./position-headlines-dialog.component.scss']
})
export class PositionHeadlinesDialogComponent implements OnInit, IPositionHeadlinesDialogComponent {
	// History
	public hist: IPositionHeadline[] = [];
	private activeRange!: IDateRangeConfig;

	// Load State
	public loaded: boolean = false;

	constructor(
		public dialogRef: MatDialogRef<PositionHeadlinesDialogComponent>,
		@Inject(MAT_DIALOG_DATA) private defaultConfig: IDateRangeConfig,
		public _nav: NavService,
		public _app: AppService,
		private _position: PositionService
	) { }

	ngOnInit(): void {
		this.activeRange = this.defaultConfig;
		if (!this.activeRange) {
			const endAt: number = this._app.serverTime.value!;
			this.activeRange = {
				startAt: moment(endAt).subtract(3, "months").valueOf(),
				endAt: endAt
			}
		}
		this.loadHist();
	}









	/**
	 * Loads the position headlines for a given date range
	 * @param alterRange? 
	 * @returns Promise<void>
	 */
	public async loadHist(alterRange?: boolean): Promise<void> {
		// Calculate the new range if applies
		if (alterRange) {
			// Calculate the range of the query
			const newRange: IDateRangeConfig|undefined = await this._nav.calculateDateRange(this.activeRange);

			// If a new range was set, update the local property
			if (newRange) {
				this.activeRange = newRange;
			} else {
				return;
			}
		}

		// Download the data
		this.loaded = false;
		try {
			this.hist = await this._position.listPositionHeadlines(this.activeRange.startAt, this.activeRange.endAt);
			this.hist.reverse();
		} catch (e) { this._app.error(e) }
		this.loaded = true;
	}









	/**
	 * Displays the position action payloads dialog.
     * @param taInterval
	 */
    public displayPositionActionPayloadsDialog(): void {
		this._nav.displayTradeExecutionPayloadListDialog(this.activeRange);
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
