import { Component, OnInit, Inject } from '@angular/core';
import {MatDialogRef, MAT_DIALOG_DATA, MatDialog} from "@angular/material/dialog";
import { ApexAnnotations } from 'ng-apexcharts';
import { 
	IActivePosition, 
	IBinancePositionSide, 
	IPositionStrategy, 
	IKeyZoneState, 
	IKeyZone, 
	PositionService 
} from '../../../core';
import { AppService, ChartService, ILineChartOptions } from '../../../services';
import { IKeyZonesStateDialogData, KeyzoneStateDialogComponent } from '../keyzone-state-dialog';
import { 
	IStrategyBuilderDialogComponent, 
	IStrategyBuilderDialogData, 
	IStrategyColors,
	IView
} from './interfaces';

@Component({
  selector: 'app-strategy-builder-dialog',
  templateUrl: './strategy-builder-dialog.component.html',
  styleUrls: ['./strategy-builder-dialog.component.scss']
})
export class StrategyBuilderDialogComponent implements OnInit, IStrategyBuilderDialogComponent {
	// Inherited values
    public currentPrice: number;
    public keyZones: IKeyZoneState;
    public side: IBinancePositionSide;
    public strategy: IPositionStrategy;
    public position: IActivePosition|undefined;

	// Active view
	public view: IView = "init";

	//
	public initialLevelNumber: number;
	public levelNumber: number;
	public marginAcum: number[];

	public hist: any[] = [
		{
			levelNumber: 1,
			level: { id : "level_1", size: 150, target: 1.5},
			entry: 0,
			target: 0,
			increase: 0,
			liquidation: 0
		}
	]

	// Color Helpers
	private longColors: IStrategyColors = {
		entry: "#004D40",
		target: "#009688",
		increase: "#00BFA5",
		liquidation: "#80CBC4",
	};
	private shortColors: IStrategyColors = {
		entry: "#D50000",
		target: "#FF1744",
		increase: "#FF5252",
		liquidation: "#FF8A80",
	}
	private color: IStrategyColors;

	// Chart
	public chart?: ILineChartOptions;

	constructor(
		private dialogRef: MatDialogRef<StrategyBuilderDialogComponent>,
		@Inject(MAT_DIALOG_DATA) private data: IStrategyBuilderDialogData,
		private _app: AppService,
        private dialog: MatDialog,
		private _chart: ChartService,
		private _position: PositionService
	) { 
		// Populate inherited values
		this.currentPrice = this.data.currentPrice;
		this.keyZones = this.data.keyZones;
		this.side = this.data.side;
		this.strategy = this.data.strategy;
		this.position = this.data.position;

		// Calculate the margin acums
		const { current, next } = this._position.getStrategyState(
			this.strategy,
			this.position ? this.position.isolated_wallet: this.strategy.level_1.size
		);
		this.initialLevelNumber = this._position.getLevelNumber(current.id);
		this.levelNumber = this.initialLevelNumber;
		this.marginAcum = this._position.getMarginAcums(this.strategy);

		// Select the range of colors based on the position
		this.color = this.side == "LONG" ? this.longColors: this.shortColors;

		// If a position is active, skip the initialization process
		if (this.position) {

			this.view = "chart";
		}

		// Otherwise, activate the init form and focus the input
		else {

		}
		this.chartChanged();
	}

	ngOnInit(): void {
	}






	/* Actions */



	public levelUp(): void {

	}



	public levelDown(): void {
		
	}





	/* Chart Management */



	private chartChanged(): void {
        // Build/Update the chart
        if (this.chart) {
            /*this.chart.series = [
                {
                    name: "Entry Price", 
                    data: [], 
                    color: this.color.entry
                }
            ]*/
        } else {
            this.chart = this._chart.getLineChartOptions(
                { 
                    series: [
                        {
                            name: "Entry", 
                            data: [16755, 17285.55, 18285.55], 
                            color: this.color.entry
                        },
                        {
                            name: "Target", 
                            data: [16655, 17115.43, 17415.43], 
                            color: this.color.target
                        },
                        {
                            name: "Increase", 
                            data: [17905.33, 18248.43, 19031.43], 
                            color: this.color.increase
                        },
                        {
                            name: "Liquidation", 
                            data: [21155.29, 22864.11, 24464.11], 
                            color: this.color.liquidation
                        },
                    ],
                    stroke: {
						curve: "smooth", 
						dashArray: [5, 0, 10, 0], 
						width: [3, 3, 2, 4]
					},
					xaxis: { 
						categories: ["level_1", "level_2", "level_3"], 
						tooltip: {enabled: false}, 
						labels: { show: true }, 
						axisTicks: { show: true}
					}
                },
                this._app.layout.value == "desktop" ? 600: 385
            );
			this.chart.annotations = this.buildKeyZonesAnnotations();
			this.chart.yaxis.tooltip = { enabled: true };
        }
	}





	/**
	 * Builds the annotations for all the keyzones.
	 * @returns ApexAnnotations
	 */
	private buildKeyZonesAnnotations(): ApexAnnotations {
		// Init the annotations
		let annotations: ApexAnnotations = { yaxis: [] };

		// Concatenate all the keyzones
		let zones: IKeyZone[] = this.keyZones.above.concat(this.keyZones.below);
		if (this.keyZones.active) zones.push(this.keyZones.active)

        // Build the annotations
        for (let i = 0; i < zones.length; i++) {
            annotations.yaxis!.push({
				y: zones[i].s,
				y2: zones[i].e,
				strokeDashArray: 0,
				borderColor: "#90A4AE",
				fillColor: "#90A4AE"
			})
        }

        // Finally, return the annotations
        return annotations;
	}







	/* Misc Helpers */




    /**
     * Displays the keyzone state dialog.
     */
	 public displayKeyZoneDialog(): void {
		this.dialog.open(KeyzoneStateDialogComponent, {
			hasBackdrop: this._app.layout.value != "mobile",
			panelClass: "large-dialog",
			data: <IKeyZonesStateDialogData> {
                state: this.keyZones,
                currentPrice: this.currentPrice
            }
		})
    }




	/*
	* Closes the dialog and
	* returns false.
	* @returns void
	* */
	public cancel(): void { this.dialogRef.close() }
}
