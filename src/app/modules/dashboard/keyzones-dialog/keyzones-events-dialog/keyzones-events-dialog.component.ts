import { Component, OnInit } from '@angular/core';
import { MatDialogRef, MatDialog } from '@angular/material/dialog';
import * as moment from "moment";
import { IKeyZoneStateEvent, MarketStateService } from '../../../../core';
import { AppService, NavService } from '../../../../services';
import { IDateRangeConfig } from '../../../../shared/components/date-range-form-dialog';
import { KeyzoneEventContextDialogComponent } from './keyzone-event-context-dialog/keyzone-event-context-dialog.component';
import { IKeyZonesEventsDialogComponent } from './interfaces';

@Component({
  selector: 'app-keyzones-events-dialog',
  templateUrl: './keyzones-events-dialog.component.html',
  styleUrls: ['./keyzones-events-dialog.component.scss']
})
export class KeyzonesEventsDialogComponent implements OnInit, IKeyZonesEventsDialogComponent {
	// History
	public hist: IKeyZoneStateEvent[] = [];
	private activeRange!: IDateRangeConfig;

	// Tab
	public activeTab: number = 0;

	// Load State
	public loaded: boolean = false;

	constructor(
		public dialogRef: MatDialogRef<KeyzonesEventsDialogComponent>,
		public _nav: NavService,
		public _app: AppService,
		private _ms: MarketStateService,
		private dialog: MatDialog
	) { }

	ngOnInit(): void {
		const endAt: number = this._app.serverTime.value!;
		this.activeRange = {
			startAt: moment(endAt).subtract(24, "hours").valueOf(),
			endAt: endAt
		}
		this.loadHist();
	}









	/**
	 * Loads the KeyZones Events records history for a given range.
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
			this.hist = await this._ms.listKeyZoneEvents(
				this.activeRange.startAt, 
				this.activeRange.endAt
			);
			this.hist.reverse();
		} catch (e) { this._app.error(e) }
		this.loaded = true;
	}








	/**
	 * Displays a dialog describing how the keyzone evt took place.
	 */
	public displayKeyZoneEventContext(evt: IKeyZoneStateEvent): void {
		this.dialog.open(KeyzoneEventContextDialogComponent, {
			hasBackdrop: this._app.layout.value != "mobile",
			panelClass: "large-dialog",
			data: evt
		})
	}










	/**
	 * Displays the Position Action Payloads Module Tooltip.
	 */
	public displayTooltip(): void {
        this._nav.displayTooltip("KeyZone Events", [
			`@TODO`,
        ]);
	}








	
	/*
	* Closes the dialog.
	* @returns void
	* */
	public close(): void { this.dialogRef.close() }

}
