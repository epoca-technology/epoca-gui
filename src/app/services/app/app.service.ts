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
	IAppBulkStream, 
	ICandlestick, 
	ICompressedCandlesticks, 
	IEpochRecord, 
	IMarketState, 
	IPositionHeadline, 
	IPrediction, 
	PredictionService, 
	UtilsService 
} from "../../core";
import {IAppService, ILayout, ILayoutAlias} from "./interfaces";




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
	 * it retrieves, unpacks and broadcasts the IAppBulk every ~2 minutes.
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
	public positions: BehaviorSubject<IPositionHeadline[]|undefined|null> = new BehaviorSubject<IPositionHeadline[]|undefined|null>(null);
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
		// Initialize the bulk data
		await this.refreshAppBulk();

		// Initialize the stream
		this.initializeAppBulkStream();

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
		this.positions.next(undefined);
		this.marketState.next(undefined);
		if (typeof this.appBulkStream == "function") this.appBulkStream();
		this.appBulkStream = undefined;
	}






	/* App Bulk Stream */



	/**
	 * The bulk is refreshed whenever the interval is invoked or when
	 * there is an event that changed the App Bulk in any way.
	 * @returns Promise<void>
	 */
	public async refreshAppBulk(): Promise<void> {
		try { await this._refreshAppBulk() } 
		catch (e) { 
			console.error(e);
			await this._utils.asyncDelay(3);
			try { await this._refreshAppBulk() } 
			catch (e) {
				console.error(e);
				await this._utils.asyncDelay(3);
				try { await this._refreshAppBulk() } 
				catch (e) {
					this.error(e);
				}
			}
		}
	}
	private async _refreshAppBulk(): Promise<void> {
		// Retrieve the bulk from the API
		const epochID: string|undefined = this.epoch.value ? this.epoch.value.id: undefined;
		const bulk: IAppBulk = await this._bulk.getAppBulk(epochID);

		// Finally, broadcast the app bulk
		this.broadcastAppBulk(bulk);
	}





    /**
     * Initializes the API Secret DB Connection.
     * @returns void
     */
	private initializeAppBulkStream(): void {
		if (!this.appBulkStream) {
			this.appBulkStream = onValue( this._db.getAppBulkRef(), (snapshot: DataSnapshot) => {
					this.ngZone.run(() => {
						let snapVal: IAppBulk|IAppBulkStream|null|any = snapshot.val();
						if (snapVal) {
							snapVal.serverTime = this.serverTime.value!;
							snapVal.guiVersion = this.guiVersion.value!;
							snapVal.epoch = this.epoch.value!;
							snapVal.marketState.window.w = this.decompressCandlesticks(snapVal.marketState.window.w);
							this.broadcastAppBulk(snapVal);
						}
					});
				},
				e => console.error(e)
			);
		}
    }




	/**
	 * Decompresses the candlesticks attached to the AppBulk
	 * and builds the standard candlesticks.
	 * @param compressed 
	 * @returns ICandlestick[]
	 */
	private decompressCandlesticks(compressed: ICompressedCandlesticks): ICandlestick[] {
		// Initialize the list
		let candlesticks: ICandlestick[] = [];

		// Iterate over each candlestick
		for (let i = 0; i < compressed.ot.length; i++) {
			candlesticks.push(<ICandlestick>{
				ot: compressed.ot[i],
				ct: compressed.ct[i],
				o: compressed.o[i],
				h: compressed.h[i],
				l: compressed.l[i],
				c: compressed.c[i],
			});
		}

		// Finally, return the list
		return candlesticks;
	}









	/**
	 * Broadcasts the app bulk through all the observables.
	 * @param bulk 
	 */
	private broadcastAppBulk(bulk: IAppBulk): void {
		// Broadcast the market state
		this.marketState.next(bulk.marketState);

		// Broadcast the server's time
		this.serverTime.next(bulk.serverTime);

		// Broadcast the gui version
		this.guiVersion.next(bulk.guiVersion);

		// Broadcast the active epoch record if applies
		if (bulk.epoch != "keep") this.epoch.next(bulk.epoch);

		// Broadcast the active prediction
		this.prediction.next(bulk.prediction);

		// Broadcast the position headlines
		this.positions.next(bulk.positions);

		// Broadcast the api errors
		this.apiErrors.next(bulk.apiErrors);
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
