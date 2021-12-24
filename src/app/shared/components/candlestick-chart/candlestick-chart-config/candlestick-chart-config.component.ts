import { Component, Inject, OnInit } from '@angular/core';
import {AbstractControl, FormControl, FormGroup, Validators} from '@angular/forms';
import {MatDialogRef, MAT_DIALOG_DATA} from "@angular/material/dialog";
import { CandlestickChartService, ICandlestickChartConfig } from '../../../../services';
import { ICandlestickChartConfigComponent } from './interfaces';




@Component({
  selector: 'app-candlestick-chart-config',
  templateUrl: './candlestick-chart-config.component.html',
  styleUrls: ['./candlestick-chart-config.component.scss']
})
export class CandlestickChartConfigComponent implements OnInit, ICandlestickChartConfigComponent {
    // Form
	public form = new FormGroup ({
        start: new FormControl('', [ Validators.required ]),
        end: new FormControl('', [ Validators.required ]),
        intervalMinutes: new FormControl('', [ Validators.required ]),
    });

    constructor(
        private dialogRef: MatDialogRef<CandlestickChartConfigComponent>,
        @Inject(MAT_DIALOG_DATA) private data: ICandlestickChartConfig,
        private _candlestickChart: CandlestickChartService
    ) { }





	/* Form Getters */
	get start(): AbstractControl { return <AbstractControl>this.form.get('start') }
	get end(): AbstractControl { return <AbstractControl>this.form.get('end') }
	get intervalMinutes(): AbstractControl { return <AbstractControl>this.form.get('intervalMinutes') }




    ngOnInit(): void {
        this.start.setValue(new Date(this.data.start));
        this.end.setValue(new Date(this.data.end));
        this.intervalMinutes.setValue(this.data.intervalMinutes);
    }












	/*
	* Closes the dialog and returns the new config object.
	* @returns void
	* */
	public updateConfig(restoreDefaults?: boolean): void { 
        if (restoreDefaults) {
            this.dialogRef.close(this._candlestickChart.getDefaultConfig());
        } else {
            this.dialogRef.close({
                start: this.start.value.getTime(),
                end: this.end.value.getTime(),
                intervalMinutes: this.intervalMinutes.value,
            }) 
        }
    }
	
	
	
	
	
	
	
	/*
	* Closes the dialog and
	* returns false.
	* @returns void
	* */
	public cancel(): void { this.dialogRef.close(false) }
}
