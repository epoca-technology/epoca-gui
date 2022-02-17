import {Component, OnInit, OnDestroy, ViewChild} from '@angular/core';
import {MatSidenav} from "@angular/material/sidenav";
import { IDashboardComponent } from './interfaces';
import {Subscription} from "rxjs";
import { environment } from '../../../environments/environment';
import { AppService, ILayout, SnackbarService } from '../../services';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy, IDashboardComponent {
	// Sidenav Element
	@ViewChild('homeSidenav') sidenav: MatSidenav|undefined;
	public sidenavOpened: boolean = false;
	
	// Layout
	public layout: ILayout = this._app.layout.value;
	private layoutSub?: Subscription;

    constructor(
        private _app: AppService,
        private _snackbar: SnackbarService,
    ) { }

    async ngOnInit(): Promise<void> {
        // Initialize layout
		this.layoutSub = this._app.layout.subscribe((nl: ILayout) => this.layout = nl);
    }

    ngOnDestroy(): void {
        if (this.layoutSub) this.layoutSub.unsubscribe();
    }

    
}

