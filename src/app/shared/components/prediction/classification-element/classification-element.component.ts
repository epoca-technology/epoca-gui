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

	// Compact
	@Input() compact?: boolean;

	// Features Description
	public featuresDescription!: string;

	constructor(
		public _nav: NavService,
		public _app: AppService
	) { }

	ngOnInit(): void {
		// Create the features description
		this.featuresDescription = this.buildFeaturesDescription();
	}





	/**
	 * Builds a readable string containing all the features that
	 * will be used by the classification
	 * @returns string
	 */
	private buildFeaturesDescription(): string {
		let desc: string = `${this.config.models.length} Regressions`;
		if (this.config.include_rsi) { desc += ", RSI" }
		if (this.config.include_stoch) { desc += ", STOCH" }
		if (this.config.include_aroon) { desc += ", AROON" }
		if (this.config.include_stc) { desc += ", STC" }
		if (this.config.include_mfi) { desc += ", MFI" }
		return desc + ".";
	}
}
