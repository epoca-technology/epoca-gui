import { Component, OnDestroy, OnInit } from '@angular/core';
import { IRegressionSelectionComponent } from './interfaces';

@Component({
  selector: 'app-regression-selection',
  templateUrl: './regression-selection.component.html',
  styleUrls: ['./regression-selection.component.scss']
})
export class RegressionSelectionComponent implements OnInit, OnDestroy, IRegressionSelectionComponent {

	constructor() { }

	ngOnInit(): void {
	}

	ngOnDestroy(): void {
		
	}

}
