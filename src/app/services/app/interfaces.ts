import {MatSnackBarRef, TextOnlySnackBar} from "@angular/material/snack-bar";
import {BehaviorSubject} from "rxjs";
import { 
    IEpochSummary, 
    IPrediction, 
    IPredictionResultIcon, 
    IPredictionState 
} from "../../core";


export interface IAppService {
	// Properties
	layout: BehaviorSubject<ILayout>,
    version: string,
    outageAudio: HTMLAudioElement,
    outageAudioInitialized: boolean,
    canPaste: boolean,

    // App Bulk
    serverTime: BehaviorSubject<number|undefined|null>,
    guiVersion: BehaviorSubject<string|undefined|null>,
    epoch: BehaviorSubject<IEpochSummary|undefined|null>,
    prediction: BehaviorSubject<IPrediction|undefined|null>,
    predictionState: BehaviorSubject<IPredictionState|undefined|null>,
    predictionIcon: BehaviorSubject<IPredictionResultIcon|undefined|null>,
    session: BehaviorSubject<object|undefined|null>,
    activeSessionPositions: BehaviorSubject<number|undefined|null>,
    refreshAppBulk(): Promise<void>,

    // Snackbars
    success(message: string, action: boolean): MatSnackBarRef<TextOnlySnackBar>,
	info(message: string, action: boolean): MatSnackBarRef<TextOnlySnackBar>,
	error(error: any, action: boolean): MatSnackBarRef<TextOnlySnackBar>,

    // Clipboard
    copy(content: string, notify: boolean): void,
    read(): Promise<string>,

    // Audio
    playOutage(): Promise<void>,
}






// Layout
export type ILayout = "mobile"|"desktop";
export type ILayoutAlias = "xs"|"sm"|"md"|"lg"|"xl";



// App Bulk Metadata
export interface IAppBulkMetadata {
    predictionIcon: IPredictionResultIcon|undefined,
    activeSimulations: number,
    activeSessionPositions: number
}