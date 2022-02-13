import { Component, Inject, OnInit } from '@angular/core';
import { ICandlesticksConfigDialogComponent } from './interfaces';
import {AbstractControl, FormControl, FormGroup, Validators} from '@angular/forms';
import {MatDialogRef, MAT_DIALOG_DATA} from "@angular/material/dialog";
import { ICandlesticksConfig } from '../interfaces';

@Component({
  selector: 'app-candlesticks-config-dialog',
  templateUrl: './candlesticks-config-dialog.component.html',
  styleUrls: ['./candlesticks-config-dialog.component.scss']
})
export class CandlesticksConfigDialogComponent implements OnInit, ICandlesticksConfigDialogComponent {

    // Form
	public form = new FormGroup ({
        start: new FormControl('', [ Validators.required ]),
        end: new FormControl('', [ Validators.required ]),
        intervalMinutes: new FormControl('', [ Validators.required ]),
    });

	constructor(
		private dialogRef: MatDialogRef<CandlesticksConfigDialogComponent>,
		@Inject(MAT_DIALOG_DATA) private data: ICandlesticksConfig,
	) { }



	/* Form Getters */
	get start(): AbstractControl { return <AbstractControl>this.form.get('start') }
	get end(): AbstractControl { return <AbstractControl>this.form.get('end') }
	get intervalMinutes(): AbstractControl { return <AbstractControl>this.form.get('intervalMinutes') }




    ngOnInit(): void {
        this.start.setValue(new Date(<number>this.data.start));
        this.end.setValue(new Date(<number>this.data.end));
        this.intervalMinutes.setValue(this.data.intervalMinutes);
    }












	/*
	* Closes the dialog and returns the new config object.
	* @returns void
	* */
	public updateConfig(): void { 
		this.dialogRef.close({
			start: this.start.value.getTime(),
			end: this.end.value.getTime(),
			intervalMinutes: this.intervalMinutes.value,
		})
    }
	
	
	
	
	
	
	
	/*
	* Closes the dialog and
	* returns false.
	* @returns void
	* */
	public cancel(): void { this.dialogRef.close(false) }

}
