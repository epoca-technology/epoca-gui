import {Inject, Injectable} from "@angular/core";
import {Router, NavigationStart, NavigationEnd} from "@angular/router";
import {DOCUMENT} from "@angular/common";
import {MatDialog, MatDialogRef} from "@angular/material/dialog";
import {MatBottomSheet, MatBottomSheetRef} from "@angular/material/bottom-sheet";
import {BehaviorSubject, Observable} from "rxjs";
import {filter} from "rxjs/operators";
import { environment } from "../../../environments/environment";
import { IBinanceTradeExecutionPayload, } from "../../core";
import {AppService} from "../app";
import {
    BottomSheetMenuComponent, 
    IBottomSheetMenuItem
} from "../../shared/components/bottom-sheet-menu";
import {
    ConfirmationDialogComponent, 
    IConfirmationDialogData
} from "../../shared/components/confirmation-dialog";
import {DataDialogComponent, IDataDialogData} from "../../shared/components/data-dialog";
import {
    DialogMenuComponent, 
    IDialogMenuData, 
    IDialogMenuItem
} from "../../shared/components/dialog-menu";
import { ITooltipData, TooltipDialogComponent } from "../../shared/components/tooltip-dialog";
import { 
    IDateRangeConfig, 
    DateRangeFormDialogComponent 
} from "../../shared/components/date-range-form-dialog";
import { 
	PositionActionPayloadsDialogComponent, 
	PositionHeadlinesDialogComponent, 
	PositionRecordDialogComponent, 
	TradeExecutionPayloadDialogComponent 
} from "../../shared/components/positions";
import {INavService, IRouteState, IRouteStateData} from "./interfaces";






@Injectable({
	providedIn: "root"
})
export class NavService implements INavService {
	// Route Event Listeners
	private readonly navStartObservable: Observable<NavigationStart>;
	private readonly navEndObservable: Observable<NavigationEnd>;
	
	// Route State
	public routeState: BehaviorSubject<IRouteState>;
	
	
	constructor(
		private router: Router,
		private dialog: MatDialog,
		private bottomSheet: MatBottomSheet,
		private _app: AppService,
		@Inject(DOCUMENT) private document: Document,
	) {
		// Create Filtered Route Observables
		this.navStartObservable = router.events.pipe(
			filter(evt => evt instanceof NavigationStart)
		) as Observable<NavigationStart>;
		this.navEndObservable = router.events.pipe(
			filter(evt => evt instanceof NavigationEnd),
		) as Observable<NavigationEnd>;
		
		// Initialize the route state
		this.routeState = new BehaviorSubject<IRouteState>({navigating: false, module: null});
		
		// Subscribe & emmit route changes
		this.navStartObservable.subscribe(() => { this.routeState.next(this.getRouteState(true)) });
		this.navEndObservable.subscribe(() => { this.routeState.next(this.getRouteState(false)) });
	}
	
	
	




	/* App Navigation */

	// Auth
	public signIn(): Promise<boolean> { return this.navigate("auth/signIn") }
	public updatePassword(): Promise<boolean> { return this.navigate("auth/updatePassword") }

	// Dashboard
	public dashboard(): Promise<boolean> { return this.navigate("dashboard") }

	// Adjustments
	public adjustments(): Promise<boolean> { return this.navigate("adjustments") }

	// Transactions
	public transactions(): Promise<boolean> { return this.navigate("transactions") }

	// Candlesticks
	public candlesticks(): Promise<boolean> { return this.navigate("candlesticks") }

	// Server
	public server(): Promise<boolean> { return this.navigate("server") }

	// Users
	public users(): Promise<boolean> { return this.navigate("users") }

	// GUI Version
	public guiVersion(version?: string): Promise<boolean> { return this.navigate("guiVersion") }

	// IP Blacklist
	public ipBlacklist(): Promise<boolean> { return this.navigate("ipBlacklist") }
	
	// Local Database
	public localDatabase(): Promise<boolean> { return this.navigate("localDatabase") }


	
	
	
	
	/*
	* Navigates to provided route using
	* the router service
	* @param path
	* @returns void
	*/
	public navigate(path: string): Promise<boolean> {
		return this.router.navigate([path]);
	}
	
	
	
	
	

	
	
	
	
	
	

	
	
	
	/* Dialogs */
	
	
	
	
	
