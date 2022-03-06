import { DOCUMENT } from '@angular/common';
import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Subscription } from 'rxjs';
import { ApiErrorService, IApiError, IpBlacklistService } from '../../../core';
import { AppService, AudioService, ClipboardService, ILayout, NavService, SnackbarService } from '../../../services';
import { IApiErrorsComponent, IView } from './interfaces';

@Component({
  selector: 'app-api-errors',
  templateUrl: './api-errors.component.html',
  styleUrls: ['./api-errors.component.scss']
})
export class ApiErrorsComponent implements OnInit, OnDestroy, IApiErrorsComponent {
    // Layout
	public layout: ILayout = this._app.layout.value;
	private layoutSub?: Subscription;
    
    // IP List
    public list: IApiError[] = [];

    // Active View
    public view: IView = 'intro';

    // Active Record
    public active: IApiError|undefined;

    // JSON Download
    public jsonLink: {name: string, url: SafeUrl|null} = {
        name: '',
        url: null
    };

    // Submission State
    public submitting: boolean = false;
    
    // Loading State
    public loaded: boolean = false;

    
    constructor(
        private _app: AppService,
        public _nav: NavService,
        private _apiError: ApiErrorService,
        private _snackbar: SnackbarService,
        private _blacklist: IpBlacklistService,
        private _audio: AudioService,
        public _clipboard: ClipboardService,
        private _sanitizer: DomSanitizer,
        @Inject(DOCUMENT) private document: Document,
    ) { }

    async ngOnInit(): Promise<void> {
        // Initialize layout
        this.layoutSub = this._app.layout.subscribe((nl: ILayout) => this.layout = nl);

        // Load the errors 
        await this.loadErrors();

        // Set the loading state
        this.loaded = true;
    }




    ngOnDestroy(): void {
        if (this.layoutSub) this.layoutSub.unsubscribe();
    }







    /* Retriever */




    /**
     * Retrieves all existing API Errors.
     * @returns Promise<void>
     */
    public async loadErrors(): Promise<void> {
        try {
            this.list = await this._apiError.getAll();
        } catch (e) { 
            this._snackbar.error(e);
            this._audio.playOutage();
        }
    }









    /* Navigation */


    // Intro
    public gotoIntro(): void {
        this.view = 'intro';
        this.active = undefined;
    }


    // Record
    public gotoRecord(record: IApiError): void {
        this.active = record;
        this.view = 'record';
    }











    /* API Actions */






    /**
     * Prompts the confirmation dialog and if confirmed, it will delete all api errors.
     * @returns void
     */
     public deleteAll(): void {
        // Prompt the confirmation dialog
        this._nav.displayConfirmationDialog({
            title: 'Delete API Errors',
            content: `
                <p class="align-center">
                    Are you sure that you wish to <strong>delete</strong> all API Errors from the database?
                </p>
            `,
            otpConfirmation: true
        }).afterClosed().subscribe(
            async (otp: string|undefined) => {
                if (otp) {
                    // Set Submission State
                    this.submitting = true;
                    try {
                        // Register the IP and refresh the list
                        this.list = await this._apiError.deleteAll(otp);
                    } catch(e) { this._snackbar.error(e) }

                    // Set Submission State
                    this.submitting = false;
                }
            }
        );
    }







    /**
     * Prompts the confirmation dialog and if confirmed, it will blacklist an ip.
     * @param ip
     * @returns void
     */
     public blacklistIP(ip: string): void {
        // Prompt the confirmation dialog
        this._nav.displayConfirmationDialog({
            title: 'Blacklist IP',
            content: `
                <p class="align-center">
                    Are you sure that you wish to blacklist the IP <strong>${ip}</strong>?
                </p>
            `,
            otpConfirmation: true
        }).afterClosed().subscribe(
            async (otp: string|undefined) => {
                if (otp) {
                    // Set Submission State
                    this.submitting = true;
                    try {
                        // Register the IP and refresh the list
                        await this._blacklist.registerIP(ip, undefined, otp);

                        // Notify
                        this._snackbar.success('The IP was blacklisted successfully.');
                    } catch(e) { this._snackbar.error(e) }

                    // Set Submission State
                    this.submitting = false;
                }
            }
        );
    }










    /* Error Download */





     /*
     * Builds and downloads a JSON File of the error.
     * @returns void
     * */
     public downloadError(): void {
         if (this.active) {
            const theJSON: string = JSON.stringify(this.active);
            this.jsonLink.url = this._sanitizer.bypassSecurityTrustUrl("data:text/json;charset=UTF-8," + encodeURIComponent(theJSON));
            this.jsonLink.name = `${this.active.o}_${this.active.c}.json`;
            setTimeout(() => { this.document.getElementById('downloadLink')?.click(); });
         }
   }
}
