import {Inject, Injectable} from '@angular/core';
import {Router, NavigationStart, NavigationEnd} from '@angular/router';
import {DOCUMENT} from "@angular/common";
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import {MatBottomSheet, MatBottomSheetRef} from '@angular/material/bottom-sheet';
import {INavService, IRouteState, IRouteStateData} from "./interfaces";
import {BehaviorSubject, Observable} from "rxjs";
import {filter} from 'rxjs/operators';
import {AppService} from "../app";
import {RecaptchaDialogComponent} from "../../shared/components/recaptcha-dialog";
import {ConfirmationDialogComponent, IConfirmationDialogData} from "../../shared/components/confirmation-dialog";
import {BottomSheetMenuComponent, IBottomSheetMenuItem} from "../../shared/components/bottom-sheet-menu";






@Injectable({
	providedIn: 'root'
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
	public dashboard(): Promise<boolean> { return this.navigate('dashboard') }
	public server(): Promise<boolean> { return this.navigate('server') }
	public priceChart(): Promise<boolean> { return this.navigate('priceChart') }


	
	
	
	
	
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
