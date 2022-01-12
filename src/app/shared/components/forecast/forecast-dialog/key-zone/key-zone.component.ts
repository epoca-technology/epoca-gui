import { Component, OnInit, Input } from '@angular/core';
import { IKeyZone } from '../../../../../core';
import { IKeyZoneComponent } from './interfaces';

@Component({
  selector: 'app-key-zone',
  templateUrl: './key-zone.component.html',
  styleUrls: ['./key-zone.component.scss']
})
export class KeyZoneComponent implements OnInit, IKeyZoneComponent {
	// Key Zone
	@Input() public keyZone!: IKeyZone

	// Current Price
	@Input() public price!: number;

	// Type of Key Zone
	public inZone: boolean = false;
	public resistance: boolean = false;
	public support: boolean = false;

	// Expanded
	public expanded: boolean = false;

	constructor(

	) { }


	ngOnInit(): void {
		this.inZone = this.price >= this.keyZone.s && this.price <= this.keyZone.e;
		this.resistance = this.price < this.keyZone.s;
		this.support = this.price > this.keyZone.e;
	}

}
