import { Component, OnInit, Input } from '@angular/core';
import { 
	IModel, 
	PredictionService, 
	IModelType, 
	IArimaModelConfig, 
	IRegressionModelConfig,
	IClassificationModelConfig,
	IConsensusModelConfig
} from '../../../../core';
import { NavService } from '../../../../services';
import { IModelContentComponent } from './interfaces';

@Component({
  selector: 'app-model-content',
  templateUrl: './model-content.component.html',
  styleUrls: ['./model-content.component.scss']
})
export class ModelContentComponent implements OnInit, IModelContentComponent {
	// Model coming from parent component
	@Input() model!: IModel;

	// The name of the type of model
	public name!: IModelType;

	// Model Lists
	public arima_models?: IArimaModelConfig[];
	public regression_models?: IRegressionModelConfig[];
	public classification_models?: IClassificationModelConfig[];
	public consensus_model?: IConsensusModelConfig;

    constructor(
		private _prediction: PredictionService,
		public _nav: NavService
	) { }

    ngOnInit(): void {
		// Init the type name
		this.name = this._prediction.getModelTypeName(this.model);

		// Init the model lists
		this.arima_models = this.model.arima_models;
		this.regression_models = this.model.regression_models;
		this.classification_models = this.model.classification_models;
		this.consensus_model = this.model.consensus_model;
    }

}
