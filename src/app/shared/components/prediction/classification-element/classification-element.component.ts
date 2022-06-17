import { Component, OnInit, Input } from '@angular/core';
import { IClassificationConfig } from '../../../../core';
import { AppService, NavService } from '../../../../services';

@Component({
  selector: 'app-classification-element',
  templateUrl: './classification-element.component.html',
  styleUrls: ['./classification-element.component.scss']
})
export class ClassificationElementComponent implements OnInit {
	// Model coming from parent component
	@Input() config!: IClassificationConfig;

	constructor(
		public _nav: NavService,
		public _app: AppService
	) { }

	ngOnInit(): void {
	}

}
