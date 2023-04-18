import { Component, OnInit, OnDestroy } from '@angular/core';
import {MatDialog, MatDialogRef} from "@angular/material/dialog";
import * as moment from "moment";
import { Subscription } from 'rxjs';
import { 
	IKeyZone, 
	IKeyZoneFullState, 
	IMarketState, 
	IMinifiedKeyZone, 
	MarketStateService, 
	UtilsService 
} from '../../../../core';
import { AppService, ILayout, NavService } from '../../../../services';
import { KeyzoneDetailsDialogComponent } from './keyzone-details-dialog';
import { LiquidityDialogComponent } from './liquidity-dialog';
import { KeyzonesPriceSnapshotsDialogComponent } from './keyzones-price-snapshots-dialog';
import { KeyzonesEventsDialogComponent } from './keyzones-events-dialog';
import { IKeyZoneDistance, IKeyZonesDialogComponent } from './interfaces';

@Component({
  selector: 'app-keyzones-dialog',
  templateUrl: './keyzones-dialog.component.html',
  styleUrls: ['./keyzones-dialog.component.scss']
})
export class KeyzonesDialogComponent implements OnInit, OnDestroy, IKeyZonesDialogComponent {
	// Layout
	public layout: ILayout = this._app.layout.value;

	// Market State
	public marketState!: IMarketState;
	public reversedKeyZonesAbove: IMinifiedKeyZone[] = [];
	public scoresAbove: {[keyzoneID: number]: number} = {};
	public distancesAbove: {[keyzoneID: number]: number} = {};
	public scoresBelow: {[keyzoneID: number]: number} = {};
	public distancesBelow: {[keyzoneID: number]: number} = {};
	private marketStateSub!: Subscription;

