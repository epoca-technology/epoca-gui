import { Component, OnInit, Inject } from '@angular/core';
import { IForecastChartDialogComponent } from './interfaces';
import {MatDialogRef, MAT_DIALOG_DATA} from "@angular/material/dialog";
import { ForecastService, IForecastResult, UtilsService } from '../../../../core';
import { ApexAnnotations } from 'ng-apexcharts';
import { ChartService, SnackbarService } from '../../../../services';



@Component({
  selector: 'app-forecast-chart-dialog',
  templateUrl: './forecast-chart-dialog.component.html',
  styleUrls: ['./forecast-chart-dialog.component.scss']
})
export class ForecastChartDialogComponent implements OnInit, IForecastChartDialogComponent {
	// Forecast Result
	public forecast!: IForecastResult;
	public annotations: ApexAnnotations = {yaxis: []};

	// Load State
	public loaded: boolean = false;


	constructor(
		public dialogRef: MatDialogRef<ForecastChartDialogComponent>,
		@Inject(MAT_DIALOG_DATA) private data: {start: number, end: number},
		public _forecast: ForecastService,
		private _chart: ChartService,
		private _utils: UtilsService,
		private _snackbar: SnackbarService
	) { }




	async ngOnInit(): Promise<void> {
		try {
			// Set loading state
			this.loaded = false;

			// Retrieve the forecast
			this.forecast = await this._forecast.forecast(
				this.data.start, 
				this.data.end,
			);

			// Build the annotations
			this.annotations.yaxis = this._chart.buildKeyZonesAnnotations(this.forecast.state.zones, this.forecast.state.price);
		} catch (e) {
			console.log(e);
			this._snackbar.error(this._utils.getErrorMessage(e));
		}

		// Update loaded state
		this.loaded = true;
	}




	/*
	* Closes the dialog.
	* @returns void
	* */
	public close(): void { this.dialogRef.close() }

}
