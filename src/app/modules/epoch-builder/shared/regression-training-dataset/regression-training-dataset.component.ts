import { Component, Input, OnInit } from '@angular/core';
import { IRegressionTrainingCertificate } from '../../../../core';
import { AppService } from '../../../../services';

@Component({
  selector: 'app-regression-training-dataset',
  templateUrl: './regression-training-dataset.component.html',
  styleUrls: ['./regression-training-dataset.component.scss']
})
export class RegressionTrainingDatasetComponent implements OnInit {
	@Input() cert!: IRegressionTrainingCertificate;
	
	constructor(public _app: AppService) { }

	ngOnInit(): void {
	}

}
