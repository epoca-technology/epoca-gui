import {BehaviorSubject} from "rxjs";
import {MatDialogRef} from "@angular/material/dialog";
import {MatBottomSheetRef} from "@angular/material/bottom-sheet";
import { 
	IRegressionConfig, 
	IPrediction,
	IPredictionModelConfig,
	IEpochRecord,
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
	dashboard(): Promise<boolean>,
	epochs(epochID?: string): Promise<boolean> ,
	predictions(epochID?: string): Promise<boolean>,
	tradingSessions(epochID?: string): Promise<boolean>,
	myWallet(): Promise<boolean>,
	candlesticks(): Promise<boolean>,
	orderBook(): Promise<boolean>,
	server(): Promise<boolean>,
	users(): Promise<boolean>,
	guiVersion(version?: string): Promise<boolean>,
	ipBlacklist(): Promise<boolean>,
	regressions(certID?: string): Promise<boolean>,
	predictionModels(certID?: string): Promise<boolean>,
	localDatabase(): Promise<boolean>,
	
	// Dialogs
    displayConfirmationDialog(data?: IConfirmationDialogData): MatDialogRef<any>,
	displayDataDialog(name: string, value: any): MatDialogRef<any>,
	displayDialogMenu(title: string, items: IDialogMenuItem[]): MatDialogRef<any>,
	displayTooltip(title: string, content: string|string[]): MatDialogRef<any>,
	displayKerasModelDialog(modelConfig: IRegressionConfig): MatDialogRef<any>,
	displayModelSelectionDialog(): MatDialogRef<any>,
	displayPredictionModelConfigDialog(modelConfig: IPredictionModelConfig): MatDialogRef<any>
	displayPredictionDialog(
		model: IPredictionModelConfig, 
		pred: IPrediction, 
		outcome?: boolean,
		openPrice?: number,
		epoch?: IEpochRecord
	): MatDialogRef<any>,
	
	// Bottom Sheets
	displayBottomSheetMenu(data: IBottomSheetMenuItem[]): MatBottomSheetRef<any>,

    // URL Openers
	openPredictionModelCertificate(modelID: string): void,
	openRegressionCertificate(modelID: string): void,
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





