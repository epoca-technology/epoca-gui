import { Component, OnInit } from '@angular/core';
import {MatDialog, MatDialogRef} from "@angular/material/dialog";
import { IKeyZoneFullState, IReversal, MarketStateService, UtilsService } from '../../../core';
import { AppService, NavService } from '../../../services';
import { KeyzoneReversalsDialogComponent } from './keyzone-reversals-dialog';
import { IKeyZoneDistance, IKeyZonesDialogComponent } from './interfaces';

@Component({
  selector: 'app-keyzones-dialog',
  templateUrl: './keyzones-dialog.component.html',
  styleUrls: ['./keyzones-dialog.component.scss']
})
export class KeyzonesDialogComponent implements OnInit, IKeyZonesDialogComponent {
	// Full State
	public state!: IKeyZoneFullState;

	// Current Price
	public currentPrice!: number;

	// Visibility
	public visibleAbove!: number;
	public hasMoreAbove!: boolean;
	public visibleBelow!: number;
	public hasMoreBelow!: boolean;

	// Distances from price
	public aboveDistances: IKeyZoneDistance = {};
	public belowDistances: IKeyZoneDistance = {};

	// Load state
	public loaded: boolean = false;


	constructor(
		public dialogRef: MatDialogRef<KeyzonesDialogComponent>,
		public _nav: NavService,
		public _app: AppService,
		public _ms: MarketStateService,
		private dialog: MatDialog,
		private _utils: UtilsService
	) { }

	async ngOnInit(): Promise<void> {
		try {
			this.state = await this._ms.calculateKeyZoneState();
			this.currentPrice = this._app.marketState.value!.window.w[this._app.marketState.value!.window.w.length - 1].c;
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
		} catch (e) { this._app.error(e) }
		this.loaded = true;
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






	/**
	 * Displays the Signal Module Tooltip.
	 */
	public displayTooltip(): void {
        this._nav.displayTooltip("KeyZones", [
			`@TODO`,
        ]);
	}





	// Close Dialog
	public close(): void { this.dialogRef.close() }
}
