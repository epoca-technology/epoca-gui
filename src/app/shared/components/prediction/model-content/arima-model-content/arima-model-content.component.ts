import { Component, OnInit, Input } from '@angular/core';
import { IArimaModelConfig } from '../../../../../core';

@Component({
  selector: 'app-arima-model-content',
  templateUrl: './arima-model-content.component.html',
  styleUrls: ['./arima-model-content.component.scss']
})
export class ArimaModelContentComponent implements OnInit {
	@Input() model!: IArimaModelConfig;
	constructor() { }

	ngOnInit(): void {
	}

}
