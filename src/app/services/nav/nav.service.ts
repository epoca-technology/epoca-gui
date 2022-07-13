import {Inject, Injectable} from '@angular/core';
import {Router, NavigationStart, NavigationEnd} from '@angular/router';
import {DOCUMENT} from "@angular/common";
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import {MatBottomSheet, MatBottomSheetRef} from '@angular/material/bottom-sheet';
import {BehaviorSubject, Observable} from "rxjs";
import {filter} from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { IKerasModelSummary, IModel, IPrediction } from '../../core';
import {AppService} from "../app";
import {ConfirmationDialogComponent, IConfirmationDialogData} from "../../shared/components/confirmation-dialog";
import {DataDialogComponent, IDataDialogData} from "../../shared/components/data-dialog";
import {DialogMenuComponent, IDialogMenuData, IDialogMenuItem} from "../../shared/components/dialog-menu";
import { ITooltipData, TooltipDialogComponent } from '../../shared/components/tooltip-dialog';
import { ModelSelectionDialogComponent } from '../../shared/components/prediction/model-selection-dialog';
import {
	IKerasModelDialogData, 
	KerasModelDialogComponent, 
	ModelDialogComponent, 
	ModelListDialogComponent,
	PredictionDialogComponent
} from "../../shared/components/prediction";
import {BottomSheetMenuComponent, IBottomSheetMenuItem} from "../../shared/components/bottom-sheet-menu";
import {INavService, IRouteState, IRouteStateData} from "./interfaces";






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
	public signIn(): Promise<boolean> { return this.navigate('auth/signIn') }
	public updatePassword(): Promise<boolean> { return this.navigate('auth/updatePassword') }
	public dashboard(): Promise<boolean> { return this.navigate('dashboard') }
	public tradingSessions(): Promise<boolean> { return this.navigate('tradingSessions') }
	public tradingSimulations(): Promise<boolean> { return this.navigate('tradingSimulations') }
	public forecastModels(): Promise<boolean> { return this.navigate('forecastModels') }
	public backtests(): Promise<boolean> { return this.navigate('predictionBacktesting/backtests') }
	public regressionSelection(): Promise<boolean> { return this.navigate('predictionBacktesting/regressionSelection') }
	public regressionTrainingCertificates(): Promise<boolean> { return this.navigate('predictionBacktesting/regressionTrainingCertificates') }
	public classificationTrainingData(): Promise<boolean> { return this.navigate('predictionBacktesting/classificationTrainingData') }
	public classificationTrainingCertificates(): Promise<boolean> { return this.navigate('predictionBacktesting/classificationTrainingCertificates') }
	public candlesticks(): Promise<boolean> { return this.navigate('candlesticks') }
	public server(): Promise<boolean> { return this.navigate('server') }
	public users(): Promise<boolean> { return this.navigate('users') }
	public guiVersion(version?: string): Promise<boolean> { 
        if (typeof version == "string") {
            return this.navigate(`guiVersion/${version}`);
        } else {
            return this.navigate('guiVersion');
        }
    }
	public ipBlacklist(): Promise<boolean> { return this.navigate('ipBlacklist') }


	
	
	
	
	
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
	* Opens the data dialog.
	* @param name
	* @param value
	* @returns MatDialogRef<any>
	* */
	public displayDataDialog(name: string, value: any): MatDialogRef<any> {
		return this.dialog.open(DataDialogComponent, {
			disableClose: false,
			hasBackdrop: this._app.layout.value != 'mobile', // Mobile optimization
			panelClass: 'large-dialog',
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
			hasBackdrop: this._app.layout.value != 'mobile', // Mobile optimization
			panelClass: 'small-dialog',
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
			panelClass: 'light-dialog',
			data: <ITooltipData> {
				title: title,
				content: content
			}
		});
	}



	
	


	
	
	/*
	* Opens the dialog that contains all information about a model.
	* @param model
	* @returns MatDialogRef<any>
	* */
	public displayModelDialog(model: IModel): MatDialogRef<any> {
		return this.dialog.open(ModelDialogComponent, {
			hasBackdrop: this._app.layout.value != 'mobile', // Mobile optimization
			panelClass: 'medium-dialog',
			data: model
		});
	}

	


	
	
	/*
	* Opens the dialog that contains all information about a list of models.
	* @param model
	* @returns MatDialogRef<any>
	* */
	public displayModelListDialog(models: IModel[]): MatDialogRef<any> {
		return this.dialog.open(ModelListDialogComponent, {
			hasBackdrop: this._app.layout.value != 'mobile', // Mobile optimization
			panelClass: 'medium-dialog',
			data: models
		});
	}







	/*
	* Opens the dialog that contains all information about a keras model.
	* @param id
	* @param description
	* @param kerasModel
	* @returns MatDialogRef<any>
	* */
	public displayKerasModelDialog(id: string, description: string, kerasModel: IKerasModelSummary): MatDialogRef<any> {
		return this.dialog.open(KerasModelDialogComponent, {
			hasBackdrop: this._app.layout.value != 'mobile', // Mobile optimization
			panelClass: 'medium-dialog',
			data: <IKerasModelDialogData>{
				id: id,
				description: description,
				summary: kerasModel
			}
		});
	}



	
	

	


	
	
	/*
	* Opens the dialog that contains all information about a prediction.
	* @param data
	* @returns MatDialogRef<any>
	* */
	public displayPredictionDialog(model: IModel, prediction: IPrediction): MatDialogRef<any> {
		return this.dialog.open(PredictionDialogComponent, {
			hasBackdrop: this._app.layout.value != 'mobile', // Mobile optimization
			panelClass: 'medium-dialog',
			data: {
				model: model,
				prediction: prediction
			}
		});
	}






	
	
	/*
	* Opens the dialog that contains the selected models
	* @returns MatDialogRef<any>
	* */
	public displayModelSelectionDialog(): MatDialogRef<any> {
		return this.dialog.open(ModelSelectionDialogComponent, {
			hasBackdrop: this._app.layout.value != 'mobile', // Mobile optimization
			panelClass: 'medium-dialog',
			data: {}
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
			let urlChunks: string[] = url.split('/');
			
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
			const el: HTMLElement|null = this.document.querySelector(container || '.mat-drawer-content');
			
			// If the element was found - scroll
			if (el) {
				el.scrollTop = 0
			} else {
				console.log('Error during scrollTop. Could not find the container element.');
			}
		} catch (e) { console.log(e) }
	}
}
