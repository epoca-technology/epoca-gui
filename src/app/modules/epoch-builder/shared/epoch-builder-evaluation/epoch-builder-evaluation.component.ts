import { Component, OnInit, Input } from '@angular/core';
import { IEpochBuilderEvaluation } from '../../../../core';
import { NavService } from '../../../../services';
import { IEpochBuilderEvaluationComponent } from './interfaces';

@Component({
  selector: 'app-epoch-builder-evaluation',
  templateUrl: './epoch-builder-evaluation.component.html',
  styleUrls: ['./epoch-builder-evaluation.component.scss']
})
export class EpochBuilderEvaluationComponent implements OnInit, IEpochBuilderEvaluationComponent {
	// Evaluation Result
	@Input() evaluation!: IEpochBuilderEvaluation;

	// Active Category
	public active?: number = 0;

	constructor(
		public _nav: NavService
	) { }

	ngOnInit(): void {
	}

}
