import { Component, OnInit, Input } from '@angular/core';
import { IPredictionModelConfig } from '../../../../../core';
import { AppService } from '../../../../../services';
import { IPredictionModelContentComponent } from './interfaces';

@Component({
  selector: 'app-prediction-model-content',
  templateUrl: './prediction-model-content.component.html',
  styleUrls: ['./prediction-model-content.component.scss']
})
export class PredictionModelContentComponent implements OnInit, IPredictionModelContentComponent {
	// Model coming from parent component
	@Input() model!: IPredictionModelConfig;

	// The identifier of the epoch, if provided it will be displayed instead of the model's id
	@Input() epochID?: string;

	// Wether or not to compact the content
	@Input() compact?: boolean;


	constructor(
		public _app: AppService
	) { }

	ngOnInit(): void {
	}

}
