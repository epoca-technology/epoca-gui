import {BehaviorSubject} from "rxjs";
import {MatDialogRef} from "@angular/material/dialog";
import {MatBottomSheetRef} from "@angular/material/bottom-sheet";
import { IBinanceTradeExecutionPayload,} from "../../core";
import {IConfirmationDialogData} from "../../shared/components/confirmation-dialog";
import {IBottomSheetMenuItem} from "../../shared/components/bottom-sheet-menu";
import { IDialogMenuItem } from "../../shared/components/dialog-menu";
import { IDateRangeConfig } from "../../shared/components/date-range-form-dialog";




export interface INavService {
	// Route State
	routeState: BehaviorSubject<IRouteState>,
	
	// App Navigation
    signIn(): Promise<boolean>,
	updatePassword(): Promise<boolean>,
	dashboard(): Promise<boolean>,
	adjustments(): Promise<boolean>,
	transactions(): Promise<boolean>,
	candlesticks(): Promise<boolean>,
	server(): Promise<boolean>,
	users(): Promise<boolean>,
	guiVersion(): Promise<boolean>,
	ipBlacklist(): Promise<boolean>,
	localDatabase(): Promise<boolean>,
	
	// Dialogs
    displayConfirmationDialog(data?: IConfirmationDialogData): MatDialogRef<any>,
	displayDataDialog(name: string, value: any): MatDialogRef<any>,
	displayDialogMenu(title: string, items: IDialogMenuItem[]): MatDialogRef<any>,
	displayTooltip(title: string, content: string|string[]): MatDialogRef<any>,
	displayPositionHeadlinesDialog(range?: IDateRangeConfig): MatDialogRef<any>,
	displayPositionRecordDialog(id: string): MatDialogRef<any>,
	displayTradeExecutionPayloadListDialog(range?: IDateRangeConfig): MatDialogRef<any>,
	displayTradeExecutionPayloadDialog(payload: IBinanceTradeExecutionPayload): MatDialogRef<any>,

	// Date Range Helper
	displayDateRangeDialog(data?: IDateRangeConfig): MatDialogRef<any>,
	calculateDateRange(data?: IDateRangeConfig): Promise<IDateRangeConfig|undefined>,

	
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





