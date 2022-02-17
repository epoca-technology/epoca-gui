import { Component, OnDestroy, OnInit } from '@angular/core';
import { ITradingSessionComponent } from './interfaces';
import { AppService, ILayout, NavService } from '../../../services';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-trading-session',
  templateUrl: './trading-session.component.html',
  styleUrls: ['./trading-session.component.scss']
})
export class TradingSessionComponent implements OnInit, OnDestroy, ITradingSessionComponent {
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