	// Full State
	public state?: IKeyZoneFullState;
	public loadingState: boolean = false;

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
        this.marketStateSub = this._app.marketState.subscribe((state: IMarketState|undefined|null) => {
            if (state) {
                this.marketState = state;
				const currentPrice: number = this.marketState.window.w[this.marketState.window.w.length - 1].c;
				this.scoresAbove = {};
				this.scoresBelow = {};
				if (this.marketState.keyzones.above && this.marketState.keyzones.above.length) {
					for (let resistance of this.marketState.keyzones.above) {
						this.scoresAbove[resistance.id] = Math.ceil(resistance.scr * 10);
						this.distancesAbove[resistance.id] = <number>this._utils.calculatePercentageChange(currentPrice, resistance.s);
					}
					let keyzonesAbove: IMinifiedKeyZone[] = this.marketState.keyzones.above.slice();
					keyzonesAbove.reverse();
					this.reversedKeyZonesAbove = keyzonesAbove;
				}
				if (this.marketState.keyzones.below && this.marketState.keyzones.below.length) {
					for (let support of this.marketState.keyzones.below) {
						this.scoresBelow[support.id] = Math.ceil(support.scr * 10);
						this.distancesBelow[support.id] = <number>this._utils.calculatePercentageChange(currentPrice, support.e);
					}
				}
				this.loaded = true;
            }
        });
	}


	ngOnDestroy(): void {
		if (this.marketStateSub) this.marketStateSub.unsubscribe();
	}






	/* Tab Management */





	/**
	 * Triggers whenever the tab changes. If the full state
	 * tab is activated and the data has not been yet loaded,
	 * it does so.
	 * @param newIndex 
	 * @returns Promise<void>
	 */
	public async tabChanged(newIndex: number): Promise<void> {
		this.activeTab = newIndex;
		if (newIndex == 1 && !this.state) {
			await this.loadKeyZonesFullState();
		}
	}










	/* KeyZone Full State */





	/**
	 * Loads the keyzones full state.
	 * @returns Promise<void>
	 */
	private async loadKeyZonesFullState(): Promise<void> {
		this.loadingState = true;
		try {
			this.state = await this._ms.calculateKeyZoneState();
			this.currentPrice = this.marketState.window.w[this.marketState.window.w.length - 1].c;
			this.pageSize = this.layout == "desktop" ? 10: 7;
			this.visibleAbove = this.pageSize;
			this.visibleBelow = this.pageSize;
			this.hasMoreAbove = this.state.above.length > this.visibleAbove;
			this.hasMoreBelow = this.state.below.length > this.visibleBelow;
			this.calculateDistances();
		} catch (e) {
			this._app.error(e);
		}
		this.loadingState = false;
	}





	/**
	 * Calculates the distance between the current price and 
	 * each zone above & below.
	 */
	private calculateDistances(): void {
		// Calculate distances for the zones above
		this.state!.above.forEach((kz) => {
			this.aboveDistances[kz.id] = <number>this._utils.calculatePercentageChange(this.currentPrice, kz.s) 
		});

		// Calculate distances for the zones below
		this.state!.below.forEach((kz) => {
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
			this.hasMoreAbove = this.state!.above.length > this.visibleAbove;
		} else {
			this.visibleBelow = this.visibleBelow + increment;
			this.hasMoreBelow = this.state!.below.length > this.visibleBelow;
		}
	}




















	/* Misc Helpers */




	/**
	 * Displays the Info Tooltip.
	 */
	public displayStateKeyZoneTooltip(keyzone: IMinifiedKeyZone, kind: "above"|"below"): void {
		const zoneSize: number = <number>this._utils.calculatePercentageChange(keyzone.s, keyzone.e);
		let title: string = kind == "above" ? "Resistance": "Support";
		this._nav.displayTooltip(`${title}: ${keyzone.scr}/10`, [
			`ID: ${keyzone.id}`,
			`${moment(keyzone.id).format("dddd, MMMM Do, h:mm:ss a")}`,
			`-----`,
			`RANGE ${zoneSize}%`,
			`$${this._utils.formatNumber(keyzone.s)} - $${this._utils.formatNumber(keyzone.e)}`,
			`-----`,
			`VOL. INTENSITY: ${keyzone.vi}/4`,
			`-----`,
			`LIQ. SHARE: ${keyzone.ls}%`,
		]);
	}




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
	 * Displays the price snapshots dialog.
	 */
	public async displayPriceSnapshotsDialog(): Promise<void> {
		if (!this.state) await this.loadKeyZonesFullState();
		if (!this.state) return;
		this.dialog.open(KeyzonesPriceSnapshotsDialogComponent, {
			hasBackdrop: true, // Mobile optimization
			panelClass: "light-dialog",
			data: this.state!.price_snapshots
		})
	}





	/**
	 * Displays the liquidity dialog.
	 */
	public displayLiquidityDialog(): void {
		this.dialog.open(LiquidityDialogComponent, {
			hasBackdrop: this._app.layout.value != "mobile", // Mobile optimization
			panelClass: "large-dialog",
			data: {}
		})
	}






	/**
	 * Displays the liquidity dialog.
	 */
	public displayKeyZoneEventsHistory(): void {
		this.dialog.open(KeyzonesEventsDialogComponent, {
			hasBackdrop: this._app.layout.value != "mobile", // Mobile optimization
			panelClass: "small-dialog",
			data: {}
		})
	}








	/**
	 * Displays the Info Tooltip.
	 */
	public async displayInfoTooltip(): Promise<void> {
		if (!this.state) await this.loadKeyZonesFullState();
		if (!this.state) return;
		// Init the content
		let content: string[] = [
			`BUILD`,
			`${moment(this.state!.build_ts).format("dddd, MMMM Do, h:mm:ss a")}`,
			`-----`,
			`IDLE KEYZONES`
        ];

		// Iterate over idle zones
		for (let zoneID in this.state!.idle) {
			content.push(`${zoneID}: ${moment(this.state!.idle[zoneID]).format("dddd, MMMM Do, h:mm:ss a")}`)
		}

		// Finally, display the info
        this._nav.displayTooltip("KeyZones", content);
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
