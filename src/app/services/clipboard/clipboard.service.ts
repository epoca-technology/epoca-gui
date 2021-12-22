import { Injectable } from '@angular/core';
import {Clipboard} from '@angular/cdk/clipboard';
import {SnackbarService} from "../snackbar";
import {IClipboardService} from "./interfaces";
import { UtilsService } from 'src/app/core';

@Injectable({
	providedIn: 'root'
})
export class ClipboardService implements IClipboardService{
	// Ability to read the clipboard
	public readonly canPaste: boolean =
		window &&
		window.navigator &&
		window.navigator['clipboard'] &&
		typeof window.navigator['clipboard'].readText == "function";
	
	
	
	constructor(
		private clipboard: Clipboard,
		private _snackbar: SnackbarService,
        private _utils: UtilsService
	) { }
	
	
	
	
	
	
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
				if (notify) this._snackbar.info('Portapapeles: ' + content, false);
			} else {
				this._snackbar.error('The copied content value is empty: CDK_RESPONSE_ERROR');
			}
		} catch (e) {
			console.log(e);
			this._snackbar.error(`${this._utils.getErrorMessage(e)} - CDK_ERROR`);
		}
	}
	
	
	
	
	
	
	
	/*
	* Attempts to read the clipboard
	* contents. If no content is found,
	* it will throw an error.
	* @returns Promise<string>
	* */
	public async read(): Promise<string> {
		try {
			// Init data
			const clipboardData: string = await window.navigator['clipboard'].readText();
			
			// Check if data was extracted
			if (clipboardData && clipboardData.length) {
				return clipboardData;
			} else {
                this._snackbar.error('[ClipboardService]: No content could be extracted from the clipboard.');
				return '';
			}
		} catch (e) {
			console.log(e);
            this._snackbar.error(this._utils.getErrorMessage(e));
            return '';
		}
	}
}
