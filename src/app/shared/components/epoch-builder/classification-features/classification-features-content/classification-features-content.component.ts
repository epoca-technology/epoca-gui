import { Component, OnInit } from '@angular/core';
import { IClassificationFeaturesContentComponent } from './interfaces';

@Component({
  selector: 'app-classification-features-content',
  templateUrl: './classification-features-content.component.html',
  styleUrls: ['./classification-features-content.component.scss']
})
export class ClassificationFeaturesContentComponent implements OnInit, IClassificationFeaturesContentComponent {

  constructor() { }

  ngOnInit(): void {
  }

}
