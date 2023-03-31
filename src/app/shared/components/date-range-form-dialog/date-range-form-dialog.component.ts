import { Component, OnInit, Inject } from '@angular/core';
import {AbstractControl, FormControl, FormGroup, Validators} from '@angular/forms';
import {MatDialogRef, MAT_DIALOG_DATA} from "@angular/material/dialog";
import * as moment from "moment";
import { AppService } from '../../../services';
import { IDateRangeConfig, IDateRangeFormDialogComponent } from './interfaces';

@Component({
  selector: 'app-date-range-form-dialog',
  templateUrl: './date-range-form-dialog.component.html',
  styleUrls: ['./date-range-form-dialog.component.scss']
})
export class DateRangeFormDialogComponent implements OnInit, IDateRangeFormDialogComponent {
	// Form
	public form = new FormGroup ({
		startAt: new FormControl('', [ Validators.required ]),
		endAt: new FormControl('', [ Validators.required ]),
	});

	constructor(
		private dialogRef: MatDialogRef<DateRangeFormDialogComponent>,
		@Inject(MAT_DIALOG_DATA) private defaultConfig: IDateRangeConfig,
		private _app: AppService
	) { }



	/* Form Getters */
	get startAt(): AbstractControl { return <AbstractControl>this.form.get('startAt') }
	get endAt(): AbstractControl { return <AbstractControl>this.form.get('endAt') }




    ngOnInit(): void {
		if (this.defaultConfig) {
			this.startAt.setValue(new Date(this.defaultConfig.startAt));
			this.endAt.setValue(new Date(this.defaultConfig.endAt));
		} else {
			const endAt: number = this._app.serverTime.value!;
			this.startAt.setValue(new Date(moment(endAt).subtract(24, "hours").valueOf()));
			this.endAt.setValue(new Date(endAt));
		}
    }





	/*
	* Closes the dialog and returns the new config object.
	* @returns void
	* */
	public submitConfig(): void { 
		this.dialogRef.close(<IDateRangeConfig>{
			startAt: this.startAt.value.getTime(),
			endAt: this.endAt.value.getTime(),
		})
    }
	
	
	
	
	
	
	
	/*
	* Closes the dialog and
	* returns false.
	* @returns void
	* */
	public cancel(): void { this.dialogRef.close(false) }
}
