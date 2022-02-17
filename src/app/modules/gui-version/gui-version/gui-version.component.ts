import { Component, OnInit } from '@angular/core';
import {SwUpdate} from "@angular/service-worker";
import {ActivatedRoute} from "@angular/router";
import {AbstractControl, FormControl, FormGroup} from '@angular/forms';
import { IGuiVersionComponent } from './interfaces';
import { GuiVersionService } from '../../../core';
import { AppService, NavService, SnackbarService, ValidationsService } from '../../../services';

@Component({
  selector: 'app-gui-version',
  templateUrl: './gui-version.component.html',
  styleUrls: ['./gui-version.component.scss']
})
export class GuiVersionComponent implements OnInit, IGuiVersionComponent {
	// Version
	public currentVersion: string|null|undefined;
	public versionMissmatch: boolean = false;

    // Edit Mode
    public edit: boolean = false;
    public form: FormGroup = new FormGroup({
        version: new FormControl('', [ this._validations.guiVersionValid ]),
    });

    // Load State
    public loaded = false;

	// Updating state
	public updating: boolean = false;
    
    constructor(
        private _app: AppService,
		private route: ActivatedRoute,
		private swUpdate: SwUpdate,
        private _version: GuiVersionService,
        private _snackbar: SnackbarService,
        public _nav: NavService,
        private _validations: ValidationsService
    ) { }

    /* Form Getters */
	get version(): AbstractControl { return <AbstractControl>this.form.get('version') }

    
    async ngOnInit(): Promise<void> {
        // Check if the current version was provided in the route
        this.currentVersion = this.route.snapshot.paramMap.get('currentVersion');
        
        // In case it wast, retrieve it
        if (typeof this.currentVersion != "string") {
            try {
                this.currentVersion = await this._version.get();
            } catch (e) { this._snackbar.error(e) }
        }

        // Check if there is a missmatch
        this.versionMissmatch = this._app.version != this.currentVersion;
        
        // Allow for a small delay before marking the component as loaded
        this.loaded = true
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
					console.log('swUpdate Not Available.');
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
        this.version.setValue(this.currentVersion);
        this.edit = true;
    }







    /**
     * Prompts the confirmation dialog and if confirmed, it will update
     * the current GUI Version.
     */
    public save(): void {
        // Prompt the confirmation dialog
        this._nav.displayConfirmationDialog({
            title: 'Update GUI Version',
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
                        this._snackbar.success('The new version has been saved successfully.');

                        // Check if there is a missmatch
                        this.versionMissmatch = this._app.version != this.currentVersion;

                        // Disable edit mode
                        this.edit = false;
                    } catch(e) { this._snackbar.error(e) }

                    // Set Submission State
                    this.updating = false;
                }
            }
        );
    }
}
