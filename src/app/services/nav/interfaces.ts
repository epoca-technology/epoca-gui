import {BehaviorSubject} from "rxjs";
import {MatDialogRef} from "@angular/material/dialog";
import {MatBottomSheetRef} from "@angular/material/bottom-sheet";
import { 
	IRegressionConfig, 
	IPrediction,
	IPredictionModelConfig,
} from "../../core";
import {IConfirmationDialogData} from "../../shared/components/confirmation-dialog";
import {IBottomSheetMenuItem} from "../../shared/components/bottom-sheet-menu";
import { IDialogMenuItem } from "../../shared/components/dialog-menu";




export interface INavService {
	// Route State
	routeState: BehaviorSubject<IRouteState>,
	
	// App Navigation
    signIn(): Promise<boolean>,
	updatePassword(): Promise<boolean>,
	candlesticks(): Promise<boolean>,
	dashboard(): Promise<boolean>,
	regressions(): Promise<boolean>,
	predictionModels(): Promise<boolean>,
	epochs(): Promise<boolean>,
	guiVersion(version?: string): Promise<boolean>,
	ipBlacklist(): Promise<boolean>,
	server(): Promise<boolean>,
	tradingSessions(): Promise<boolean>,
	tradingSimulations(): Promise<boolean>,
	users(): Promise<boolean>,
	
	// Dialogs
    displayConfirmationDialog(data?: IConfirmationDialogData): MatDialogRef<any>,
	displayDataDialog(name: string, value: any): MatDialogRef<any>,
	displayDialogMenu(title: string, items: IDialogMenuItem[]): MatDialogRef<any>,
	displayTooltip(title: string, content: string|string[]): MatDialogRef<any>,
	displayKerasModelDialog(modelConfig: IRegressionConfig): MatDialogRef<any>,
	displayModelSelectionDialog(): MatDialogRef<any>,
	displayPredictionModelConfigDialog(modelConfig: IPredictionModelConfig): MatDialogRef<any>
	displayPredictionDialog(model: IPredictionModelConfig, pred: IPrediction, outcome?: boolean): MatDialogRef<any>
	
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
	scrollTop(container?: string): void,
}






// Route State
export interface IRouteState extends IRouteStateData{
	navigating: boolean
}
export interface IRouteStateData {
	module: string|null,
	subModule?: string,
}





