import { Injectable } from '@angular/core';
import {ISnackbarService} from "./interfaces";
import {MatSnackBar, MatSnackBarRef, TextOnlySnackBar} from '@angular/material/snack-bar';
import { UtilsService } from '../../core';


@Injectable({
	providedIn: 'root'
})
export class SnackbarService implements ISnackbarService{
	
	constructor(
        private snackBar: MatSnackBar,
        private _utils: UtilsService
    ) { }
	
	
	
	
	/* Core Snackbars */
	
	
	
	// Success
	public success(message: string, action: boolean = true): MatSnackBarRef<TextOnlySnackBar> {
		return this.getSnackbar(message, 'success-snackbar', action);
	}
	
	
	
	// Info
	public info(message: string, action: boolean = true): MatSnackBarRef<TextOnlySnackBar> {
		return this.getSnackbar(message, 'info-snackbar', action);
	}
	
	
	
	// Error
	public error(error: any, action: boolean = true): MatSnackBarRef<TextOnlySnackBar> {
        const msg: string = typeof error == "string" ? error: this._utils.getErrorMessage(error);
		return this.getSnackbar(msg, 'warn-snackbar', action);
	}
	
	
	
	
	
	
	
	/*
	* Builds a snackbar based
	* on provided message and class.
	* @param message
	* @param cssClass
	* @param action
	* @returns MatSnackBarRef<TextOnlySnackBar>
	* */
	private getSnackbar(message: string, cssClass: string, action: boolean): MatSnackBarRef<TextOnlySnackBar> {
		return this.snackBar.open(message, action ? 'Ok': undefined, { panelClass: cssClass });
	}
}