	/*
	* Opens the confirmation dialog.
	* @param data?
	* @returns MatDialogRef<any>
	* */
	public displayConfirmationDialog(data?: IConfirmationDialogData): MatDialogRef<any> {
		return this.dialog.open(ConfirmationDialogComponent, {
			disableClose: true,
			hasBackdrop: this._app.layout.value != "mobile", // Mobile optimization
			panelClass: "small-dialog",
			data: data
		});
	}

	
	



		
	
	/*
	* Opens the data dialog.
	* @param name
	* @param value
	* @returns MatDialogRef<any>
	* */
	public displayDataDialog(name: string, value: any): MatDialogRef<any> {
		return this.dialog.open(DataDialogComponent, {
			disableClose: false,
			hasBackdrop: this._app.layout.value != "mobile", // Mobile optimization
			panelClass: "large-dialog",
			data: <IDataDialogData> {
				name: name,
				value: value
			}
		});
	}






	/*
	* Opens the dialog menu.
	* @param title
	* @param items
	* @returns MatDialogRef<any>
	* */
	public displayDialogMenu(title: string, items: IDialogMenuItem[]): MatDialogRef<any> {
		return this.dialog.open(DialogMenuComponent, {
			disableClose: true,
			hasBackdrop: this._app.layout.value != "mobile", // Mobile optimization
			panelClass: "small-dialog",
			data: <IDialogMenuData> {
				title: title,
				items: items
			}
		});
	}






	/*
	* Opens the tooltips dialog.
	* @param title
	* @param content
	* @returns any
	* */
	public displayTooltip(title: string, content: string|string[]): MatDialogRef<any> {
		return this.dialog.open(TooltipDialogComponent, {
			disableClose: false,
			hasBackdrop: true,
			panelClass: "light-dialog",
			data: <ITooltipData> {
				title: title,
				content: content
			}
		});
	}

	
	
	





	/*
	* Opens the position headlines dialog.
	* @param data?
	* @returns MatDialogRef<any>
	* */
	public displayPositionHeadlinesDialog(range?: IDateRangeConfig): MatDialogRef<any> {
		return this.dialog.open(PositionHeadlinesDialogComponent, {
			hasBackdrop: this._app.layout.value != "mobile", // Mobile optimization
			panelClass: "medium-dialog",
			data: range
		});
	}







	/*
	* Opens the dialog that contains the full position record
	* @param id
	* @returns MatDialogRef<any>
	* */
	public displayPositionRecordDialog(id: string): MatDialogRef<any> {
		return this.dialog.open(PositionRecordDialogComponent, {
			hasBackdrop: this._app.layout.value != "mobile", // Mobile optimization
			panelClass: "large-dialog",
			data: id
		});
	}







	/*
	* Opens the trade execution payload list dialog.
	* @param data?
	* @returns MatDialogRef<any>
	* */
	public displayTradeExecutionPayloadListDialog(range?: IDateRangeConfig): MatDialogRef<any> {
		return this.dialog.open(PositionActionPayloadsDialogComponent, {
			hasBackdrop: this._app.layout.value != "mobile", // Mobile optimization
			panelClass: "small-dialog",
			data: range
		});
	}






	/*
	* Opens the dialog that contains a trade execution payload.
	* @param payload
	* @returns MatDialogRef<any>
	* */
	public displayTradeExecutionPayloadDialog(
        payload: IBinanceTradeExecutionPayload
    ): MatDialogRef<any> {
		return this.dialog.open(TradeExecutionPayloadDialogComponent, {
			hasBackdrop: this._app.layout.value != "mobile", // Mobile optimization
			panelClass: "small-dialog",
			data: payload
		});
	}










	/* Date Range Helper */

	


	/*
	* Opens the date range dialog.
	* @param data?
	* @returns MatDialogRef<any>
	* */
	public displayDateRangeDialog(data?: IDateRangeConfig): MatDialogRef<any> {
		return this.dialog.open(DateRangeFormDialogComponent, {
			disableClose: true,
			hasBackdrop: this._app.layout.value != "mobile", // Mobile optimization
			panelClass: "small-dialog",
			data: data
		});
	}






