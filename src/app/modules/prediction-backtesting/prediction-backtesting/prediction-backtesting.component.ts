import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { Subscription } from 'rxjs';
import { PredictionBacktestingService, UtilsService } from '../../../core';
import { AppService, ChartService, IBarChartOptions, ILayout, NavService, SnackbarService } from '../../../services';
import { IPredictionBacktestingComponent, ISection, ISectionID } from './interfaces';

@Component({
  selector: 'app-prediction-backtesting',
  templateUrl: './prediction-backtesting.component.html',
  styleUrls: ['./prediction-backtesting.component.scss']
})
export class PredictionBacktestingComponent implements OnInit, OnDestroy, IPredictionBacktestingComponent {
    // Sidenav Element
	@ViewChild('predBacktestingSidenav') predBacktestingSidenav: MatSidenav|undefined;
	public predBacktestingSidenavOpened: boolean = false;

	// Layout
	public layout: ILayout = this._app.layout.value;
	private layoutSub?: Subscription;

	// Backtest Initialization
	public initialized: boolean = false;
	public initializing: boolean = false;

	// Sections
	public readonly generalSections: ISection[] = [
		{id: 'points', name: 'Points', icon: 'leaderboard'},
		{id: 'accuracy', name: 'Accuracy', icon: 'ads_click'},
		{id: 'positions', name: 'Positions', icon: 'format_list_numbered'},
		{id: 'duration', name: 'Backtest Duration', icon: 'timer' },
	]
	public modelID?: string = undefined;
	public section: ISection = this.generalSections[0];
	public loaded: boolean = false;

	// Charts
	public pointsDistChart?: IBarChartOptions;
	public pointsLineChart?: any;
	public accuracyChart?: IBarChartOptions;
	public positionsChart?: IBarChartOptions;
	public durationChart?: IBarChartOptions;




	constructor(
		public _nav: NavService,
		private _snackbar: SnackbarService,
		private _app: AppService,
		private _chart: ChartService,
		private _utils: UtilsService,
		public _backtesting: PredictionBacktestingService
	) { }




	ngOnInit(): void {
		// Initialize layout
		this.layoutSub = this._app.layout.subscribe((nl: ILayout) => this.layout = nl);
	}

	ngOnDestroy(): void {
		if (this.layoutSub) this.layoutSub.unsubscribe();
		this._backtesting.resetBacktestResults();
	}





	/* Initialization */




	/**
	 * Whenever there is a file change, it will attempt to initialize the Backtest.
	 * @param event 
	 * @returns Promise<void>
	 */
	public async fileChanged(event: any): Promise<void> {
		// Set the state
		this.initializing = true;

		// Allow a small delay before moving on
		await this._utils.asyncDelay(0.5);

		// Attempt to initiaze the backtests
		try {
			// Pass the files to the service
			await this._backtesting.init(event);

			// Activate default section
			await this.activateSection(this.generalSections[0]);

			// Mark the backtest as initialized
			this.initialized = true;
		} catch (e) {
			this._snackbar.error(e)
		}

		// Update initializing state
		this.initializing = false;
	}






	/**
	 * Resets the results and navigates to the file input section.
	 * @returns void
	 */
	 public resetResults(): void {
        this._nav.displayConfirmationDialog({
            title: 'Reset Results',
            content: `<p class="align-center">Are you sure that you wish to reset the Backtesting Results?</p>`,
        }).afterClosed().subscribe(
            async (confirmed: boolean|undefined) => {
                if (confirmed) {
					this.resetComponent();
					this._backtesting.resetBacktestResults();
                }
            }
        );
	}





	/**
	 * Resets all the properties within the component.
	 * @returns void
	 */
	private resetComponent(): void {
		this.initialized = false;
		this.initializing = false;
		this.modelID = undefined;
		this.section = this.generalSections[0];
		this.loaded = false;
		this.pointsDistChart = undefined;
		this.pointsLineChart = undefined;
		this.accuracyChart = undefined;
		this.positionsChart = undefined;
		this.durationChart = undefined;
	}








	/* Navigation */




    /**
     * Activates a given section and prepares all the data needed.
	 * @param section
	 * @param modelID?
     * @returns Promise<void>
     */
	 public async activateSection(section: ISection, modelID?: string): Promise<void> {
        // Hide the sidenavs if any
		if (this.predBacktestingSidenav && this.predBacktestingSidenavOpened) this.predBacktestingSidenav.close();

		// Set loading state
		this.loaded = false;

		// Set the section values
		this.section = section;
		this.modelID = modelID;

		// Allow a small delay
		await this._utils.asyncDelay(0.5);

		// Initialize the data needed for the active section in case it hasn't been
		this.initDataForActiveSection();

		// Set loading state
		this.loaded = true;
    }









	/* Section Initialization */



	/**
	 * Initializes the data for a given section in case
	 * it hasn't been. Does nothing otherwise.
	 * @returns void
	 */
	private initDataForActiveSection(): void {
		// Points
		if (this.section.id == 'points' && (!this.pointsDistChart || !this.pointsLineChart)) { this.initPointsSection() }

		// Accuracy
		else if (this.section.id == 'accuracy' && !this.accuracyChart) { this.initAccuracySection() }

		// Positions
		else if (this.section.id == 'positions' && !this.positionsChart) { this.initPositionsSection() }

		// Duration
		else if (this.section.id == 'duration' && !this.durationChart) { this.initDurationSection() }
	}






	private initPointsSection(): void {

	}




	private initAccuracySection(): void {

	}




	private initPositionsSection(): void {

	}



	private initDurationSection(): void {

	}
}
