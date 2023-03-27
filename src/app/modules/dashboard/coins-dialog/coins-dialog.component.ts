import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import {MatDialog, MatDialogRef} from "@angular/material/dialog";
import { ICoin, ICoinsObject, ICoinsScores, ICoinsSummary, MarketStateService, UtilsService } from '../../../core';
import { AppService, ILayout, NavService } from '../../../services';
import { ICoinsDialogComponent } from './interfaces';

@Component({
  selector: 'app-coins-dialog',
  templateUrl: './coins-dialog.component.html',
  styleUrls: ['./coins-dialog.component.scss']
})
export class CoinsDialogComponent implements OnInit, ICoinsDialogComponent {
    // Input
    @ViewChild("installedSearchControl") installedSearchControl? : ElementRef;
    @ViewChild("availableSearchControl") availableSearchControl? : ElementRef;

	// Layout
	public layout: ILayout = this._app.layout.value;

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
		try {
			const summary: ICoinsSummary = await this._ms.getCoinsSummary();
			this.updateCoins(summary);
		} catch (e) { this._app.error(e) }
		this.loaded = true;
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
	 * Displays the Signal Module Tooltip.
	 */
	public displayTooltip(): void {
        this._nav.displayTooltip("Coins", [
			`@TODO`,
        ]);
	}




	// Close Dialog
	public close(): void { this.dialogRef.close() }
}
