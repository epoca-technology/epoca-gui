import { Component, OnInit, Input } from '@angular/core';
import { IClassificationModelConfig } from '../../../../../core';

@Component({
  selector: 'app-classification-model-content',
  templateUrl: './classification-model-content.component.html',
  styleUrls: ['./classification-model-content.component.scss']
})
export class ClassificationModelContentComponent implements OnInit {
	@Input() model!: IClassificationModelConfig;
	constructor() { }

	ngOnInit(): void {
	}

}
