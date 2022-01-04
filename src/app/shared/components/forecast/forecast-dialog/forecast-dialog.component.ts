import { Component, OnInit, Inject } from '@angular/core';
import {MatDialogRef, MAT_DIALOG_DATA} from "@angular/material/dialog";
import { NavService } from '../../../../services';
import { ForecastService, IForecastResult, IKeyZone } from '../../../../core';
import { IForecastDialogComponent } from './interfaces';

@Component({
  selector: 'app-forecast-dialog',
  templateUrl: './forecast-dialog.component.html',
  styleUrls: ['./forecast-dialog.component.scss']
})
export class ForecastDialogComponent implements OnInit, IForecastDialogComponent {
	// Color based on the action that took place
	public actionColorClass!: string;

	// Active Zone
	public activeZone: IKeyZone|undefined;

	// Resistances & Supports
	public visibleResistances: number = 2;
	public visibleSupports: number = 2;

	constructor(
		private dialogRef: MatDialogRef<ForecastDialogComponent>,
		@Inject(MAT_DIALOG_DATA) public forecast: IForecastResult,
		public _forecast: ForecastService,
		public _nav: NavService
	) { }





	ngOnInit(): void {
		// Populate Action Color Class
		if (this.forecast.state.touchedResistance || this.forecast.state.brokeResistance) { this.actionColorClass = 'success-color' }
		else if (this.forecast.state.touchedSupport || this.forecast.state.brokeSupport) { this.actionColorClass = 'error-color' }

		// Check if the price is currently in a zone
		this.forecast.state.zones.forEach((z) => { 
			if (this.forecast.state.price >= z.start && this.forecast.state.price <= z.end) this.activeZone = z;
		});
	}

	




	



	/*
	* Closes the dialog.
	* @returns void
	* */
	public close(): void { this.dialogRef.close() }
}
