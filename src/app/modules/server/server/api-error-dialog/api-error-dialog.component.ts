import { Component, OnInit, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import {MatDialogRef, MAT_DIALOG_DATA} from "@angular/material/dialog";
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { IApiError, IpBlacklistService } from '../../../../core';
import { ClipboardService, NavService, SnackbarService } from '../../../../services';
import { IApiErrorDialogComponent } from './interfaces';

@Component({
  selector: 'app-api-error-dialog',
  templateUrl: './api-error-dialog.component.html',
  styleUrls: ['./api-error-dialog.component.scss']
})
export class ApiErrorDialogComponent implements OnInit, IApiErrorDialogComponent {
    // JSON Download
    public jsonLink: {name: string, url: SafeUrl|null} = {
        name: '',
        url: null
    };

    // Submission State
    public submitting: boolean = false;

	
	constructor(
		private dialogRef: MatDialogRef<ApiErrorDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public error: IApiError,
		private domSanitizer: DomSanitizer,
        @Inject(DOCUMENT) private document: Document,
        public _clipboard: ClipboardService,
        private _snackbar: SnackbarService,
        private _blacklist: IpBlacklistService,
		private _nav: NavService
	) { }

	ngOnInit(): void {
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









     /*
     * Builds and downloads a JSON File of the error.
     * @returns void
     * */
     public downloadError(): void {
		const theJSON: string = JSON.stringify(this.error);
		this.jsonLink.url = this.domSanitizer.bypassSecurityTrustUrl("data:text/json;charset=UTF-8," + encodeURIComponent(theJSON));
		this.jsonLink.name = `${this.error.o}_${this.error.c}.json`;
		setTimeout(() => { this.document.getElementById('downloadLink')?.click(); });
    }









	/*
	* Closes the dialog.
	* @returns void
	* */
	public close(): void { this.dialogRef.close() }
}
