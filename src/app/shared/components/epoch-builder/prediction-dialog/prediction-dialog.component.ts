import { Component, OnInit } from '@angular/core';
import { IPredictionDialogComponent } from './interfaces';

@Component({
  selector: 'app-prediction-dialog',
  templateUrl: './prediction-dialog.component.html',
  styleUrls: ['./prediction-dialog.component.scss']
})
export class PredictionDialogComponent implements OnInit, IPredictionDialogComponent {

	constructor() { }

	ngOnInit(): void {
	}

}
