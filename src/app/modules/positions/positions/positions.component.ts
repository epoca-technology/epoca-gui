import { Component, OnInit, OnDestroy, ViewChild } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { MatSidenav } from "@angular/material/sidenav";
import { MatDialog } from "@angular/material/dialog";
import { Subscription } from "rxjs";
import { 
    IEpochRecord, 
    LocalDatabaseService, 
    PredictionService,
    UtilsService
} from "../../../core";
import { 
    AppService, 
    ChartService, 
    IBarChartOptions, 
    ILayout, 
    ILineChartOptions, 
    NavService, 
    ValidationsService 
} from "../../../services";
import { 
    IPositionsComponent, 
    ISection, 
    ISectionID,
} from './interfaces';



@Component({
  selector: 'app-positions',
  templateUrl: './positions.component.html',
  styleUrls: ['./positions.component.scss']
})
export class PositionsComponent implements OnInit, OnDestroy, IPositionsComponent {
    // Position Sidenav Element
	@ViewChild("positionSidenav") positionSidenav: MatSidenav|undefined;
	public positionSidenavOpened: boolean = false;

    // Layout
	public layout: ILayout = this._app.layout.value;
	private layoutSub?: Subscription;

    // Active Epoch
    public epoch: IEpochRecord|null = null;
    private epochSub?: Subscription;

    // Initialization & Loading State
    public initializing: boolean = false;
    public initialized: boolean = false;
    public loaded: boolean = false;

    // Navigation
    public readonly sections: ISection[] = [
        { id: "summary", name: "Summary", icon: "dashboard"},
        { id: "pnl", name: "PNL", icon: "download"},
        { id: "fees", name: "Fees", icon: "upload"},
        { id: "amounts", name: "Amounts", icon: "aspect_ratio"},
        { id: "prices", name: "Prices", icon: "price_check"},
        { id: "positions", name: "Positions", icon: "format_list_numbered"},
    ];
    public activeSection = this.sections[0];
    public sectionLoaded: boolean = false;

    
    constructor(
        public _nav: NavService,
        public _app: AppService,
        private _validations: ValidationsService,
        private route: ActivatedRoute,
        private _localDB: LocalDatabaseService,
        private _chart: ChartService,
        public _prediction: PredictionService,
        private dialog: MatDialog,
        private _utils: UtilsService
    ) { }

    async ngOnInit(): Promise<void> {
        // Initialize layout
        this.layoutSub = this._app.layout.subscribe((nl: ILayout) => { this.layout = nl });

        /**
         * Initialize the epoch sub briefly. This subscription is destroyed once the 
         * first epoch value is emmited
         */
         this.epochSub = this._app.epoch.subscribe(async (e: IEpochRecord|undefined|null) => {
            if (e !== null && !this.initialized) {
                // Kill the subscription
                if (this.epochSub) this.epochSub.unsubscribe();

                // Set init state
                this.initializing = true;

                // Check if an Epoch ID was provided from the URL. If so, initialize it right away.
                const urlEpochID: string|null = this.route.snapshot.paramMap.get("epochID");
                if (typeof urlEpochID == "string" && this._validations.epochIDValid(urlEpochID)) { 
                    await this.initializeEpochData(urlEpochID);
                }

                // Otherwise, check if an active epoch is available
                else if (e){
                    await this.initializeEpochData(e.id);
                }

                // Set the init state
                this.initializing = false;
                this.initialized = true;
            } else if (e === undefined) { this.initialized = true  }
        });
    }


    ngOnDestroy(): void {
        if (this.layoutSub) this.layoutSub.unsubscribe();
        if (this.epochSub) this.epochSub.unsubscribe();
    }








    /***************
     * Initializer *
     ***************/



    /**
     * Initializes the component based on a provided Epoch ID.
     * @param epochID?
     * @returns Promise<void>
     */
    public async initializeEpochData(epochID?: string): Promise<void> {
        // Set the loading state
        this.loaded = false;

        // Reset the epoch values
        this.epoch = null;

        // Make sure the provided ID is valid
        if (!this._validations.epochIDValid(epochID || "")) {
            this.loaded = true;
            return;
        }

        // Initialize the epoch summary
        let epochSummary: IEpochRecord|undefined|null = null;

        // Check if the epoch matches the active one
        if (this._app.epoch.value && this._app.epoch.value.id == epochID) {
            // Set the epoch summary
            epochSummary = this._app.epoch.value;
        }

        // If it isn"t the active epoch, retrieve the summary from the API
        else {
            try {
                epochSummary = await this._localDB.getEpochRecord(<string>epochID);
            } catch (e) { this._app.error(e) }
        }

        // Make sure an epoch summary was found
        if (!epochSummary) {
            this._app.error("Could not extract the Epoch Record.");
            this.loaded = true;
            return;
        }

        // Populate the epoch
        this.epoch = epochSummary;

        // Initialize the position data
        // ...

        // Set the loading state
        this.loaded = true;

        // Activate the section
        // ...
    }











}
