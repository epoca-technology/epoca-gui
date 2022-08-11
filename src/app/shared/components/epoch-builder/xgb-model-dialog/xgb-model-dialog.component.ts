import { Component, OnInit } from '@angular/core';
import { IXGBModelDialogComponent } from './interfaces';

@Component({
  selector: 'app-xgb-model-dialog',
  templateUrl: './xgb-model-dialog.component.html',
  styleUrls: ['./xgb-model-dialog.component.scss']
})
export class XgbModelDialogComponent implements OnInit, IXGBModelDialogComponent {

	constructor() { }

	ngOnInit(): void {
	}

}
