import { Component, OnInit, Inject } from '@angular/core';
import {MatDialogRef, MAT_DIALOG_DATA} from "@angular/material/dialog";
import {AbstractControl, FormControl, FormGroup, Validators} from '@angular/forms';
import { IAlarmsConfig } from '../../../../core';
import { IAlarmsConfigDialogComponent } from './interfaces';

@Component({
  selector: 'app-alarms-config-dialog',
  templateUrl: './alarms-config-dialog.component.html',
  styleUrls: ['./alarms-config-dialog.component.scss']
})
export class AlarmsConfigDialogComponent implements OnInit, IAlarmsConfigDialogComponent {
    // Form
	public form: FormGroup;


    constructor(
        private dialogRef: MatDialogRef<AlarmsConfigDialogComponent>,
        @Inject(MAT_DIALOG_DATA) private config: IAlarmsConfig,
    ) { 
        this.form = new FormGroup ({
            max_file_system_usage: new FormControl(config.max_file_system_usage, [ Validators.required, Validators.min(30), Validators.max(99) ]),
            max_memory_usage: new FormControl(config.max_memory_usage, [ Validators.required, Validators.min(30), Validators.max(99) ]),
            max_cpu_load: new FormControl(config.max_cpu_load, [ Validators.required, Validators.min(30), Validators.max(99) ]),
            max_cpu_temperature: new FormControl(config.max_cpu_temperature, [ Validators.required, Validators.min(50), Validators.max(90) ]),
            max_gpu_load: new FormControl(config.max_gpu_load, [ Validators.required, Validators.min(30), Validators.max(99) ]),
            max_gpu_temperature: new FormControl(config.max_gpu_temperature, [ Validators.required, Validators.min(50), Validators.max(120) ]),
            max_gpu_memory_temperature: new FormControl(config.max_gpu_memory_temperature, [ Validators.required, Validators.min(50), Validators.max(90) ]),
        });
    }

    ngOnInit(): void {
    }



    /* Form Getters */
	get max_file_system_usage(): AbstractControl { return <AbstractControl>this.form.get('max_file_system_usage') }
	get max_memory_usage(): AbstractControl { return <AbstractControl>this.form.get('max_memory_usage') }
	get max_cpu_load(): AbstractControl { return <AbstractControl>this.form.get('max_cpu_load') }
	get max_cpu_temperature(): AbstractControl { return <AbstractControl>this.form.get('max_cpu_temperature') }
	get max_gpu_load(): AbstractControl { return <AbstractControl>this.form.get('max_gpu_load') }
	get max_gpu_temperature(): AbstractControl { return <AbstractControl>this.form.get('max_gpu_temperature') }
	get max_gpu_memory_temperature(): AbstractControl { return <AbstractControl>this.form.get('max_gpu_memory_temperature') }





	/*
	* Closes the dialog and returns the new config object.
	* @returns void
	* */
	public updateConfig(): void { 
		this.dialogRef.close(<IAlarmsConfig>{
			max_file_system_usage: this.max_file_system_usage.value,
			max_memory_usage: this.max_memory_usage.value,
			max_cpu_load: this.max_cpu_load.value,
			max_cpu_temperature: this.max_cpu_temperature.value,
			max_gpu_load: this.max_gpu_load.value,
			max_gpu_temperature: this.max_gpu_temperature.value,
			max_gpu_memory_temperature: this.max_gpu_memory_temperature.value,
		})
    }
	
	
	
	
	
	
	
	/*
	* Closes the dialog and
	* returns false.
	* @returns void
	* */
	public cancel(): void { this.dialogRef.close() }
}
