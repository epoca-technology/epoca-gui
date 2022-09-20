import { Component, Input, OnInit } from '@angular/core';
import { IRegressionTrainingCertificate } from 'src/app/core';

@Component({
  selector: 'app-regression-training-dataset',
  templateUrl: './regression-training-dataset.component.html',
  styleUrls: ['./regression-training-dataset.component.scss']
})
export class RegressionTrainingDatasetComponent implements OnInit {
	@Input() cert!: IRegressionTrainingCertificate;
	
	constructor() { }

	ngOnInit(): void {
	}

}
