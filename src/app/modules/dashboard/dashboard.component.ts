import {Component, OnInit, OnDestroy, ViewChild} from "@angular/core";
import {MatSidenav} from "@angular/material/sidenav";
import { IDashboardComponent } from "./interfaces";
import {Subscription} from "rxjs";
import { AppService, ILayout, NavService } from "../../services";
import { AuthService } from "../../core";

@Component({
  selector: "app-dashboard",
  templateUrl: "./dashboard.component.html",
  styleUrls: ["./dashboard.component.scss"]
})
export class DashboardComponent implements OnInit, OnDestroy, IDashboardComponent {
	// Sidenav Element
	@ViewChild("homeSidenav") sidenav: MatSidenav|undefined;
	public sidenavOpened: boolean = false;
	
	// Layout
	public layout: ILayout = this._app.layout.value;
	private layoutSub?: Subscription;

    // Submenus
    public builderExpanded: boolean = false;

    constructor(
        public _app: AppService,
        public _nav: NavService,
        private _auth: AuthService
    ) { }

    async ngOnInit(): Promise<void> {
        // Initialize layout
		this.layoutSub = this._app.layout.subscribe((nl: ILayout) => this.layout = nl);
    }

    ngOnDestroy(): void {
        if (this.layoutSub) this.layoutSub.unsubscribe();
    }

    











    

    /* Nav Actions */




	/*
	* Creates a new instance of Epoca.
	* @returns void
	* */
	public createNewInstance(): void { this._nav.openUrl(window.location.href) }



	/*
	* Signs the user out
	* @returns void
	* */
	public signOut(): void {
        this._nav.displayConfirmationDialog({
            title: "Sign Out",
            content: "<p class='align-center'>If you confirm the action, your session will be destroyed on all your active tabs.</p>"
        }).afterClosed().subscribe(
            async (confirmed: boolean) => {
                if (confirmed) {
                    // Sign the user out
                    try {
                        // Close the sidenav if opened
                        if (this.sidenavOpened) await this.sidenav?.close(); 
                        await this._nav.signIn();
                        await this._auth.signOut();
                        this._app.success("The session has been destroyed successfully.");
                    } catch (e) { this._app.error(e) }
                }
            }
        );
	}
}

