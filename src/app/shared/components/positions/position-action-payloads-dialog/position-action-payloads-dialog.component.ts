import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import * as moment from "moment";
import { IPositionActionRecord, PositionService } from '../../../../core';
import { AppService, NavService } from '../../../../services';
import { IDateRangeConfig } from '../../../../shared/components/date-range-form-dialog';
import { IPositionActionPayloadsDialogComponent } from './interfaces';

@Component({
  selector: 'app-position-action-payloads-dialog',
  templateUrl: './position-action-payloads-dialog.component.html',
  styleUrls: ['./position-action-payloads-dialog.component.scss']
})
export class PositionActionPayloadsDialogComponent implements OnInit, IPositionActionPayloadsDialogComponent {
	// History
	public hist: IPositionActionRecord[] = [];
	private activeRange!: IDateRangeConfig;

	// Tab
	public activeTab: number = 0;

	// Load State
	public loaded: boolean = false;

	constructor(
		public dialogRef: MatDialogRef<PositionActionPayloadsDialogComponent>,
		@Inject(MAT_DIALOG_DATA) private defaultConfig: IDateRangeConfig,
		public _nav: NavService,
		public _app: AppService,
		private _position: PositionService
	) { 
	}

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
	 * Triggers whenever the tab changes.
	 * @param newIndex 
	 */
	public tabChanged(newIndex: number): void {
		this.activeTab = newIndex;
		this.loadHist();
	}







	/**
	 * Loads the list of records from the server. If the range should be 
	 * altered, it will display the prompt.
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
			this.hist = await this._position.listPositionActionPayloads(
				this.activeTab == 0 ? "POSITION_OPEN": "POSITION_CLOSE",
				this.activeRange.startAt, 
				this.activeRange.endAt
			);
			this.hist.reverse();
		} catch (e) { this._app.error(e) }
		this.loaded = true;
	}



	










	/**
	 * Displays the Position Action Payloads Module Tooltip.
	 */
	public displayTooltip(): void {
        this._nav.displayTooltip("Position Action Payloads", [
			`@TODO`,
        ]);
	}






	
	/*
	* Closes the dialog.
	* @returns void
	* */
	public close(): void { this.dialogRef.close() }
}
