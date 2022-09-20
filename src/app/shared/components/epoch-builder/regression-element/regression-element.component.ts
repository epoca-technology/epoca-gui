import { Component, Input, OnInit } from '@angular/core';
import { IRegressionConfig } from '../../../../core';
import { AppService, NavService } from '../../../../services';
import { IRegressionElementComponent } from './interfaces';

@Component({
  selector: 'app-regression-element',
  templateUrl: './regression-element.component.html',
  styleUrls: ['./regression-element.component.scss']
})
export class RegressionElementComponent implements OnInit, IRegressionElementComponent {
	// Model coming from parent component
	@Input() config!: IRegressionConfig;

	// Compact
	@Input() compact?: boolean;

	constructor(
		public _nav: NavService,
		public _app: AppService
	) { }

	ngOnInit(): void {
	}
}
