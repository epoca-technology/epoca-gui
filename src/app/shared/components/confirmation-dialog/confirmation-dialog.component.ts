import {Component, Inject, OnInit} from '@angular/core';
import {AbstractControl, FormControl, FormGroup} from '@angular/forms';
import {MatDialogRef, MAT_DIALOG_DATA} from "@angular/material/dialog";
import {IConfirmationDialogComponent, IConfirmationDialogData} from "./interfaces";
import {
	ClipboardService,
	SnackbarService,
	ValidationsService
} from "../../../services";
import { UtilsService } from 'src/app/core';

@Component({
	selector: 'app-confirmation-dialog',
	templateUrl: './confirmation-dialog.component.html',
	styleUrls: ['./confirmation-dialog.component.scss']
})
export class ConfirmationDialogComponent implements OnInit, IConfirmationDialogComponent {
	// Dialog properties
	public title: string = 'Confirm Action';
	public content: string = '<p class="align-center">Are you sure that you wish to proceed?</p>';
	
	// Confirmation Type
	public otpConfirmation!: boolean;
	
	// OTP Form
	public otpForm = new FormGroup ({otp: new FormControl('',[ this._validations.otpValid ])});
	
	// Submission
	public submitting: boolean = false;
	
	// Component loader
	public loaded: boolean = false;
	
	constructor(
		public dialogRef: MatDialogRef<ConfirmationDialogComponent>,
		private _validations: ValidationsService,
		private _snackbar: SnackbarService,
		public _clipboard: ClipboardService,
        private _utils: UtilsService,
		@Inject(MAT_DIALOG_DATA) private data?: IConfirmationDialogData,
	) { }
	
	
	
	async ngOnInit(): Promise<void> {
		// Check if data was provided
		if (this.data) {
			// Check if the title and/or content were provided
			if (this.data.title) this.title = this.data.title;
			if (this.data.content) this.content = this.data.content;
			
			// Check the type of confirmation required
            this.otpConfirmation = this.data.otpConfirmation == true;
		}
	}
	
	

	
	
	/* OTP Form Getters */
	get otp(): AbstractControl { return <AbstractControl>this.otpForm.get('otp') }
	
	
	


	
	
	
	
	/*
	* Confirms the action with
	* the OTP code
	* @returns void
	* */
	public confirmWithOTP(): void { this.confirm(this.otp.value) }
	
	
	
	
	
	
	
	/*
	* Pastes whatever is in clipboard
	* into the otp input. If the value
	* is valid, it will also confirm
	* automatically.
	* @returns Promise<void>
	* */
	public async pasteOTP(): Promise<void> {
		try {
			// Retrieve the data
			const data: string = await this._clipboard.read();
			
			// Paste into the access code input
			this.otp.setValue(data);
			this.otp.markAsTouched();
			
			// If the input is valid, submit the form automatically
			if (this.otp.valid) this.confirm(this.otp.value);
		} catch (e) {
			console.log(e);
			this._snackbar.error(this._utils.getErrorMessage(e));
		}
	}
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	/*
	* Closes the dialog and returns true.
	* This functionality is only
	* used with default
	* @param otp?
	* @returns void
	* */
	public confirm(otp?: string): void { this.dialogRef.close(otp || true) }
	
	
	
	
	
	
	
	/*
	* Closes the dialog and
	* returns false.
	* @returns void
	* */
	public cancel(): void { this.dialogRef.close(false) }
}
