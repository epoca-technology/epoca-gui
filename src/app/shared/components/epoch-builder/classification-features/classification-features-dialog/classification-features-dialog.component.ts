import { Component, OnInit } from '@angular/core';
import { IClassificationFeaturesDialogComponent } from './interfaces';

@Component({
  selector: 'app-classification-features-dialog',
  templateUrl: './classification-features-dialog.component.html',
  styleUrls: ['./classification-features-dialog.component.scss']
})
export class ClassificationFeaturesDialogComponent implements OnInit, IClassificationFeaturesDialogComponent {

	constructor() { }

	ngOnInit(): void {
	}

}
