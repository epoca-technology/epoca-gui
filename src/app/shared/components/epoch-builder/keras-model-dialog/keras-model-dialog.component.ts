import { Component, OnInit } from '@angular/core';
import { IKerasModelDialogComponent } from './interfaces';

@Component({
  selector: 'app-keras-model-dialog',
  templateUrl: './keras-model-dialog.component.html',
  styleUrls: ['./keras-model-dialog.component.scss']
})
export class KerasModelDialogComponent implements OnInit, IKerasModelDialogComponent {

	constructor() { }

	ngOnInit(): void {
	}

}
