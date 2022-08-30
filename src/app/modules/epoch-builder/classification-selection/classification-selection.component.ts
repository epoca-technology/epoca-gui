import { Component, OnInit } from '@angular/core';
import { IClassificationSelectionComponent } from './interfaces';

@Component({
  selector: 'app-classification-selection',
  templateUrl: './classification-selection.component.html',
  styleUrls: ['./classification-selection.component.scss']
})
export class ClassificationSelectionComponent implements OnInit, IClassificationSelectionComponent {

  constructor() { }

  ngOnInit(): void {
  }

}
