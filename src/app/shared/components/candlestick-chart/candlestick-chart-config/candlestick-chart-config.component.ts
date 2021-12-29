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
    // Forecast Mode
    public forecast?: boolean;

    // Form
	public form = new FormGroup ({
        start: new FormControl('', [ Validators.required ]),
        end: new FormControl('', [ Validators.required ]),
        intervalMinutes: new FormControl('', [ Validators.required ]),
        zoneSize: new FormControl('', [ Validators.required ]),
        zoneMergeDistanceLimit: new FormControl('', [ Validators.required ]),
        reversalCountRequirement: new FormControl('', [ Validators.required ]),
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
	get zoneSize(): AbstractControl { return <AbstractControl>this.form.get('zoneSize') }
	get zoneMergeDistanceLimit(): AbstractControl { return <AbstractControl>this.form.get('zoneMergeDistanceLimit') }
	get reversalCountRequirement(): AbstractControl { return <AbstractControl>this.form.get('reversalCountRequirement') }




    ngOnInit(): void {
        this.forecast = this.data.forecast == true;
        this.start.setValue(new Date(this.data.start));
        this.end.setValue(new Date(this.data.end));
        this.intervalMinutes.setValue(this.data.intervalMinutes);
        this.zoneSize.setValue(this.data.zoneSize);
        this.zoneMergeDistanceLimit.setValue(this.data.zoneMergeDistanceLimit);
        this.reversalCountRequirement.setValue(this.data.reversalCountRequirement);
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
                zoneSize: this.zoneSize.value,
                zoneMergeDistanceLimit: this.zoneMergeDistanceLimit.value,
                reversalCountRequirement: this.reversalCountRequirement.value,
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
