import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { AppService, ILayout, NavService } from '../../../services';
import { IEpochsComponent } from './interfaces';

@Component({
  selector: 'app-epochs',
  templateUrl: './epochs.component.html',
  styleUrls: ['./epochs.component.scss']
})
export class EpochsComponent implements OnInit, OnDestroy, IEpochsComponent {
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
