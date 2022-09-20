import { Component, Input, Output, OnInit, EventEmitter } from '@angular/core';
import { IRegressionMetadata, IRegressionTrainingCertificate } from '../../../../core';
import { ChartService, IBarChartOptions } from '../../../../services';
import { IKerasTrainingEpochsBarChartComponent } from './interfaces';



@Component({
  selector: 'app-keras-training-epochs-bar-chart',
  templateUrl: './keras-training-epochs-bar-chart.component.html',
  styleUrls: ['./keras-training-epochs-bar-chart.component.scss']
})
export class KerasTrainingEpochsBarChartComponent implements OnInit, IKerasTrainingEpochsBarChartComponent {
    // Certificates, Backtests or anything
	private ids: string[] = [];
    @Input() items!: IRegressionTrainingCertificate[];

	// Metadata
	@Input() md!: IRegressionMetadata;

	// Epochs View
	public epochsView!: {
		epochs: IBarChartOptions
	};

    // Model Activation
    @Output() activateModel = new EventEmitter<string>();


	constructor(private _chart: ChartService) { }


	ngOnInit(): void {
		// Iterate over the items and build the required data
		let epochs: number[] = [];
		for (let item of this.items) {
			this.ids.push(item.id);
			epochs.push(item.training_history.loss.length);
		}

		// Build the Points Chart
		this.epochsView = {
			epochs: this._chart.getBarChartOptions(
				{series: [{name: "EBE Points", data: epochs, color: "#000000"}]}, 
				this.ids, 
				this._chart.calculateChartHeight(110, 20, this.ids.length, 1)
			)
		}
		const self = this;
		this.epochsView.epochs.chart.events = {
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
