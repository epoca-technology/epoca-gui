import { Component, OnDestroy, OnInit } from '@angular/core';
import { IClassificationTrainingCertificatesComponent } from './interfaces';

@Component({
  selector: 'app-classification-training-certificates',
  templateUrl: './classification-training-certificates.component.html',
  styleUrls: ['./classification-training-certificates.component.scss']
})
export class ClassificationTrainingCertificatesComponent implements OnInit, OnDestroy, IClassificationTrainingCertificatesComponent {

	constructor() { }

	ngOnInit(): void {
	}

	ngOnDestroy(): void {
		
	}

}
