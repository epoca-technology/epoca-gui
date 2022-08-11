import { Component, OnInit } from '@angular/core';
import { IKerasClassificationElementComponent } from './interfaces';

@Component({
  selector: 'app-keras-classification-element',
  templateUrl: './keras-classification-element.component.html',
  styleUrls: ['./keras-classification-element.component.scss']
})
export class KerasClassificationElementComponent implements OnInit, IKerasClassificationElementComponent {

	constructor() { }

	ngOnInit(): void {
	}

}
