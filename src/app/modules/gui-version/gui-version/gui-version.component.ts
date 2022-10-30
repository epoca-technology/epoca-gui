import { Component, OnInit, ViewChild, ElementRef, OnDestroy } from "@angular/core";
import {SwUpdate} from "@angular/service-worker";
import { Subscription } from "rxjs";
import {AbstractControl, FormControl, FormGroup} from "@angular/forms";
import { IGuiVersionComponent } from "./interfaces";
import { GuiVersionService } from "../../../core";
import { AppService, NavService, ValidationsService } from "../../../services";

@Component({
  selector: "app-gui-version",
  templateUrl: "./gui-version.component.html",
  styleUrls: ["./gui-version.component.scss"]
})
export class GuiVersionComponent implements OnInit, OnDestroy, IGuiVersionComponent {
    // Input
    @ViewChild("versionControl") versionControl? : ElementRef;

	// Version
	public currentVersion: string|null|undefined;
    private currentVersionSub?: Subscription;
	public versionMissmatch: boolean = false;

    // Edit Mode
    public edit: boolean = false;
    public form: FormGroup = new FormGroup({
        version: new FormControl("", [ this._validations.guiVersionValid ]),
    });

    // Load State
    public loaded = false;

	// Updating state
	public updating: boolean = false;
    
    constructor(
        private _app: AppService,
		private swUpdate: SwUpdate,
        private _version: GuiVersionService,
        public _nav: NavService,
        private _validations: ValidationsService
    ) { }

    /* Form Getters */
	get version(): AbstractControl { return <AbstractControl>this.form.get("version") }

    
    async ngOnInit(): Promise<void> {
        // Force an app bulk refresh
        await this._app.refreshAppBulk();

        // Subscribe to the gui version
        this.currentVersionSub = this._app.guiVersion.subscribe((version: string|null|undefined) => {
            if (typeof version == "string") {
                // Populate the version
                this.currentVersion = version;

                // Check if there is a missmatch
                this.versionMissmatch = this._app.version != this.currentVersion;
                
                // Allow for a small delay before marking the component as loaded
                this.loaded = true
            }
        });
    }



    ngOnDestroy(): void {
        if (this.currentVersionSub) this.currentVersionSub.unsubscribe(); 
    }






	/**
     * Notifies the service worker that there is a new version that
     * must be fetched and then refreshes the app.
     * @returns Promise<void>
     */
	public async reload(): Promise<void> {
		// Enable Updating State
		this.updating = true;
		
		setTimeout(async () => {
			try {
				// Check if the service worker is enabled
				if (this.swUpdate && this.swUpdate.isEnabled) {
					// Check for update
					await this.swUpdate.checkForUpdate();
                    
					// Activate Update
					await this.swUpdate.activateUpdate();
					
					// Finally, reload
					this._nav.reloadApp();
				} else {
					console.log("swUpdate Not Available.");
					this._nav.reloadApp();
				}
			} catch (e) {
				console.log(e);
				this._nav.reloadApp();
			}
		}, 500);
	}







    /**
     * Enables the edit mode.
     * @returns void
     */
    public enableEditMode(): void {
        // Prepare the view
        this.version.setValue(this.currentVersion);
        this.edit = true;

        // Focus input if applies
        if (this._app.layout.value != "mobile") {
            setTimeout(() => { if (this.versionControl) this.versionControl.nativeElement.focus() });
        }
    }







    /**
     * Prompts the confirmation dialog and if confirmed, it will update
     * the current GUI Version.
     */
    public save(): void {
        // Prompt the confirmation dialog
        this._nav.displayConfirmationDialog({
            title: "Update GUI Version",
            content: `<p class="align-center">Are you sure that you wish to update the current GUI Version to ${this.version.value}?</p>`,
            otpConfirmation: true
        }).afterClosed().subscribe(
            async (otp: string|undefined) => {
                if (otp) {
                    // Set Submission State
                    this.updating = true;
                    try {
                        // Set new version
                        await this._version.update(this.version.value, otp);

                        // Update local value
                        this.currentVersion = this.version.value;

                        // Notify
                        this._app.success("The new version has been saved successfully.");

                        // Check if there is a missmatch
                        this.versionMissmatch = this._app.version != this.currentVersion;

                        // Disable edit mode
                        this.updating = false;
                        setTimeout(() => { this.edit = false });
                    } catch(e) { this._app.error(e) }

                    // Set Submission State
                    this.updating = false;
                }
            }
        );
    }
}
