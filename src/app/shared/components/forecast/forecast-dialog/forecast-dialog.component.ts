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

	// Resistances & Supports
	public visibleResistances: number = 2;
	public visibleSupports: number = 2;

	// Zones From Price
	public below: IKeyZone[] = [];
	public above: IKeyZone[] = [];

	constructor(
		private dialogRef: MatDialogRef<ForecastDialogComponent>,
		@Inject(MAT_DIALOG_DATA) public forecast: IForecastResult,
		public _forecast: ForecastService,
		public _nav: NavService
	) { }





	ngOnInit(): void {
		// Populate Action Color Class
		if (this.forecast.state.tr) { this.actionColorClass = 'success-color' }
		else if (this.forecast.state.ts) { this.actionColorClass = 'error-color' }

		// Populate zones from price
		this.below = this._forecast.getZonesFromPrice(this.forecast.state.p, this.forecast.state.kz, false);
		this.above = this._forecast.getZonesFromPrice(this.forecast.state.p, this.forecast.state.kz, true);
	}

	




	



	/*
	* Closes the dialog.
	* @returns void
	* */
	public close(): void { this.dialogRef.close() }
}
