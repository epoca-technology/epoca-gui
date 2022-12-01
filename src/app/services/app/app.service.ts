import {Injectable, NgZone} from "@angular/core";
import { onValue, DataSnapshot } from "firebase/database";
import { MediaChange, MediaObserver } from "@angular/flex-layout";
import {MatSnackBar, MatSnackBarRef, TextOnlySnackBar} from "@angular/material/snack-bar";
import {Clipboard} from "@angular/cdk/clipboard";
import {BehaviorSubject} from "rxjs";
import packageJson from "../../../../package.json";
import { 
	AuthService, 
	BulkDataService, 
	DatabaseService, 
	IAppBulk, 
	IEpochRecord, 
	IMarketState, 
	IPositionSummary, 
	IPrediction, 
	IPredictionResultIcon, 
	IPredictionState, 
	PredictionService, 
	UtilsService 
} from "../../core";
import {IAppService, ILayout, ILayoutAlias, IAppBulkMetadata} from "./interfaces";




@Injectable({
	providedIn: "root"
})
export class AppService implements IAppService{
	// Layout
	public layout: BehaviorSubject<ILayout>;
	
    // Version
    public version: string;

	// Outage Audio
	public outageAudio: HTMLAudioElement = new Audio();
	public readonly outageAudioInitialized: boolean = false;
	
	// Ability to read the clipboard data
	public readonly canPaste: boolean =
		window &&
		window.navigator &&
		window.navigator["clipboard"] &&
		typeof window.navigator["clipboard"].readText == "function";


	/**
	 * App Bulk
	 * In order for the GUI to operate and keep in sync with the server,
	 * it retrieves, unpacks and broadcasts the IAppBulk every 120 seconds.
	 * Additionally, the refreshing functionality can be invoked from any
	 * module that can make use of the AppService.
	 * The observables are initialized with null, once the communication
	 * with the server is established, they may return any value, including
	 * undefined.
	 */
	private appBulkStream?: Function;
	private appBulkInterval: any;
	private readonly appBulkIntervalMS: number = 120 * 1000; // Every 120 seconds
	public serverTime: BehaviorSubject<number|undefined|null> = new BehaviorSubject<number|undefined|null>(null);
	public guiVersion: BehaviorSubject<string|undefined|null> = new BehaviorSubject<string|undefined|null>(null);
	public epoch: BehaviorSubject<IEpochRecord|undefined|null> = new BehaviorSubject<IEpochRecord|undefined|null>(null);
	public prediction: BehaviorSubject<IPrediction|undefined|null> = new BehaviorSubject<IPrediction|undefined|null>(null);
	public predictionState: BehaviorSubject<IPredictionState|undefined|null> = new BehaviorSubject<IPredictionState|undefined|null>(null);
	public predictionIcon: BehaviorSubject<IPredictionResultIcon|undefined|null> = new BehaviorSubject<IPredictionResultIcon|undefined|null>(null);
	public position: BehaviorSubject<IPositionSummary|undefined|null> = new BehaviorSubject<IPositionSummary|undefined|null>(null);
	public marketState: BehaviorSubject<IMarketState|undefined|null> = new BehaviorSubject<IMarketState|undefined|null>(null);
	public apiErrors: BehaviorSubject<number|undefined|null> = new BehaviorSubject<number|undefined|null>(null);





	constructor(
		private mediaObserver: MediaObserver,
		private snackBar: MatSnackBar,
		private clipboard: Clipboard,
        private _utils: UtilsService,
		private _auth: AuthService,
		private _bulk: BulkDataService,
		private _prediction: PredictionService,
		private _db: DatabaseService,
		private ngZone: NgZone
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

        // Set the gui"s version
        this.version = packageJson.version;

		// Initialize Audio
		try {
			this.outageAudio.src = "../../assets/audio/outage.mp3";
			this.outageAudio.load();
			this.outageAudioInitialized = true;
		} catch (err) {
			console.log("[AppService]: There was an error initializing the audio.");
			console.log(err);
		}

		// Subscribe to the auth status and manage the state of the refreshable data
        this._auth.uid.subscribe((uid: string|null|undefined) => {
			if (typeof uid == "string") { this.initializeAppBulk() }
			else if (uid === null) { this.deactivateAppBulk() }
        });
	}
	
	




	/* App Bulk Manager */





	/**
	 * Retrieves the current AppBulk and initializes the interval
	 * so it keeps updating.
	 * @returns Promise<void>
	 */
	private async initializeAppBulk(): Promise<void> {
		// Initialize the stream
		this.initializeAppBulkStream();

		// Initialize the bulk data
		await this.refreshAppBulk();

		// Create the interval
		if (!this.appBulkInterval) {
			this.appBulkInterval =  setInterval(() => { this.refreshAppBulk() }, this.appBulkIntervalMS);
		}
	}




