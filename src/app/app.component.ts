import { Component, ViewChild } from '@angular/core';
import {MatSidenav} from "@angular/material/sidenav";
import { MatIconRegistry } from "@angular/material/icon";
import { DomSanitizer } from "@angular/platform-browser";
import { IAppComponent } from './interfaces';
import { 
    AppService, 
    NavService,
    ILayout,
    IRouteState
} from './services';



@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements IAppComponent {
	// Sidenav Element
	@ViewChild('rootSidenav') sidenav: MatSidenav|undefined;
	public sidenavOpened: boolean = false;

	// App Layout
	public layout: ILayout = this._app.layout.value;

	// Custom Icons
	public readonly customIcons: string[] = ['home', 'wallet', 'format_list_numbered',
    'person','notifications','logo_google','paste'];
	
	// Route State
	public state: IRouteState = this._nav.routeState.value;

    constructor(
        private _app: AppService,
        public _nav: NavService,
        private matIconRegistry: MatIconRegistry,
		private domSanitizer: DomSanitizer
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
    }














	/*
	* Creates a new instance of Plutus.
	* @returns void
	* */
	public createNewInstance(): void {
		window.open(window.location.href, "_blank");
		if (this.sidenavOpened) this.sidenav?.close();
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
				this.domSanitizer.bypassSecurityTrustResourceUrl('../assets/fonts/svg/' + icon + '.svg')
			)
		}
	}
}
