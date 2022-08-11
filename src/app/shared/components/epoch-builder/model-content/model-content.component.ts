import { Component, OnInit } from '@angular/core';
import { IModelContentComponent } from './interfaces';

@Component({
  selector: 'app-model-content',
  templateUrl: './model-content.component.html',
  styleUrls: ['./model-content.component.scss']
})
export class ModelContentComponent implements OnInit, IModelContentComponent {

  constructor() { }

  ngOnInit(): void {
  }

}
