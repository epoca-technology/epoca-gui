import {MatSnackBarRef, TextOnlySnackBar} from "@angular/material/snack-bar";
import {BehaviorSubject} from "rxjs";
import { IEpochSummary, IPrediction, IPredictionResultIcon } from "../../core";


export interface IAppService {
	// Properties
	layout: BehaviorSubject<ILayout>,
    version: string,
    outageAudio: HTMLAudioElement,
    outageAudioInitialized: boolean,
    canPaste: boolean,

    // Refreshable Data
    epoch: BehaviorSubject<IEpochSummary|undefined>,
    prediction: BehaviorSubject<IPrediction|undefined>,
    predictionIcon: BehaviorSubject<IPredictionResultIcon|undefined>,
    simulations: BehaviorSubject<any[]>,
    session: BehaviorSubject<object|undefined>,
    refreshEpoch(): Promise<void>,
    refreshPrediction(): Promise<void>,
    refreshSimulations(): Promise<void>,
    refreshSession(): Promise<void>,

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
export type ILayout = 'mobile'|'desktop';
export type ILayoutAlias = 'xs'|'sm'|'md'|'lg'|'xl';