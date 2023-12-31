import { Component, OnInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import {MatDialog, MatDialogRef} from "@angular/material/dialog";
import { Subscription } from 'rxjs';
import { 
    ICoin, 
    ICoinsObject, 
    ICoinsScores, 
    ICoinsSummary, 
    MarketStateService, 
    UtilsService 
} from '../../../../core';
import { AppService, ILayout, NavService } from '../../../../services';
import { ICoinsDialogComponent } from './interfaces';
import { CoinsConfigurationDialogComponent } from './coins-configuration-dialog';

@Component({
  selector: 'app-coins-dialog',
  templateUrl: './coins-dialog.component.html',
  styleUrls: ['./coins-dialog.component.scss']
})
export class CoinsDialogComponent implements OnInit, OnDestroy, ICoinsDialogComponent {
    // Input
    @ViewChild("installedSearchControl") installedSearchControl? : ElementRef;
    @ViewChild("availableSearchControl") availableSearchControl? : ElementRef;

	// Layout
	public layout: ILayout = this._app.layout.value;
    private layoutSub?: Subscription;

	// Coins
	public installed: ICoinsObject = {};
	public installedNum: number = 0;
	public supported: ICoinsObject = {};
	public available: ICoinsObject = {};
	public availableNum: number = 0;
	public installedUnsupported: {[symbol: string]: boolean} = {};
	public scores!: ICoinsScores;

	// Search
	public installedSearch: string = "";
	public installedSearchVisible: boolean = false;
	public availableSearch: string = "";
	public availableSearchVisible: boolean = true;

	// Tabs
	public activeTab: number = 0;

	// Load state
	public loaded: boolean = false;


	constructor(
		public dialogRef: MatDialogRef<CoinsDialogComponent>,
		public _nav: NavService,
		public _app: AppService,
		public _ms: MarketStateService,
		private dialog: MatDialog,
		private _utils: UtilsService
	) { }

	async ngOnInit(): Promise<void> {
        this.layoutSub = this._app.layout.subscribe((nl: ILayout) => this.layout = nl);
		try {
			const summary: ICoinsSummary = await this._ms.getCoinsSummary();
			this.updateCoins(summary);
		} catch (e) { this._app.error(e) }
		this.loaded = true;
	}



    ngOnDestroy(): void {
        if (this.layoutSub) this.layoutSub.unsubscribe();
    }




	/***************
	 * API Actions *
	 ***************/







    /**
     * Prompts the confirmation dialog and if confirmed, it will install
	 * the coin into the system
     */
	public installCoin(coin: ICoin): void {
		this._nav.displayConfirmationDialog({
			title: `Install ${this._ms.getBaseAssetName(coin.symbol)}`,
			content: `
				<p><strong>Symbol:</strong> ${coin.symbol}</p>
				<p><strong>Price Precision:</strong> ${coin.pricePrecision}</p>
				<p><strong>Quantity Precision:</strong> ${coin.quantityPrecision}</p>
				<p><strong>Score:</strong> ${this.scores[coin.symbol]}/5</p>
				<p class='margin-top ts-s light-text'>
					Before proceeding, ensure the coin's <strong>margin mode</strong> is set to "Isolated" and the 
					<strong>leverage</strong> matches the value in the Trading Strategy.
				</p>
			`,
			otpConfirmation: true
		}).afterClosed().subscribe(
			async (otp: string|undefined) => {
				if (otp) {
					// Set Submission State
					this.loaded = false;
					try {
						// Install the coin
						const sum: ICoinsSummary = await this._ms.installCoin(coin.symbol, otp);
						this.updateCoins(sum);

						// Notify
						this.installedSearch = "";
						this.availableSearch = "";
						this._app.success(`The coin ${coin.symbol} has been installed successfully.`);
						//this.activeTab = 0;
					} catch(e) { this._app.error(e) }

					// Set Submission State
					this.loaded = true;
				}
			}
		);
    }








    /**
     * Prompts the confirmation dialog and if confirmed, it will uninstall
	 * the coin from the system
     */
	public uninstallCoin(coin: ICoin): void {
		this._nav.displayConfirmationDialog({
			title: `Uninstall ${this._ms.getBaseAssetName(coin.symbol)}`,
			content: `
				<p><strong>Symbol:</strong> ${coin.symbol}</p>
				<p><strong>Price Precision:</strong> ${coin.pricePrecision}</p>
				<p><strong>Quantity Precision:</strong> ${coin.quantityPrecision}</p>
				<p><strong>Score:</strong> ${this.scores[coin.symbol]}/5</p>
			`,
			otpConfirmation: true
		}).afterClosed().subscribe(
			async (otp: string|undefined) => {
				if (otp) {
					// Set Submission State
					this.loaded = false;
					try {
						// Install the coin
						const sum: ICoinsSummary = await this._ms.uninstallCoin(coin.symbol, otp);
						this.updateCoins(sum);

						// Notify
						this.installedSearch = "";
						this.availableSearch = "";
						this._app.success(`The coin ${coin.symbol} has been uninstalled successfully.`);
					} catch(e) { this._app.error(e) }

					// Set Submission State
					this.loaded = true;
				}
			}
		);
    }







	/**
	 * Updates the local coins based on the summary.
	 * @param summary 
	 */
	private updateCoins(summary: ICoinsSummary): void {
		// Set the core objects
		this.installed = summary.installed;
		this.supported = summary.supported;
		this.scores = summary.scores;

		// Iterate over the installed symbols, looking for ones that have become unsupported
		this.installedUnsupported = {};
		for (let installedSymbol in this.installed) {
			if (!this.supported[installedSymbol]) {
				this.installedUnsupported[installedSymbol] = true;
			}
		}

		// Iterate over the supported symbols in order to determine the available ones
		this.available = {};
		for (let supportedSymbol in this.supported) {
			if (!this.installed[supportedSymbol]) {
				this.available[supportedSymbol] = this.supported[supportedSymbol];
			}
		}

		// Update the counts
		this.installedNum = Object.keys(this.installed).length;
		this.availableNum = Object.keys(this.available).length;
	}

	







	/**********
	 * Search *
	 **********/




	public activateInstalledSearch(): void {
		this.installedSearch = "";
		this.installedSearchVisible = true;
		if (this.layout != "mobile") {
			setTimeout(() => { if (this.installedSearchControl) this.installedSearchControl.nativeElement.focus() });
		}
	}

	public deactivateInstalledSearch(): void {
		this.installedSearch = "";
		this.installedSearchVisible = false;
	}




	public activateAvailableSearch(): void {
		this.availableSearch = "";
		this.availableSearchVisible = true;
		if (this.layout != "mobile") {
			setTimeout(() => { if (this.availableSearchControl) this.availableSearchControl.nativeElement.focus() });
		}
	}

	public deactivateAvailableSearch(): void {
		this.availableSearch = "";
		this.availableSearchVisible = false;
	}



	private deactivateSearch(): void {
		this.deactivateInstalledSearch();
		this.deactivateAvailableSearch();
	}














	/****************
	 * Misc Helpers *
	 ****************/






    /**
     * Displays the coins config form dialog.
     */
    public displayCoinsConfigurationDialog(): void {
		this.dialog.open(CoinsConfigurationDialogComponent, {
			hasBackdrop: this._app.layout.value != "mobile",
            disableClose: true,
			panelClass: "small-dialog",
            data: {}
		})
	}





	/**
	 * Displays the Signal Module Tooltip.
	 */
	public displayTooltip(): void {
        this._nav.displayTooltip("Coins", [
			`This module aims to have a deep understanding of the short-term price direction for the top cryptocurrencies. `,
			`Epoca establishes a WebSocket Connection to the "Mark Price" for all the installed cryptocurrencies and calculates their state on a real time basis for both rates, BTC and USDT. `,
			`The state is calculated the same way as it is for the Window Module. For more information, go to Dashboard/Window/Information.`,
            `Cryptocurrencies can be installed and uninstalled at any time. Additionally, there isn't a minimum or a maximum number of coins that can be managed by Epoca. However, it is recommended to only install coins that are dark green since those have the highest volume.`,
            `The configuration for this module can be fully tuned by clicking in the Configuration Button.`
        ]);
	}




	// Close Dialog
	public close(): void { this.dialogRef.close() }
}
