import { Component, OnInit, Input } from '@angular/core';
import { IRegressionModelConfig } from '../../../../../core';

@Component({
  selector: 'app-regression-model-content',
  templateUrl: './regression-model-content.component.html',
  styleUrls: ['./regression-model-content.component.scss']
})
export class RegressionModelContentComponent implements OnInit {
	@Input() model!: IRegressionModelConfig;
	constructor() { }

	ngOnInit(): void {
	}

}
