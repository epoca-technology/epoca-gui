import { Component, OnDestroy, OnInit } from '@angular/core';
import { ITradingSessionsComponent } from './interfaces';
import { AppService, ILayout, NavService } from '../../../services';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-trading-session',
  templateUrl: './trading-sessions.component.html',
  styleUrls: ['./trading-sessions.component.scss']
})
export class TradingSessionsComponent implements OnInit, OnDestroy, ITradingSessionsComponent {
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
