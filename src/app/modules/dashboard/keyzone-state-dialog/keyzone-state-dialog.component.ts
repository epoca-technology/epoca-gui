import { Component, OnInit, Inject } from '@angular/core';
import {MatDialogRef, MAT_DIALOG_DATA} from "@angular/material/dialog";
import { MatDialog } from "@angular/material/dialog";
import { AppService, NavService } from '../../../services';
import { IKeyZoneState, IReversal, UtilsService } from '../../../core';
import { KeyzoneReversalsDialogComponent } from './keyzone-reversals-dialog';
import { IKeyZoneStateDialogComponent, IKeyZonesStateDialogData, IKeyZoneDistance } from './interfaces';

@Component({
  selector: 'app-keyzone-state-dialog',
  templateUrl: './keyzone-state-dialog.component.html',
  styleUrls: ['./keyzone-state-dialog.component.scss']
})
export class KeyzoneStateDialogComponent implements OnInit, IKeyZoneStateDialogComponent {
	// Current KeyZone State
	public state: IKeyZoneState;

	// Current Price
	public currentPrice: number;

	// Visibility
	public visibleAbove: number;
	public hasMoreAbove: boolean;
	public visibleBelow: number;
	public hasMoreBelow: boolean;

	// Distances from price
	public aboveDistances: IKeyZoneDistance = {};
	public belowDistances: IKeyZoneDistance = {};

	constructor(
		public dialogRef: MatDialogRef<KeyzoneStateDialogComponent>,
		@Inject(MAT_DIALOG_DATA) private data: IKeyZonesStateDialogData,
		public _nav: NavService,
        private dialog: MatDialog,
		private _app: AppService,
		private _utils: UtilsService
	) { 
		this.state = this.data.state;
		this.currentPrice = this.data.currentPrice;
		if (this._app.layout.value == "desktop") {
			this.visibleAbove = this.state.active ? 3: 3;
			this.visibleBelow = this.state.active ? 3: 3;
		}else {
			this.visibleAbove = this.state.active ? 1: 2;
			this.visibleBelow = this.state.active ? 1: 2;
		}
		this.hasMoreAbove = this.state.above.length > this.visibleAbove;
		this.hasMoreBelow = this.state.below.length > this.visibleBelow;
		this.calculateDistances();
	}

	ngOnInit(): void {
	}





	/**
	 * Calculates the distance between the current price and 
	 * each zone above & below.
	 */
	private calculateDistances(): void {
		// Calculate distances for the zones above
		this.state.above.forEach((kz) => {
			this.aboveDistances[kz.id] = <number>this._utils.calculatePercentageChange(this.currentPrice, kz.s) 
		});

		// Calculate distances for the zones below
		this.state.below.forEach((kz) => {
			this.belowDistances[kz.id] = <number>this._utils.calculatePercentageChange(this.currentPrice, kz.e) 
		});
	}





	/**
	 * Displays more keyzones for a given end.
	 * @param above 
	 */
	public showMore(above?: boolean): void {
		if (above) {
			this.visibleAbove = this.state.above.length;
			this.hasMoreAbove = false;
		} else {
			this.visibleBelow = this.state.below.length;
			this.hasMoreBelow = false;
		}
	}










	/* Misc Helpers */




	/**
	 * Opens the reversals dialog.
	 * @param reversals 
	 */
	public displayReversals(reversals: IReversal[]): void {
		this.dialog.open(KeyzoneReversalsDialogComponent, {
			hasBackdrop: this._app.layout.value != "mobile", // Mobile optimization
			panelClass: "small-dialog",
			data: reversals
		})
	}




	/*
	* Closes the dialog.
	* @returns void
	* */
	public close(): void { this.dialogRef.close() }
}
