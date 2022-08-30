import {BehaviorSubject} from "rxjs";
import {MatDialogRef} from "@angular/material/dialog";
import {MatBottomSheetRef} from "@angular/material/bottom-sheet";
import { 
	IKerasClassificationConfig, 
	IKerasRegressionConfig, 
	IModel, 
	IPrediction, 
	IXGBClassificationConfig, 
	IXGBRegressionConfig 
} from "../../core";
import {IConfirmationDialogData} from "../../shared/components/confirmation-dialog";
import {IBottomSheetMenuItem} from "../../shared/components/bottom-sheet-menu";
import { IDialogMenuItem } from "../../shared/components/dialog-menu";
import { IClassificationFeaturesData } from "../../shared/components/epoch-builder";




export interface INavService {
	// Route State
	routeState: BehaviorSubject<IRouteState>,
	
	// App Navigation
    signIn(): Promise<boolean>,
	updatePassword(): Promise<boolean>,
	candlesticks(): Promise<boolean>,
	dashboard(): Promise<boolean>,
	backtests(): Promise<boolean>,
	classificationTrainingData(): Promise<boolean>,
	kerasClassifications(): Promise<boolean>,
	kerasRegressions(): Promise<boolean>,
	regressionSelection(): Promise<boolean>,
	xgbClassifications(): Promise<boolean>,
	xgbRegressions(): Promise<boolean>,
	classificationSelection(): Promise<boolean>,
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
	displayModelDialog(model: IModel): MatDialogRef<any>,
	displayClassificationFeatures(data: IClassificationFeaturesData): MatDialogRef<any>,
	displayKerasModelDialog(modelConfig: IKerasRegressionConfig|IKerasClassificationConfig): MatDialogRef<any>,
	displayXGBModelDialog(modelConfig: IXGBRegressionConfig|IXGBClassificationConfig): MatDialogRef<any>,
	displayPredictionDialog(model: IModel, prediction: IPrediction, outcome?: boolean): MatDialogRef<any>,
	displayModelSelectionDialog(): MatDialogRef<any>,
	
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





