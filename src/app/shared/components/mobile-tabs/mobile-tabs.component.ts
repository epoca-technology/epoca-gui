import { Component, OnDestroy, OnInit } from "@angular/core";
import { Subscription } from "rxjs";
import { AppService, IRouteState, NavService } from "../../../services";
import { IMobileTabsComponent } from "./interfaces";

@Component({
  selector: "app-mobile-tabs",
  templateUrl: "./mobile-tabs.component.html",
  styleUrls: ["./mobile-tabs.component.scss"]
})
export class MobileTabsComponent implements OnInit, OnDestroy, IMobileTabsComponent {
	// Route State
	public activeTab: number|null = null;
	private routeStateSub: Subscription|undefined;


    constructor(
		public _app: AppService,
        private _nav: NavService,
    ) { }

    ngOnInit(): void {
        this.routeStateSub = this._nav.routeState.subscribe((ns: IRouteState) => { this.onRouteChange(ns) });
    }

    ngOnDestroy(): void {
        if (this.routeStateSub) this.routeStateSub.unsubscribe();
    }




	
	/*
	* Activates provided module.
	* @param tab
	* @returns void
	* */
	public navigate(tab: number): void {
		// Set the selected tab
		this.activeTab = tab;
		
		// Navigate
		switch (tab) {
			case 0:
				this._nav.dashboard();
				break;
			case 1:
				this._nav.tradingSessions();
				break;
			case 2:
				this._nav.marketState();
				break;
			case 3:
				this._nav.predictions();
				break;
			case 4:
				this._nav.server();
				break;
		}
	}
	
	
	

	
	
	
	
	
	
	
	/*
	* Activates the proper tab on
	* route change.
	* @returns void
	* */
	private onRouteChange(ns: IRouteState): void {
		// Discard if the app is navigating
		if (ns.navigating) return;
		
		// Select the tab accordingly
		switch (ns.module) {
			case "dashboard":
				this.activeTab = 0;
				break;
			case "tradingSessions":
				this.activeTab = 1;
				break;
			case "marketState":
				this.activeTab = 2;
				break;
			case "predictions":
				this.activeTab = 3;
				break;
			case "server":
				this.activeTab = 4;
				break;
			default:
				this.activeTab = null;
		}
	}
}
