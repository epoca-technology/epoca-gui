import {BehaviorSubject} from "rxjs";
import {MatDialogRef} from "@angular/material/dialog";
import {MatBottomSheetRef} from "@angular/material/bottom-sheet";
import {IConfirmationDialogData} from "../../shared/components/confirmation-dialog";
import {IBottomSheetMenuItem} from "../../shared/components/bottom-sheet-menu";
import { IAuthority } from "../../core";

export interface INavService {
	// Route State
	routeState: BehaviorSubject<IRouteState>,
	
	// App Navigation
    signIn(): Promise<boolean>,
    updatePassword(): Promise<boolean>,
	dashboard(): Promise<boolean>,
	tradingSessions(): Promise<boolean>,
	tradingSimulations(): Promise<boolean>,
	forecastModels(): Promise<boolean>,
	candlesticks(): Promise<boolean>,
    apiErrors(): Promise<boolean>,
    server(): Promise<boolean>,
    users(): Promise<boolean>,
    database(): Promise<boolean>,
    guiVersion(version?: string): Promise<boolean>,
    ipBlacklist(): Promise<boolean>,
	
	// Dialogs
    displayConfirmationDialog(data?: IConfirmationDialogData): MatDialogRef<any>,
	
	// Bottom Sheets
	displayBottomSheetMenu(data: IBottomSheetMenuItem[]): MatBottomSheetRef<any>,

    // URL Openers
    openPGAdmin(): void,
    openDozzle(): void
	
	// Main URL Opener
	openUrl(url: string): void,
	
	// App Reloader
	reloadApp(): void,
	
	// Scroll Helpers
	scrollTop(top: number, container: string): void,
}






// Route State
export interface IRouteState extends IRouteStateData{
	navigating: boolean
}
export interface IRouteStateData {
	module: string|null
}