	/**
	 * Calculates the date range of the history based
	 * on the range id.
	 * @param data
	 * @returns {startAt: number, endAt: number}
	 */
	public calculateDateRange(data?: IDateRangeConfig): Promise<IDateRangeConfig|undefined> { 
		return new Promise((resolve, reject) => {
			this.displayDateRangeDialog(data).afterClosed().subscribe(
				(response) => {
					if (response) {
						resolve(response);
					} else {
						resolve(undefined)
					}
				}
			);
		});
	}






	
	
	/* Bottom Sheets */
	
	
	
	
	
	
	
	/*
	* Opens the notifications dialog.
	* @param uid
	* @returns MatDialogRef<any>
	* */
	public displayBottomSheetMenu(items: IBottomSheetMenuItem[]): MatBottomSheetRef<any> {
		return this.bottomSheet.open(BottomSheetMenuComponent, {
			panelClass: "bottom-sheet-container",
			data: items
		});
	}
	
	
	
	
	
	






    /* URL Openers */
	

	// Prediction Model Certificate
	public openPredictionModelCertificate(modelID: string): void {
		this.openUrl(`${window.location.origin}/epochBuilder/predictionModels/${modelID}`);
	}




	// Regression Certificate
	public openRegressionCertificate(modelID: string): void {
		this.openUrl(`${window.location.origin}/epochBuilder/regressions/${modelID}`);
	}
	
	

    // PG ADMIN
    public openPGAdmin(): void { 
        if (environment.localServer) {
            this.openUrl(environment.pgAdmin.local);
        } else {
            this.openUrl(environment.pgAdmin.external);
        }
    }
	
	
	

    // DOZZLE
    public openDozzle(): void { 
        if (environment.localServer) {
            this.openUrl(environment.dozzle.local);
        } else {
            this.openUrl(environment.dozzle.external);
        }
    }
	
	
	
	
	
	
	/* Main URL Opener */
	
	
	
	
	
	
	/*
	* Opens a URL on a new
	* tab
	* @param url
	* @returns void
	* */
	public openUrl(url: string): void {
		window.open(url, "_blank");
	}
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	/* Route State Helpers */
	
	
	
	/*
	* Retrieves the current
	* active module.
	* @param navigating
	* @returns void
	* */
	private getRouteState(navigating: boolean): IRouteState {
		// Init the current state
		let state: IRouteState = this.routeState.value;
		state.navigating = navigating;
		
		// Build the data if it isnt navigating
		if (!navigating) {
			// Retrieve the data
			const {module, subModule} = this.getRouteStateData();
			state.module = module;
			state.subModule = subModule;
		}
		
		// Return the final object
		return state;
	}
	
	
	
	
	
	
	
	/*
	* Retrieves the route state
	* data.
	* @returns IRouteStateData
	* */
	private getRouteStateData(): IRouteStateData {
		// Init the URL
		const url: string = this.router.url;
		
		// Build the data accordingly
		if (typeof url == "string" && url.length) {
			// Split the url in chunks
			let urlChunks: string[] = url.split("/");
			
			// Remove white spaces
			urlChunks = urlChunks.filter(item => item.length !== 0);
			
			// Handle the case based on the chunks
			if (urlChunks.length > 0) {
				return {module: urlChunks[0], subModule: urlChunks[1]};
			} else {
				return {module: null}
			}
		} else {
			return {module: null}
		}
	}
	
	
	
	

	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	/* App Reloader */
	
	
	
	
	/*
	* Reloads the entire app
	* from the window
	* @returns void
	* */
	public reloadApp(): void {
		window.location.reload();
	}
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	/* Scroll Helpers */
	
	
	
	
	
	/*
	* Scrolls the app to desired
	* height.
	* @param top
	* @param container
	* @returns void
	* */
	public scrollTop(container?: string): void {
		try {
			// Retrieve the element
			const el: HTMLElement|null = 
                this.document.querySelector(container || ".mat-drawer-content");
			
			// If the element was found - scroll
			if (el) {
				el.scrollTop = 0
			} else {
				console.log("Error during scrollTop. Could not find the container element.");
			}
		} catch (e) { console.log(e) }
	}
}
