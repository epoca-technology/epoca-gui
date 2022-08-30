import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormControl, FormGroup } from '@angular/forms';
import { MatSidenav } from '@angular/material/sidenav';
import { Subscription } from 'rxjs';
import { 
	UtilsService, 
	RegressionSelectionService,
	ISelectedRegression
} from '../../../core';
import { 
	AppService, 
	ILayout, 
	NavService, 
} from '../../../services';
import { IRegressionSelectionComponent, IViewID, IView } from "./interfaces";

@Component({
  selector: "app-regression-selection",
  templateUrl: "./regression-selection.component.html",
  styleUrls: ["./regression-selection.component.scss"]
})
export class RegressionSelectionComponent implements OnInit, OnDestroy, IRegressionSelectionComponent {
	// Sidenav Element
	@ViewChild('rsSidenav') rsSidenav: MatSidenav|undefined;
	public rsSidenavOpened: boolean = false;

	// Layout
	public layout: ILayout = this._app.layout.value;
	private layoutSub?: Subscription;

	// File Input Form
    public fileInputForm: FormGroup = new FormGroup({ fileInput: new FormControl('', [ ]) });

	// Initialization
	public initialized: boolean = false;
	public initializing: boolean = false;

	// Views
	public readonly views: IView[] = [
		{id: "selection", name: "Selection", icon: "checklist"},
		{id: "discovery", name: "Discovery", icon: "tune"}
	]
	public readonly viewNames = {
		selection: "Selection",
		discovery: "Discovery"
	}
	public activeView: IViewID = "selection";

	// Regression View
	public regression?: ISelectedRegression;

	// Loading state - Just for certificates
	public loaded: boolean = false;

	constructor(
		public _nav: NavService,
		public _app: AppService,
		private _utils: UtilsService,
		public _rs: RegressionSelectionService
	) { }


	ngOnInit(): void {
		this.layoutSub = this._app.layout.subscribe((nl: ILayout) => this.layout = nl);
	}

	ngOnDestroy(): void {
		if (this.layoutSub) this.layoutSub.unsubscribe();
		this._rs.reset();
	}



    /* Form Getters */
	get fileInput(): AbstractControl { return <AbstractControl>this.fileInputForm.get('fileInput') }







	/* Initialization */





	/**
	 * Whenever there is a file change, it will attempt to initialize the Training Certificates.
	 * @param event 
	 * @returns Promise<void>
	 */
	 public async fileChanged(event: any): Promise<void> {
		// Set the state
		this.initializing = true;

		// Abort the dialog if there are no files
		if (!event || !event.target || !event.target.files || !event.target.files.length) return;

		// Attempt to initiaze the regression selection
		try {
			// Pass the file to the service
			await this._rs.init(event);

			// Navigate to the selection
			await this.navigate("selection")

			// Mark the backtest as initialized
			this.initialized = true;
		} catch (e) {
			this.fileInput.setValue('');
			this._app.error(e)
		}

		// Update initializing state
		this.initializing = false;
		this.fileInput.setValue(null);
	}






	/**
	 * Resets the components values in order to view a different file.
	 * @returns void
	 */
	 public reset(): void {
		this.initialized = false;
		this.initializing = false;
		this.fileInput.setValue('');
		this.regression = undefined;
	}








	/* Navigation */





	/**
	 * Navigates to any section of the component
	 * @param viewID 
	 * @param modelIndexOrID?
	 * @returns Promise<void>
	 */
	 public async navigate(viewID: IViewID, modelIndexOrID?: number|string): Promise<void> {
		// Close the sidenav if opened
		if (this.rsSidenavOpened) this.rsSidenav?.close();

		// Scroll top
		this._nav.scrollTop('#content-header');

		// Set Loading State
		this.loaded = false;

		// Populate the active view
		this.activeView = viewID;

		// Check if it is the regression view
		if (this.activeView == "regression" && (typeof modelIndexOrID == "number" || typeof modelIndexOrID == "string")) {
			// Init the selection index
			const selectionIndex: number = typeof modelIndexOrID == "number" ? modelIndexOrID: this._rs.regressionIDs.indexOf(modelIndexOrID);

			// Populate the active selection
			this.regression = this._rs.selection[selectionIndex];
		}

		// Allow a small delay
		await this._utils.asyncDelay(0.5);

		// Update loading state
		this.loaded = true;
	}
}
