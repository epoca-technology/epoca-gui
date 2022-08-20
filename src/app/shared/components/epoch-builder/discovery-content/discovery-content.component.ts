import { Component, Input, OnInit } from '@angular/core';
import { IDiscovery, IDiscoveryPayload } from '../../../../core';
import { IDiscoveryContentComponent } from './interfaces';

@Component({
  selector: 'app-discovery-content',
  templateUrl: './discovery-content.component.html',
  styleUrls: ['./discovery-content.component.scss']
})
export class DiscoveryContentComponent implements OnInit, IDiscoveryContentComponent {
	@Input() discovery!: IDiscovery|IDiscoveryPayload;
	constructor() { }

	ngOnInit(): void {
		// Scale the Classification Probabilities if applies
		if (this.discovery.successful_mean < 1) {
			this.discovery.increase_min = this.discovery.increase_min * 100;
			this.discovery.increase_max = this.discovery.increase_max * 100;
			this.discovery.decrease_min = this.discovery.decrease_min * 100;
			this.discovery.decrease_max = this.discovery.decrease_max * 100;
			this.discovery.increase_successful_mean = this.discovery.increase_successful_mean * 100;
			this.discovery.decrease_successful_mean = this.discovery.decrease_successful_mean * 100;
			this.discovery.successful_mean = this.discovery.successful_mean * 100;
		}
	}

}
