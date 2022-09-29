import { Component, OnInit, Input } from '@angular/core';
import { IPredictionModelConfig } from '../../../../../core';
import { NavService, AppService } from '../../../../../services';
import { IPredictionModelElementComponent } from './interfaces';

@Component({
  selector: 'app-prediction-model-element',
  templateUrl: './prediction-model-element.component.html',
  styleUrls: ['./prediction-model-element.component.scss']
})
export class PredictionModelElementComponent implements OnInit, IPredictionModelElementComponent {
	// Model coming from parent component
	@Input() config!: IPredictionModelConfig;

	// Compact
	@Input() compact?: boolean;

	constructor(
		public _nav: NavService,
		public _app: AppService
	) { }

	ngOnInit(): void {
	}
}
