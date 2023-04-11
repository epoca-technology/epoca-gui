import { Component, OnInit, OnDestroy } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { ActivatedRoute } from "@angular/router";
import { Subscription } from "rxjs";
import { 
    EpochService,
    IEpochRecord, 
    UtilsService 
} from "../../../core";
import { 
    AppService, 
    ILayout, 
    NavService, 
    ValidationsService 
} from "../../../services";
import { InstallEpochComponent } from "./install-epoch";
import { UninstallEpochComponent } from "./uninstall-epoch";
import { IEpochsComponent } from "./interfaces";

@Component({
  selector: "app-epochs",
  templateUrl: "./epochs.component.html",
  styleUrls: ["./epochs.component.scss"]
})
export class EpochsComponent implements OnInit, OnDestroy, IEpochsComponent {
    // Layout
	public layout: ILayout = this._app.layout.value;
	private layoutSub?: Subscription;

    // Active Epoch
    public epoch: IEpochRecord|null = null;
    private epochSub?: Subscription;
    public activeTab: number = 0;

    // Initialization State
    public initialized: boolean = false;

    // Epoch Data Loading State
    public loaded: boolean = false;

    // Submission State
    public submitting: boolean = false;

    constructor(
        public _nav: NavService,
        public _app: AppService,
        private _validations: ValidationsService,
        private route: ActivatedRoute,
        private _epoch: EpochService,
        private dialog: MatDialog,
        private _utils: UtilsService
    ) { }

    ngOnInit(): void {
        // Initialize layout
        this.layoutSub = this._app.layout.subscribe((nl: ILayout) => this.layout = nl);

        /**
         * Initialize the epoch sub briefly. This subscription is destroyed once the 
         * epoch data initialization is invoked.
         */
        this.epochSub = this._app.epoch.subscribe(async (e: IEpochRecord|undefined|null) => {
            if (e !== null && !this.initialized && !this.epoch) {
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
                this.initialized = true;
            } else if (e === undefined) { this.initialized = true; }
        });
    }


    ngOnDestroy(): void {
        if (this.layoutSub) this.layoutSub.unsubscribe();
        if (this.epochSub) this.epochSub.unsubscribe();
    }





    /* Initializer */



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

        // Kill the subscription if exists
        this.epochSub?.unsubscribe();

        // Make sure the provided ID is valid
        if (!this._validations.epochIDValid(epochID || "")) {
            this.loaded = true;
            return;
        }

        // Check if the epoch matches the active one
        if (this._app.epoch.value && this._app.epoch.value.id == epochID) {
            this.epoch = this._app.epoch.value;
        }

        // If it isn"t the active epoch, retrieve the summary from the API
        else {
            try {
                const rec: IEpochRecord|undefined = await this._epoch.getEpochRecord(<string>epochID);
                if (!rec) { throw new Error(`The epoch ${epochID} was not found in the database.`)}
                this.epoch = rec;
            } catch (e) { this._app.error(e) }
        }

        // Set the loading state
        this.loaded = true;
    }











    /* Install Manager */




    

    /**
     * Displays the install epoch dialog.
     */
    public install(): void {
        this.dialog.open(InstallEpochComponent, {
            disableClose: true,
            hasBackdrop: this._app.layout.value != "mobile", // Mobile optimization
            panelClass: "small-dialog"
        }).afterClosed().subscribe(
            (installed: boolean) => { if (installed) this.initializeEpochData() }
        );
    }







    /**
     * Displays the uninstall epoch dialog.
     */
    public uninstall(): void {
        this.dialog.open(UninstallEpochComponent, {
            disableClose: true,
            hasBackdrop: this._app.layout.value != "mobile", // Mobile optimization
            panelClass: "small-dialog"
        }).afterClosed().subscribe(
            (uninstalled: boolean) => { if (uninstalled) this.initializeEpochData() }
        );
    }
}
