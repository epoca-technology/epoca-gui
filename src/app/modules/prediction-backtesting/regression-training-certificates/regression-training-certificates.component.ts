import { Component, OnDestroy, OnInit } from '@angular/core';
import { IRegressionTrainingCertificatesComponent } from './interfaces';

@Component({
  selector: 'app-regression-training-certificates',
  templateUrl: './regression-training-certificates.component.html',
  styleUrls: ['./regression-training-certificates.component.scss']
})
export class RegressionTrainingCertificatesComponent implements OnInit, OnDestroy, IRegressionTrainingCertificatesComponent {

	constructor() { }

	ngOnInit(): void {
	}

	ngOnDestroy(): void {
		
	}

}
