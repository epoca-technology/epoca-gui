import { Component, OnInit } from '@angular/core';
import {MatDialog, MatDialogRef} from "@angular/material/dialog";
import * as moment from "moment";
import { IKeyZone, IKeyZoneFullState, MarketStateService, UtilsService } from '../../../core';
import { AppService, ILayout, NavService } from '../../../services';
import { KeyzoneDetailsDialogComponent } from './keyzone-details-dialog';
import { IKeyZoneDistance, IKeyZonesDialogComponent } from './interfaces';
import { LiquidityDialogComponent } from './liquidity-dialog';

@Component({
  selector: 'app-keyzones-dialog',
  templateUrl: './keyzones-dialog.component.html',
  styleUrls: ['./keyzones-dialog.component.scss']
})
export class KeyzonesDialogComponent implements OnInit, IKeyZonesDialogComponent {
	// Layout
	public layout: ILayout = this._app.layout.value;

	// Full State
	public state!: IKeyZoneFullState;

	// Current Price
	public currentPrice!: number;

	// Visibility
	private pageSize!: number;
	public visibleAbove!: number;
	public hasMoreAbove!: boolean;
	public visibleBelow!: number;
	public hasMoreBelow!: boolean;

	// Distances from price
	public aboveDistances: IKeyZoneDistance = {};
	public belowDistances: IKeyZoneDistance = {};

	// Tabs
	public activeTab: number = 0;

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
			this.pageSize = this.layout == "desktop" ? 11: 7;
			this.visibleAbove = this.pageSize;
			this.visibleBelow = this.pageSize;
			this.hasMoreAbove = this.state.above.length > this.visibleAbove;
			this.hasMoreBelow = this.state.below.length > this.visibleBelow;
			this.calculateDistances();
		} catch (e) { this._app.error(e) }
		this.loaded = true;
	}








	/* Tab Management */




	public async tabChanged(newIndex: number): Promise<void> { 
		this.activeTab = newIndex;
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
		const increment: number = this.pageSize * 2;
		if (above) {
			this.visibleAbove = this.visibleAbove + increment;
			this.hasMoreAbove = this.state.above.length > this.visibleAbove;
		} else {
			this.visibleBelow = this.visibleBelow + increment;
			this.hasMoreBelow = this.state.below.length > this.visibleBelow;
		}
	}




















	/* Misc Helpers */







	/**
	 * Opens the reversals dialog.
	 * @param zone 
	 */
	public displayKeyZone(zone: IKeyZone): void {
		this.dialog.open(KeyzoneDetailsDialogComponent, {
			hasBackdrop: this._app.layout.value != "mobile", // Mobile optimization
			panelClass: "small-dialog",
			data: zone
		})
	}





	/**
	 * Displays the liquidity dialog.
	 */
	public displayLiquidityDialog(): void {
		this.dialog.open(LiquidityDialogComponent, {
			hasBackdrop: this._app.layout.value != "mobile", // Mobile optimization
			panelClass: "medium-dialog",
			data: {}
		})
	}







	/**
	 * Displays the Info Tooltip.
	 */
	public displayInfoTooltip(): void {
        this._nav.displayTooltip("KeyZones", [
			`BUILD`,
			`${moment(this.state.build_ts).format("dddd, MMMM Do, h:mm:ss a")}`,
			`-----`,
			`VOLUME REQUIREMENTS`,
			`Mean Low: $${this._utils.formatNumber(this.state.volume_mean_low)}`,
			`Mean: $${this._utils.formatNumber(this.state.volume_mean)}`,
			`Mean Medium: $${this._utils.formatNumber(this.state.volume_mean_medium)}`,
			`Mean High: $${this._utils.formatNumber(this.state.volume_mean_high)}`,
        ]);
	}



	/**
	 * Displays the Keyzones Module Tooltip.
	 */
	public displayTooltip(): void {
        this._nav.displayTooltip("KeyZones", [
			`@TODO`,
        ]);
	}





	// Close Dialog
	public close(): void { this.dialogRef.close() }
}
