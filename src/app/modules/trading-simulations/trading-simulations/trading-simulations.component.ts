import { Component, OnInit, OnDestroy } from '@angular/core';
import { ITradingSimulationsComponent } from './interfaces';
import { AppService, ILayout, NavService } from '../../../services';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-trading-simulations',
  templateUrl: './trading-simulations.component.html',
  styleUrls: ['./trading-simulations.component.scss']
})
export class TradingSimulationsComponent implements OnInit, OnDestroy, ITradingSimulationsComponent {
    // Layout
	public layout: ILayout = this._app.layout.value;
	private layoutSub?: Subscription;

    // Loading State
    public loaded: boolean = false;

    // Submission State
    public submitting: boolean = false;

    constructor(
        public _nav: NavService,
        private _app: AppService,
    ) { }

    ngOnInit(): void {
        // Initialize layout
        this.layoutSub = this._app.layout.subscribe((nl: ILayout) => this.layout = nl);

        // Set the loading state
        this.loaded = true;
    }

    ngOnDestroy(): void {
        if (this.layoutSub) this.layoutSub.unsubscribe();
    }
}
