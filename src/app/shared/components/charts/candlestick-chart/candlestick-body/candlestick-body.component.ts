import { Component, OnInit, Input } from '@angular/core';
import { ICandlestick } from '../../../../../core';
import { SnackbarService } from '../../../../../services';

@Component({
  selector: 'app-candlestick-body',
  templateUrl: './candlestick-body.component.html',
  styleUrls: ['./candlestick-body.component.scss']
})
export class CandlestickBodyComponent implements OnInit {
	// Candlestick Object
	@Input() candlestick!: ICandlestick;

	constructor(
		private _snackbar: SnackbarService
	) { }

	ngOnInit(): void {
		if (!this.candlestick) {
			this._snackbar.error('The candlestick must be provided in order to be able to view the body.');
		}
	}
}
