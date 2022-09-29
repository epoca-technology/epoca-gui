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

	// Wether or not to compact the content
	@Input() compact?: boolean;


	constructor(
		public _app: AppService
	) { }

	ngOnInit(): void {
	}

}
