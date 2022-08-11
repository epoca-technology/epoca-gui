import { Component, OnInit } from '@angular/core';
import { IXGBClassificationElementComponent } from './interfaces';

@Component({
  selector: 'app-xgb-classification-element',
  templateUrl: './xgb-classification-element.component.html',
  styleUrls: ['./xgb-classification-element.component.scss']
})
export class XgbClassificationElementComponent implements OnInit, IXGBClassificationElementComponent {

	constructor() { }

	ngOnInit(): void {
	}

}
