import {BehaviorSubject} from "rxjs";
import {MatDialogRef} from "@angular/material/dialog";
import {MatBottomSheetRef} from "@angular/material/bottom-sheet";
import { IKerasModelSummary, IModel, IPrediction } from "../../core";
import {IConfirmationDialogData} from "../../shared/components/confirmation-dialog";
import {IBottomSheetMenuItem} from "../../shared/components/bottom-sheet-menu";

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
	backtests(): Promise<boolean>,
	regressionSelection(): Promise<boolean>,
	regressionTrainingCertificates(): Promise<boolean>,
	classificationTrainingData(): Promise<boolean>,
	classificationTrainingCertificates(): Promise<boolean>,
	candlesticks(): Promise<boolean>,
    server(): Promise<boolean>,
    users(): Promise<boolean>,
    guiVersion(version?: string): Promise<boolean>,
    ipBlacklist(): Promise<boolean>,
	
	// Dialogs
    displayConfirmationDialog(data?: IConfirmationDialogData): MatDialogRef<any>,
	displayDataDialog(name: string, value: any): MatDialogRef<any>,
	displayModelDialog(model: IModel): MatDialogRef<any>,
	displayKerasModelDialog(id: string, description: string, kerasModel: IKerasModelSummary): MatDialogRef<any>,
	displayPredictionDialog(model: IModel, prediction: IPrediction): MatDialogRef<any>,
	
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





