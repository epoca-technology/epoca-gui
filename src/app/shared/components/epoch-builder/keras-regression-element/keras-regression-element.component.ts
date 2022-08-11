import { Component, OnInit } from '@angular/core';
import { IKerasRegressionElementComponent } from './interfaces';

@Component({
  selector: 'app-keras-regression-element',
  templateUrl: './keras-regression-element.component.html',
  styleUrls: ['./keras-regression-element.component.scss']
})
export class KerasRegressionElementComponent implements OnInit, IKerasRegressionElementComponent {

	constructor() { }

	ngOnInit(): void {
	}

}
