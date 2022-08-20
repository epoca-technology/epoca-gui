import { Component, Input, OnInit } from '@angular/core';
import { UtilsService } from '../../../../core';
import { ChartService, ILineChartOptions } from '../../../../services';
import { ILearningCurveComponent, ILearningCurve } from './interfaces';

@Component({
  selector: 'app-learning-curve',
  templateUrl: './learning-curve.component.html',
  styleUrls: ['./learning-curve.component.scss']
})
export class LearningCurveComponent implements OnInit, ILearningCurveComponent {
	// Colors
	private readonly colors = {
		trainLoss: "#E57373",
		valLoss: "#B71C1C",
		trainAcc: "#4DB6AC",
		valAcc: "#004D40",
	}

	// Curve
	@Input() curveConfig!: ILearningCurve;
	public curveChart!: ILineChartOptions;

	// The values in which the model ended its training
	public finalTrain!: number;
	public finalVal!: number;

	constructor(
		private _chart: ChartService,
		private _utils: UtilsService
	) { }



	ngOnInit(): void {
		// Init the curve values
		const train: number[] = <number[]>this.curveConfig.train.map(val => { return this._utils.outputNumber(val, {dp: 6})});
		const val: number[] = <number[]>this.curveConfig.val.map(val => { return this._utils.outputNumber(val, {dp: 6})});

		// Build the chart
		this.curveChart = this._chart.getLineChartOptions(
			{
				series: [
					{
						name: this.curveConfig.type == "loss" ? "train_loss": "train_acc", 
						data: train, 
						color: this.curveConfig.type == "loss" ? this.colors.trainLoss: this.colors.trainAcc 
					},
					{
						name: this.curveConfig.type == "loss" ? "val_loss": "val_acc", 
						data: val,  
						color: this.curveConfig.type == "loss" ? this.colors.valLoss: this.colors.valAcc 
					}
				],
				stroke: {curve: "straight", dashArray: [0, 5]}
			}, 320, true
		);

		// Init the final values
		this.finalTrain = train[train.length - 1];
		this.finalVal = val[val.length - 1];
	}

}
