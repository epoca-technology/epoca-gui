import {Component, OnInit, ViewChild} from '@angular/core';
import {MatDialogRef} from "@angular/material/dialog";
import {RecaptchaComponent} from "ng-recaptcha";
import {IRecaptchaDialogComponent} from "./interfaces";
import {SnackbarService} from "../../../services";
import { UtilsService } from 'src/app/core';



@Component({
	selector: 'app-recaptcha-dialog',
	templateUrl: './recaptcha-dialog.component.html',
	styleUrls: ['./recaptcha-dialog.component.scss']
})
export class RecaptchaDialogComponent implements OnInit, IRecaptchaDialogComponent {
	// reCAPTCHA element
	@ViewChild('recaptchaEl') recaptchaEl: RecaptchaComponent|undefined;
	
	// Loading Issue Fix
	public infoVisible: boolean = false;
	
	// Loading status
	public loaded: boolean = false;
	public delayed: boolean = false;
	
	
	constructor(
		public dialogRef: MatDialogRef<RecaptchaDialogComponent>,
		private _snackbar: SnackbarService,
        private _utils: UtilsService
	) { }
	
	ngOnInit(): void {
		setTimeout(() => {
			this.loaded = true;
			setTimeout(() => {
				this.delayed = true;
			},3000);
		}, 1000)
	}
	
	
	
	
	
	/**
	 * Triggers once the recaptcha
	 * has been properly resolved.
	 * @param captchaResponse
	 * @returns void
	 */
	public resolved(captchaResponse: string): void {
		setTimeout(() => {
			this.dialogRef.close(captchaResponse);
		}, 500)
	}
	
	
	
	
	/**
	 * Triggers if there has been an
	 * error with the recaptcha
	 * @param error
	 * @returns void
	 */
	public errored(error: any): void {
		console.log(error);
		this._snackbar.error(this._utils.getErrorMessage(error));
	}
	
	
	
	
	
	
	
	/*
	* Resets the recaptcha.
	* @returns void
	* */
	public reset(): void {
		try {
			if (this.recaptchaEl) this.recaptchaEl.reset();
		} catch (e) {
			console.log(e);
            this._snackbar.error(this._utils.getErrorMessage(e));
		}
	}
	
}
