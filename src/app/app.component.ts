import { Component, ViewChild } from '@angular/core';
import {MatSidenav} from "@angular/material/sidenav";
import { MatIconRegistry } from "@angular/material/icon";
import { DomSanitizer } from "@angular/platform-browser";
import { IAppComponent } from './interfaces';
import { AuthService, IAuthority } from './core';
import { 
    AppService, 
    NavService,
    ILayout,
    IRouteState,
    SnackbarService
} from './services';
import { environment } from '../environments/environment';



@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements IAppComponent {
	// Sidenav Element
	@ViewChild('rootSidenav') sidenav: MatSidenav|undefined;
	public sidenavOpened: boolean = false;

    // User
    public uid: string|null|undefined;
    public authority: IAuthority = 5;

	// App Layout
	public layout: ILayout = this._app.layout.value;

	// Custom Icons
	public readonly customIcons: string[] = ['home', 'wallet', 'format_list_numbered',
    'person','notifications','logo_google','paste','ubuntu','code_branch','hdd','microchip','server','database',
    'hardware_chip', 'ssid_chart', 'brain', 'auto_graph', 'bug_report'];
	
	// Route State
	public state: IRouteState = this._nav.routeState.value;

    constructor(
        private _app: AppService,
        public _nav: NavService,
        public _auth: AuthService,
        private _snackbar: SnackbarService,
        private matIconRegistry: MatIconRegistry,
		private domSanitizer: DomSanitizer,
    ) { this.init()}






    /**
     * App Initializer
     */
    private init(): void {
		/* Layout */
		this._app.layout.subscribe((nl: ILayout) => { this.layout = nl} );
		

		/* Routing */
		this._nav.routeState.subscribe((s: IRouteState) => {
			// Update the state
			this.state = s;
			
			// Close the sidenav if opened
			if (this.sidenavOpened) this.sidenav?.close(); 
		});


		/* Custom Icons Registration */
		this.registerCustomIcons();


        /* Auth State */
        this._auth.uid.subscribe((uid: string|null|undefined) => {
            // Set the uid
            this.uid = uid;

            // Check if the user is signed in
            if (typeof this.uid == "string") {
                // @TODO
            }
        });
    }















    


    /* Action Confirmation */





	/*
	* Creates a new instance of Plutus.
	* @returns void
	* */
	public createNewInstance(): void {
        this._nav.openUrl(window.location.href);
	}








	/*
	* Signs the user out
	* @returns void
	* */
	public signOut(): void {
        this._nav.displayConfirmationDialog({
            title: 'Sign Out',
            content: '<p class="align-center">If you confirm the action, your session will be destroyed on all your active tabs.</p>'
        }).afterClosed().subscribe(
            async (confirmed: boolean) => {
                if (confirmed) {
                    // Sign the user out
                    try {
                        // Close the sidenav if opened
                        if (this.sidenavOpened) this.sidenav?.close(); 
                        await this._auth.signOut();
                        this._nav.signIn();
                        this._snackbar.success('The session has been destroyed successfully.');
                    } catch (e) { this._snackbar.error(e) }
                }
            }
        );
	}




    




	





	/* Custom Icons Registration */
	
	
	
	
	/*
	* It will register all icons declared
	* in this component with Angular Material.
	* @returns void
	* */
	private registerCustomIcons(): void {
		for (let icon of this.customIcons) {
			this.matIconRegistry.addSvgIcon(
				icon,
				this.domSanitizer.bypassSecurityTrustResourceUrl('../assets/svg/' + icon + '.svg')
			)
		}
	}
}
