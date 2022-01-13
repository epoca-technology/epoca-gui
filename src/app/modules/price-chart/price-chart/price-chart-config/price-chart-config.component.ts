import { Component, Inject, OnInit } from '@angular/core';
import { IPriceChartConfigComponent } from './interfaces';
import {AbstractControl, FormControl, FormGroup, Validators} from '@angular/forms';
import {MatDialogRef, MAT_DIALOG_DATA} from "@angular/material/dialog";
import { IPriceChartConfig } from '../interfaces';


@Component({
  selector: 'app-price-chart-config',
  templateUrl: './price-chart-config.component.html',
  styleUrls: ['./price-chart-config.component.scss']
})
export class PriceChartConfigComponent implements OnInit, IPriceChartConfigComponent {
    // Form
	public form = new FormGroup ({
        start: new FormControl('', [ Validators.required ]),
        end: new FormControl('', [ Validators.required ]),
        intervalMinutes: new FormControl('', [ Validators.required ]),
    });

	constructor(
		private dialogRef: MatDialogRef<PriceChartConfigComponent>,
		@Inject(MAT_DIALOG_DATA) private data: IPriceChartConfig,
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
