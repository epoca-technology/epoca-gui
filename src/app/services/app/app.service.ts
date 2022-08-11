import {Injectable} from '@angular/core';
import { MediaChange, MediaObserver } from '@angular/flex-layout';
import {MatSnackBar, MatSnackBarRef, TextOnlySnackBar} from '@angular/material/snack-bar';
import {Clipboard} from '@angular/cdk/clipboard';
import {BehaviorSubject} from "rxjs";
import packageJson from '../../../../package.json';
import { UtilsService } from '../../core';
import {IAppService, ILayout, ILayoutAlias} from "./interfaces";




@Injectable({
	providedIn: 'root'
})
export class AppService implements IAppService{
	// Layout
	public layout: BehaviorSubject<ILayout>;
	
    // Version
    public version: string;

	// Outage Audio
	private outageAudio: HTMLAudioElement = new Audio();
	public readonly outageAudioInitialized: boolean = false;
	
	// Ability to read the clipboard data
	public readonly canPaste: boolean =
		window &&
		window.navigator &&
		window.navigator["clipboard"] &&
		typeof window.navigator["clipboard"].readText == "function";





	constructor(
		private mediaObserver: MediaObserver,
		private snackBar: MatSnackBar,
		private clipboard: Clipboard,
        private _utils: UtilsService
	) {
		// Initialize the Layout
		this.layout = new BehaviorSubject<ILayout>(this.getLayout());
		this.mediaObserver.asObservable().subscribe(
			(change: MediaChange[]) => {
				const alias: ILayoutAlias|undefined =
					change && change[0] && change[0].mqAlias ? <ILayoutAlias>change[0].mqAlias: undefined;
				const newLayout: ILayout = this.getLayout(alias);
				if (this.layout.value != newLayout) this.layout.next(newLayout);
			}
		);

        // Set the gui's version
        this.version = packageJson.version;

		// Initialize Audio
		try {
			this.outageAudio.src = "../../assets/audio/outage.mp3";
			this.outageAudio.load();
			this.outageAudioInitialized = true;
		} catch (err) {
			console.log('[AppService]: There was an error initializing the audio.');
			console.log(err);
		}
	}
	
	
	
	
	






	/* Snackbars */
	
	
	
	// Success
	public success(message: string, action: boolean = true): MatSnackBarRef<TextOnlySnackBar> {
		return this.getSnackbar(message, 'success-snackbar', action);
	}
	
	
	
	// Info
	public info(message: string, action: boolean = true): MatSnackBarRef<TextOnlySnackBar> {
		return this.getSnackbar(message, 'info-snackbar', action);
	}
	
	
	
	// Error
	public error(error: any, action: boolean = true): MatSnackBarRef<TextOnlySnackBar> {
        const msg: string = typeof error == "string" ? error: this._utils.getErrorMessage(error);
		return this.getSnackbar(msg, 'warn-snackbar', action);
	}
	
	
	
	
	
	
	
	/*
	* Builds a snackbar based on provided message and class.
	* @param message
	* @param cssClass
	* @param action
	* @returns MatSnackBarRef<TextOnlySnackBar>
	* */
	private getSnackbar(message: string, cssClass: string, action: boolean): MatSnackBarRef<TextOnlySnackBar> {
		return this.snackBar.open(message, action ? 'Ok': undefined, { panelClass: cssClass });
	}





	
	






	/* Clipboard */
	

	

	/*
	* Copies content to clipboard.
	* @param content
	* @param notify
	* @returns void
	* */
	public copy(content: string, notify: boolean = true): void {
		try {
			// Attempt to copy the content
			const didCopy: boolean = this.clipboard.copy(content);
			
			// Check if it was successful
			if (didCopy) {
				// Check if the user should be notified
				if (notify) this.info("Clipboard: " + content, false);
			} else {
				this.error("The copied content value is empty: CDK_RESPONSE_ERROR");
			}
		} catch (e) {
			console.log(e);
			this.error(`${this._utils.getErrorMessage(e)} - CDK_ERROR`);
		}
	}
	
	
	
	
	
	
	
	/*
	* Attempts to read the clipboard
	* contents. If no content is found,
	* it will throw an error.
	* @returns Promise<string>
	* */
	public async read(): Promise<string> {
		// Only continue if the client can past
		if (!this.canPaste) {
			this.error("Could not paste the clipboard content because the browser is incompatible.");
			return "";
		}

		// Attempt the read the data
		try {
			// Init data
			const clipboardData: string = await window.navigator["clipboard"].readText();
			
			// Check if data was extracted
			if (clipboardData && clipboardData.length) {
				return clipboardData;
			} else {
                this.error("[AppService]: No content could be extracted from the clipboard.");
				return '';
			}
		} catch (e) {
			console.log(e);
            this.error(this._utils.getErrorMessage(e));
            return "";
		}
	}

	
	





	
	
	

	/* Audio */

	
	/*
	* Plays the outage audio mp3 if the platform is compatible
	* @returns void
	* */
	public async playOutage(): Promise<void> { return this.outageAudio.play() }








	
	
	
	
	/* Layout Helpers */
	
	
	
	
	
	/*
	* Retrieves the layout based
	* on the device's width
	* @param currentAlias?
	* @returns ILayout
	* */
	private getLayout(currentAlias?: ILayoutAlias): ILayout {
		if (typeof currentAlias == "string") {
			switch (currentAlias) {
				case 'xs':
				case 'sm':
					return 'mobile';
				default:
					return 'desktop';
			}
		} else {
			if (this.mediaObserver.isActive('xs') || this.mediaObserver.isActive('sm')) {
				return 'mobile';
			}  else {
				return 'desktop';
			}
		}
	}
}
