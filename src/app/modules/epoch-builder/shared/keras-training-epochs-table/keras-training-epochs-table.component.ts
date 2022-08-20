import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { IKerasMetric, IKerasModelTrainingHistory } from '../../../../core';
import { AppService, ILayout } from '../../../../services';

@Component({
  selector: 'app-keras-training-epochs-table',
  templateUrl: './keras-training-epochs-table.component.html',
  styleUrls: ['./keras-training-epochs-table.component.scss']
})
export class KerasTrainingEpochsTableComponent implements OnInit, OnDestroy {
	// Layout
	public layout: ILayout = this._app.layout.value;
	private layoutSub?: Subscription;

	// Training History
	@Input() hist!: IKerasModelTrainingHistory;

	// Metric Name
	public metricName!: IKerasMetric;

	constructor(
		private _app: AppService
	) { }

	ngOnInit(): void {
		this.layoutSub = this._app.layout.subscribe((nl: ILayout) => this.layout = nl);

		// Init the metric name
		if (this.hist.mean_absolute_error) { this.metricName = "mean_absolute_error" }
		else if (this.hist.mean_squared_error) { this.metricName = "mean_squared_error" }
		else if (this.hist.categorical_accuracy) { this.metricName = "categorical_accuracy" }
		else if (this.hist.binary_accuracy) { this.metricName = "binary_accuracy" }
	}

	ngOnDestroy(): void {
		if (this.layoutSub) this.layoutSub.unsubscribe();
	}
}
