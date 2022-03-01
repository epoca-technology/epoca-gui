import {Inject, Injectable} from '@angular/core';
import {Router, NavigationStart, NavigationEnd} from '@angular/router';
import {DOCUMENT} from "@angular/common";
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import {MatBottomSheet, MatBottomSheetRef} from '@angular/material/bottom-sheet';
import {BehaviorSubject, Observable} from "rxjs";
import {filter} from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import {AppService} from "../app";
import {RecaptchaDialogComponent} from "../../shared/components/recaptcha-dialog";
import {ConfirmationDialogComponent, IConfirmationDialogData} from "../../shared/components/confirmation-dialog";
import {BottomSheetMenuComponent, IBottomSheetMenuItem} from "../../shared/components/bottom-sheet-menu";
import {INavService, IRouteState, IRouteStateData, INavRequirements} from "./interfaces";






@Injectable({
	providedIn: 'root'
})
export class NavService implements INavService {
	// Route Event Listeners
	private readonly navStartObservable: Observable<NavigationStart>;
	private readonly navEndObservable: Observable<NavigationEnd>;
	
	// Route State
	public routeState: BehaviorSubject<IRouteState>;
	
	// Requirements
    public readonly requirements: INavRequirements = {
        dashboard: 1,
        tradingSessions: 3,
        tradingSimulations: 2,
        mlModels: 3,
        candlesticks: 3,
        apiErrors: 3,
        server: 3,
        users: 5,
        database: 4,
        guiVersion: 1,
        PGAdmin: 3,
        Dozzle: 3,
        settings: 1,
    }
	
	
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
	public signIn(): Promise<boolean> { return this.navigate('auth/signIn') }
	public updatePassword(): Promise<boolean> { return this.navigate('auth/updatePassword') }
	public dashboard(): Promise<boolean> { return this.navigate('dashboard') }
	public tradingSessions(): Promise<boolean> { return this.navigate('tradingSessions') }
	public tradingSimulations(): Promise<boolean> { return this.navigate('tradingSimulations') }
	public mlModels(): Promise<boolean> { return this.navigate('mlModels') }
	public candlesticks(): Promise<boolean> { return this.navigate('candlesticks') }
	public apiErrors(): Promise<boolean> { return this.navigate('apiErrors') }
	public server(): Promise<boolean> { return this.navigate('server') }
	public users(): Promise<boolean> { return this.navigate('users') }
	public database(): Promise<boolean> { return this.navigate('database') }
	public guiVersion(version?: string): Promise<boolean> { 
        if (typeof version == "string") {
            return this.navigate(`guiVersion/${version}`);
        } else {
            return this.navigate('guiVersion');
        }
    }
	public ipBlacklist(): Promise<boolean> { return this.navigate('ipBlacklist') }
	public settings(): Promise<boolean> { return this.navigate('settings') }


	
	
	
	
	
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
			hasBackdrop: this._app.layout.value != 'mobile', // Mobile optimization
			panelClass: 'small-dialog',
			data: data
		});
	}

	
	


	
	
	
	/*
	* Opens the reCAPTCHA dialog.
	* @returns MatDialogRef<any>
	* */
	public displayRecaptchaDialog(): MatDialogRef<any> {
		return this.dialog.open(RecaptchaDialogComponent, {
			disableClose: true,
			hasBackdrop: this._app.layout.value != 'mobile', // Mobile optimization
			panelClass: 'small-dialog'
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
			panelClass: 'bottom-sheet-container',
			data: items
		});
	}
	
	
	
	
	
	






    /* URL Openers */
	
	
	

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
			const data: IRouteStateData = this.getRouteStateData();
			state.module = data.module;
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
			let urlChunks: string[] = url.split('/');
			
			// Remove white spaces
			urlChunks = urlChunks.filter(item => item.length !== 0);
			
			// Handle the case based on the chunks
			if (urlChunks.length > 0) {
				return {module: urlChunks[0]};
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
	public scrollTop(top: number = 0, container: string = '.mat-drawer-content'): void {
		try {
			// Retrieve the element
			let el: HTMLElement|null = this.document.querySelector(container);
			
			// If the element was found - scroll
			if (el) {
				el.scrollTop = 0
			} else {
				console.log('Error during scrollTop. Could not find the container element.');
			}
		} catch (e) { console.log(e) }
	}
}
