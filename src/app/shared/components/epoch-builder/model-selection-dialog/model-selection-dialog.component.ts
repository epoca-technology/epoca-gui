import { Component, OnInit } from '@angular/core';
import { IModelSelectionDialogComponent } from './interfaces';

@Component({
  selector: 'app-model-selection-dialog',
  templateUrl: './model-selection-dialog.component.html',
  styleUrls: ['./model-selection-dialog.component.scss']
})
export class ModelSelectionDialogComponent implements OnInit, IModelSelectionDialogComponent {

	constructor() { }

	ngOnInit(): void {
	}

}