	/**
	 * Destroys all the intervals and broadcasts an empty App Bulk state.
	 * This functionality is only invoked when the user signs out.
	 */
	 private deactivateAppBulk(): void {
		if (this.appBulkInterval) clearInterval(this.appBulkInterval);
		this.appBulkInterval = undefined;
		this.serverTime.next(undefined);
		this.guiVersion.next(undefined);
		this.epoch.next(undefined);
		this.prediction.next(undefined);
		this.predictionState.next(0);
		this.predictionIcon.next(undefined);
		this.position.next(undefined);
		this.marketState.next(undefined);
		if (typeof this.appBulkStream == "function") this.appBulkStream();
	}






	/* App Bulk Stream */



	/**
	 * The bulk is refreshed whenever the interval is invoked or when
	 * there is an event that changed the App Bulk in any way.
	 * @returns Promise<void>
	 */
	public async refreshAppBulk(): Promise<void> {
		try {
			// Retrieve the bulk from the API
			const epochID: string|undefined = this.epoch.value ? this.epoch.value.id: undefined;
			const bulk: IAppBulk = await this._bulk.getAppBulk(epochID);

			// Finally, broadcast the app bulk
			this.broadcastAppBulk(bulk);
		} catch (e) { console.error(e) }
	}





    /**
     * Initializes the API Secret DB Connection.
     * @returns void
     */
	 private initializeAppBulkStream(): void {
        this.appBulkStream = onValue( this._db.getAppBulkRef(), (snapshot: DataSnapshot) => {
                this.ngZone.run(() => {
                    const snapVal: IAppBulk|null = snapshot.val();
                    if (snapVal) this.broadcastAppBulk(snapVal);
                });
            },
            e => console.error(e)
        );
    }









	/**
	 * Broadcasts the app bulk through all the observables.
	 * @param bulk 
	 */
	private broadcastAppBulk(bulk: IAppBulk): void {
		// Unpack the metadata
		const metadata: IAppBulkMetadata = this.getAppBulkMetadata(bulk);

		// Broadcast the server's time
		this.serverTime.next(bulk.serverTime);

		// Broadcast the gui version
		this.guiVersion.next(bulk.guiVersion);

		// Broadcast the active epoch record if applies
		if (bulk.epoch != "keep") this.epoch.next(bulk.epoch);

		// Broadcast the active prediction as well as the metadata
		this.predictionState.next(bulk.predictionState);
		this.predictionIcon.next(metadata.predictionIcon);
		this.prediction.next(bulk.prediction);

		// Broadcast the position summary
		this.position.next(bulk.position);

		// Broadcast the market state
		this.marketState.next(bulk.marketState);

		// Broadcast the api errors
		this.apiErrors.next(bulk.apiErrors);
	}





	/**
	 * Puts together the bulk's metadata that will be broadcasted with the
	 * main app bulk data.
	 * @param bulk 
	 * @returns IAppBulkMetadata
	 */
	private getAppBulkMetadata(bulk: IAppBulk): IAppBulkMetadata {
		// Init values
		let predictionIcon: IPredictionResultIcon|undefined = undefined;

		// Populate the active prediction icon
		if (bulk.prediction) { predictionIcon = this._prediction.resultIconNames[bulk.prediction.r]} 
		else { predictionIcon = undefined }

		// ...

		// Finally, return the packed metadata
		return {
			predictionIcon: predictionIcon,
		}
	}






	






	/* Snackbars */
	
	
	
	// Success
	public success(message: string, action: boolean = true): MatSnackBarRef<TextOnlySnackBar> {
		return this.getSnackbar(message, "success-snackbar", action);
	}
	
	
	
	// Info
	public info(message: string, action: boolean = true): MatSnackBarRef<TextOnlySnackBar> {
		return this.getSnackbar(message, "info-snackbar", action);
	}
	
	
	
	// Error
	public error(error: any, action: boolean = true): MatSnackBarRef<TextOnlySnackBar> {
        const msg: string = typeof error == "string" ? error: this._utils.getErrorMessage(error);
		return this.getSnackbar(msg, "warn-snackbar", action);
	}
	
	
	
	
	
	
	
	/*
	* Builds a snackbar based on provided message and class.
	* @param message
	* @param cssClass
	* @param action
	* @returns MatSnackBarRef<TextOnlySnackBar>
	* */
	private getSnackbar(message: string, cssClass: string, action: boolean): MatSnackBarRef<TextOnlySnackBar> {
		return this.snackBar.open(message, action ? "Ok": undefined, { panelClass: cssClass });
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
				return "";
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
	* on the device"s width
	* @param currentAlias?
	* @returns ILayout
	* */
	private getLayout(currentAlias?: ILayoutAlias): ILayout {
		if (typeof currentAlias == "string") {
			switch (currentAlias) {
				case "xs":
				case "sm":
					return "mobile";
				default:
					return "desktop";
			}
		} else {
			if (this.mediaObserver.isActive("xs") || this.mediaObserver.isActive("sm")) {
				return "mobile";
			}  else {
				return "desktop";
			}
		}
	}
}
