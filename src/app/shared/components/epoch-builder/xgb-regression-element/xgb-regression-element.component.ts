import { Component, OnInit } from '@angular/core';
import { IXGBRegressionElementComponent } from './interfaces';

@Component({
  selector: 'app-xgb-regression-element',
  templateUrl: './xgb-regression-element.component.html',
  styleUrls: ['./xgb-regression-element.component.scss']
})
export class XgbRegressionElementComponent implements OnInit, IXGBRegressionElementComponent {

	constructor() { }

	ngOnInit(): void {
	}

}
