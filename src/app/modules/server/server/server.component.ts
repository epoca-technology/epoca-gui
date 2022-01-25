import { Component,  OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { Subscription } from 'rxjs';
import { AppService, ILayout } from '../../../services';
import { IServerComponent } from './interfaces';

@Component({
  selector: 'app-server',
  templateUrl: './server.component.html',
  styleUrls: ['./server.component.scss']
})
export class ServerComponent implements OnInit, OnDestroy, IServerComponent {

    // Server Sidenav Element
	@ViewChild('serverSidenav') serverSidenav: MatSidenav|undefined;
	public serverSidenavOpened: boolean = false;
	
	// Layout
	public layout: ILayout = this._app.layout.value;
	private layoutSub?: Subscription;

    // Load State
    public loaded = true;

    constructor(
        private _app: AppService
    ) { }

    ngOnInit(): void {
        // Initialize layout
        this.layoutSub = this._app.layout.subscribe((nl: ILayout) => this.layout = nl);
    }

    ngOnDestroy(): void {
        if (this.layoutSub) this.layoutSub.unsubscribe();
    }





    public doSomething(): void {
        // Hide the sidenavs if any
		if (this.serverSidenav && this.serverSidenavOpened) this.serverSidenav.close();
    }
}
