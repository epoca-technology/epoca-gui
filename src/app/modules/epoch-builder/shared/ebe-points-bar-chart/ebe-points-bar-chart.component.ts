import { Component, Input, Output, OnInit, EventEmitter } from '@angular/core';
import { IRegressionMetadata, IRegressionTrainingCertificate } from '../../../../core';
import { ChartService, IBarChartOptions } from '../../../../services';
import { IEBEpointsBarChartComponent } from './interfaces';

@Component({
  selector: 'app-ebe-points-bar-chart',
  templateUrl: './ebe-points-bar-chart.component.html',
  styleUrls: ['./ebe-points-bar-chart.component.scss']
})
export class EbePointsBarChartComponent implements OnInit, IEBEpointsBarChartComponent {
    // Certificates, Backtests or anything
	private ids: string[] = [];
    @Input() items!: IRegressionTrainingCertificate[];

	// Metadata
	@Input() md!: IRegressionMetadata;

	// EBE Points View
	public ebePointsView!: {
		points: IBarChartOptions
	};

    // Model Activation
    @Output() activateModel = new EventEmitter<string>();


	constructor(private _chart: ChartService) { }


	ngOnInit(): void {
		// Iterate over the items and build the required data
		let points: number[] = [];
		for (let item of this.items) {
			this.ids.push(item.id);
			points.push(item.ebe.points)
		}

		// Build the Points Chart
		this.ebePointsView = {
			points: this._chart.getBarChartOptions(
				{series: [{name: "EBE Points", data: points, color: "#000000"}]}, 
				this.ids, 
				this._chart.calculateChartHeight(110, 20, this.ids.length, 1)
			)
		}
		const self = this;
		this.ebePointsView.points.chart.events = {
			click: function(e: any, cc: any, c: any) {
				if (c.dataPointIndex >= 0) setTimeout(() => {self._activateModel(c.dataPointIndex)}, 300)
			}
		}
	}





	/**
	 * Emmits an event with the ID of the model that should be activated.
	 * @param indexOrID
	 */
	public _activateModel(indexOrID: number|string): void { 
		this.activateModel.emit(typeof indexOrID == "string" ? indexOrID: this.ids[indexOrID]) 
	}
}
