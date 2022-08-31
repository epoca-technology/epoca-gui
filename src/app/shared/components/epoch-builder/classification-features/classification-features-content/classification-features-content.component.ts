import { Component, OnInit, Input } from '@angular/core';
import { 
	IKerasClassificationConfig, 
	IModelType, 
	IXGBClassificationConfig, 
	PredictionService 
} from '../../../../../core';
import { IClassificationFeaturesContentComponent, IClassificationFeaturesConfig } from './interfaces';

@Component({
  selector: 'app-classification-features-content',
  templateUrl: './classification-features-content.component.html',
  styleUrls: ['./classification-features-content.component.scss']
})
export class ClassificationFeaturesContentComponent implements OnInit, IClassificationFeaturesContentComponent {
	// Classification Config
	@Input() config!: IClassificationFeaturesConfig|IKerasClassificationConfig|IXGBClassificationConfig;

	// The model type of the regressions
	public modelTypes!: {[regressionID: string]: IModelType}

	constructor(private _prediction: PredictionService) { }

	ngOnInit(): void {
		// Init the model types
		this.modelTypes = this.config.regressions.reduce(
			(obj, item) => Object.assign(obj, { [item.id]: this._prediction.getModelTypeName(item) }), {}
		);
	}

}
