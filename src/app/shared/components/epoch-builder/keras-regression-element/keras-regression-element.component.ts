import { Component, Input, OnInit } from '@angular/core';
import { IKerasRegressionConfig } from '../../../../core';
import { AppService, NavService } from '../../../../services';
import { IKerasRegressionElementComponent } from './interfaces';

@Component({
  selector: 'app-keras-regression-element',
  templateUrl: './keras-regression-element.component.html',
  styleUrls: ['./keras-regression-element.component.scss']
})
export class KerasRegressionElementComponent implements OnInit, IKerasRegressionElementComponent {
	// Model coming from parent component
	@Input() config!: IKerasRegressionConfig;

	// Compact
	@Input() compact?: boolean;

	constructor(
		public _nav: NavService,
		public _app: AppService
	) { }

	ngOnInit(): void {
	}

}
