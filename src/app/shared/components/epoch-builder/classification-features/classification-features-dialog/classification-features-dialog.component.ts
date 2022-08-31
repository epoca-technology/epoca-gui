import { Component, OnInit, Inject } from '@angular/core';
import {MatDialogRef, MAT_DIALOG_DATA} from "@angular/material/dialog";
import { IKerasClassificationConfig, IKerasRegressionConfig, IXGBClassificationConfig } from '../../../../../core';
import { AppService, NavService } from '../../../../../services';
import { IClassificationFeaturesConfig } from '../classification-features-content';
import { IClassificationFeaturesDialogComponent } from './interfaces';

@Component({
  selector: 'app-classification-features-dialog',
  templateUrl: './classification-features-dialog.component.html',
  styleUrls: ['./classification-features-dialog.component.scss']
})
export class ClassificationFeaturesDialogComponent implements OnInit, IClassificationFeaturesDialogComponent {

	constructor(
		public dialogRef: MatDialogRef<ClassificationFeaturesDialogComponent>,
		@Inject(MAT_DIALOG_DATA) public config: IClassificationFeaturesConfig|IKerasClassificationConfig|IXGBClassificationConfig,
		public _nav: NavService,
		public _app: AppService,
	) { }

	ngOnInit(): void {

	}



	// Close Dialog
	public close(): void { this.dialogRef.close() }

}
