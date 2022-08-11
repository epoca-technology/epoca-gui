import { Component, OnInit } from '@angular/core';
import { IModelDialogComponent } from './interfaces';

@Component({
  selector: 'app-model-dialog',
  templateUrl: './model-dialog.component.html',
  styleUrls: ['./model-dialog.component.scss']
})
export class ModelDialogComponent implements OnInit, IModelDialogComponent {

	constructor() { }

	ngOnInit(): void {
	}

}
