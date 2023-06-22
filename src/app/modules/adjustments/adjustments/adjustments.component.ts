import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { AppService, ChartService, ILayout, NavService } from "../../../services";
import { WindowConfigurationDialogComponent } from "./window-configuration-dialog";
import { KeyzonesConfigFormDialogComponent } from './keyzones-config-form-dialog';
import { LiquidityConfigurationDialogComponent } from './liquidity-configuration-dialog';
import { CoinsDialogComponent } from './coins-dialog';
import { ReversalConfigDialogComponent } from './reversal-config-dialog';
import { StrategyFormDialogComponent } from './strategy-form-dialog';
import { IAdjustmentsComponent } from './interfaces';

@Component({
  selector: 'app-adjustments',
  templateUrl: './adjustments.component.html',
  styleUrls: ['./adjustments.component.scss']
})
export class AdjustmentsComponent implements OnInit, OnDestroy, IAdjustmentsComponent {
	// Layout
	public layout: ILayout = this._app.layout.value;
	private layoutSub?: Subscription;


    constructor(
        public _nav: NavService,
        private _chart: ChartService,
        private dialog: MatDialog,
        private _app: AppService,
    ) { }

    ngOnInit(): void {
        // Initialize layout
        this.layoutSub = this._app.layout.subscribe((nl: ILayout) => this.layout = nl);
    }


    ngOnDestroy(): void {
        if (this.layoutSub) this.layoutSub.unsubscribe();
    }





    /**
     * Displays the window config form dialog.
     */
    public displayWindowConfigFormDialog(): void {
        this.dialog.open(WindowConfigurationDialogComponent, {
            hasBackdrop: this._app.layout.value != "mobile",
            disableClose: true,
            panelClass: "small-dialog",
            data: {}
        })
    }






    /**
     * Displays the keyzones config form dialog.
     */
    public displayKeyZonesConfigFormDialog(): void {
		this.dialog.open(KeyzonesConfigFormDialogComponent, {
			hasBackdrop: this._app.layout.value != "mobile",
            disableClose: true,
			panelClass: "small-dialog",
            data: {}
		})
	}







    /**
     * Displays the liquidity config form dialog.
     */
    public displayLiquidityConfigFormDialog(): void {
		this.dialog.open(LiquidityConfigurationDialogComponent, {
			hasBackdrop: this._app.layout.value != "mobile",
            disableClose: true,
			panelClass: "small-dialog",
            data: {}
		})
	}




	/**
	 * Displays the Coins dialog.
	 */
    public displayCoinsDialog(): void {
		this.dialog.open(CoinsDialogComponent, {
			hasBackdrop: this._app.layout.value != "mobile",
            disableClose: true,
			panelClass: "large-dialog"
		})
	}





	/**
	 * Displays the Reversal dialog.
	 */
    public displayReversalConfigDialog(): void {
		this.dialog.open(ReversalConfigDialogComponent, {
			hasBackdrop: this._app.layout.value != "mobile",
            disableClose: true,
			panelClass: "small-dialog",
            data: {}
		})
	}






    /**
     * Displays the strategy form dialog.
     */
    public displayStrategyFormDialog(): void {
		this.dialog.open(StrategyFormDialogComponent, {
			hasBackdrop: this._app.layout.value != "mobile",
            disableClose: true,
			panelClass: "small-dialog",
            data: {}
		})
	}

}
