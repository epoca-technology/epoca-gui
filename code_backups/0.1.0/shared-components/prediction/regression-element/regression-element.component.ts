import { Component, OnInit, Input } from '@angular/core';
import { IRegressionConfig } from '../../../../core';
import { AppService, NavService } from '../../../../services';

@Component({
  selector: 'app-regression-element',
  templateUrl: './regression-element.component.html',
  styleUrls: ['./regression-element.component.scss']
})
export class RegressionElementComponent implements OnInit {
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
