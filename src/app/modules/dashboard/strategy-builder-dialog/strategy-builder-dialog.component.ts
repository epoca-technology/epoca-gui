import { Component, OnInit, Inject, ViewChild, ElementRef } from '@angular/core';
import {MatDialogRef, MAT_DIALOG_DATA, MatDialog} from "@angular/material/dialog";
import {AbstractControl, FormControl, FormGroup, Validators} from "@angular/forms";
import { ApexAnnotations } from 'ng-apexcharts';
import { BigNumber } from "bignumber.js"; 
import { 
	IActivePosition, 
	IBinancePositionSide, 
	IPositionStrategy, 
	IKeyZoneState, 
	IKeyZone, 
	PositionService, 
	UtilsService,
	IStrategyLevelID,
	IPositionStrategyLevel,
	IPositionCalculatorTradeItem
} from '../../../core';
import { AppService, ChartService, ILineChartOptions } from '../../../services';
import { IKeyZonesStateDialogData, KeyzoneStateDialogComponent } from '../keyzone-state-dialog';
import { 
	IStrategyBuilderDialogComponent, 
	IStrategyBuilderDialogData, 
	IStrategyColors,
	IView,
	IStateItem
} from './interfaces';

@Component({
  selector: 'app-strategy-builder-dialog',
  templateUrl: './strategy-builder-dialog.component.html',
  styleUrls: ['./strategy-builder-dialog.component.scss']
})
export class StrategyBuilderDialogComponent implements OnInit, IStrategyBuilderDialogComponent {
    // Input Elements
    @ViewChild("initPriceControl") initPriceControl? : ElementRef;
    @ViewChild("increasePriceControl") increasePriceControl? : ElementRef;

	// Inherited values
    public currentPrice: number;
    public keyZones: IKeyZoneState;
    public side: IBinancePositionSide;
    public strategy: IPositionStrategy;
    public position: IActivePosition|undefined;

	// Active view
	public view: IView = "init";

	// General information
	public initialLevelNumber: number;
	public marginAcum: number[];

	// Init Form
	public initForm: FormGroup;

	// Increase Form
	public increaseForm: FormGroup;

	// Strategy History
	public hist: Array<IStateItem[]> = [];
	public active!: IStateItem;

	// Color Helpers
	private longColors: IStrategyColors = {
		market: "#2196F3",
		entry: "#000000",
		target: "#00796B",
		stopLoss: "#E57373",
		increase: "#F44336",
		liquidation: "#C62828",
	};
	private shortColors: IStrategyColors = {
		market: "#2196F3",
		entry: "#000000",
		target: "#00796B",
		stopLoss: "#E57373",
		increase: "#F44336",
		liquidation: "#C62828",
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
		private _position: PositionService,
		private _utils: UtilsService
	) { 
		// Populate inherited values
		this.currentPrice = this.data.currentPrice;
		this.keyZones = this.data.keyZones;
		this.side = this.data.side;
		this.strategy = this.data.strategy;
		this.position = this.data.position;

		// Calculate the current strategy state
		const { current, next } = this._position.getStrategyState(
			this.strategy,
			this.position ? this.position.isolated_wallet: this.strategy.level_1.size
		);

		// Save the initial level so the builder can be leveled down
		this.initialLevelNumber = this.position ? this._position.getLevelNumber(current.id): 1;

		// Calculate the margin acums
		this.marginAcum = this._position.getMarginAcums(this.strategy);

		// Init the forms
		this.initForm = new FormGroup ({
            price: new FormControl(this.currentPrice, [ Validators.required, this.initPriceValid() ]),
        });
		this.increaseForm = new FormGroup ({
            price: new FormControl("", [ Validators.required, this.increasePriceValid() ]),
        });

		// Select the range of colors based on the position
		this.color = this.side == "LONG" ? this.longColors: this.shortColors;

		// If a position is active, skip the initialization process
		if (this.position) {
			this.initStrategy();
		}

		// Otherwise, activate the init form and focus the input
		else {
			setTimeout(() => { if (this.initPriceControl) this.initPriceControl.nativeElement.focus() }, 100);
		}
	}

	ngOnInit(): void {
	}


    /* Form Getters */
	get initPrice(): AbstractControl { return <AbstractControl>this.initForm?.get("price") }
	get increasePrice(): AbstractControl { return <AbstractControl>this.increaseForm?.get("price") }




	/* Actions */



	/**
	 * Initializes the strategy builder based on a given price.
	 */
	public initStrategy(): void {
		// Initialize the strategy from scratch
		if (!this.position && this.initForm.valid) {
			// Build the item
			const item: IStateItem = this.buildItem([
				{ price: this.initPrice.value, margin: this.strategy.level_1.size }
			])

			// Add it to the history
			this.hist.push([item]);
			this.active = item;

			// Reset the init form and set the chart view
			this.initPrice.setValue(this.currentPrice);
			this.chartChanged();
			this.view = "chart";
		}

		// Initialize the strategy starting from the active position
		else if (this.position) {
			// Build the item
			const item: IStateItem = this.buildItem([
				{ price: this.position.entry_price, margin: this.position.isolated_wallet}
			], this.currentPrice);

			// Add it to the history
			this.hist.push([item]);
			this.active = item;

			// Reset the init form and set the chart view
			this.initPrice.setValue(this.currentPrice);
			this.chartChanged();
			this.view = "chart";
		}
	}




	




	/**
	 * Activates the level up form and sets the minimum increase
	 * price.
	 */
	public levelUp(): void {
		if (this.active) {
			this.increasePrice.setValue(this.active.increase);
			this.view = "increase";
			setTimeout(() => { if (this.increasePriceControl) this.increasePriceControl.nativeElement.focus() }, 100);
		}
	}







	/**
	 * Adds a level to the current calculation history and updates
	 * all values.
	 */
	public processLevelUp(): void {
		if (this.increaseForm.valid) {
			// Get the current state
			const { current, next } = this._position.getStrategyState(this.strategy, this.marginAcum[this.active.levelNumber - 1]);

			// Build the item
			const item: IStateItem = this.buildItem([
				{ price: this.active.entry, margin: this.marginAcum[this.active.levelNumber - 1]},
				{ price: this.increasePrice.value, margin: next!.size}
			]);

			// Add it to the history
			let newSequence = this.hist[this.hist.length - 1].slice();
			newSequence.push(item);
			this.hist.push(newSequence);
			this.active = item;

			// Reset the init form and set the chart view
			this.increasePrice.setValue(item.increase);
			this.chartChanged();
			this.view = "chart";
		}
	}





	/**
	 * Cancels the level up form and goes back to the
	 * chart.
	 */
	public cancelLevelUp(): void {
		this.increasePrice.setValue(0);
		this.view = "chart";
	}







	/**
	 * Levels down a trade in the calculator.
	 */
	public levelDown(): void {
		// Check if there is more than 1 item in the history
		if (this.hist.length > 1) {
			// Slice the last item in the history
			this.hist = this.hist.slice(0, this.hist.length - 1);

			// Set the new active item
			const currentStates: IStateItem[] = this.hist[this.hist.length - 1];
			this.active = currentStates[currentStates.length - 1];

			// Update the chart
			this.chartChanged();
		}

		// Otherwise, unset the position and initialize the strategy from scratch
		else {
			this.position = undefined;
			this.hist = [];
			this.initPrice.setValue(this.currentPrice);
			this.view = "init";
			setTimeout(() => { if (this.initPriceControl) this.initPriceControl.nativeElement.focus() }, 100);
		}
	}






	/* Misc Calculations */




	/**
	 * Builds an item to be appended to the strategy.
	 * @param trades
	 * @param currentPrice?
	 * @returns IStateItem
	 */
	private buildItem(trades: IPositionCalculatorTradeItem[], currentPrice?: number): IStateItem {
		// Get the current state
		const { current, next } = this._position.getStrategyState(
			this.strategy, 
			trades.reduce((partialSum, a) => partialSum + a.margin, 0)
		);

		// Calculate the current level number
		const levelNumber: number = this._position.getLevelNumber(current.id);

		// Calculate the position range
		const { entry, liquidation} = this._position.calculatePositionPriceRange(
			this.side,
			this.strategy.leverage,
			trades
		);

		// Calculate the target and the min increase price
		const { target, increase } = this.calculateTargetAndIncrease(current, entry, liquidation);

		// Calculate the stop loss price
		const realStopLossPercent: BigNumber = new BigNumber(this.strategy.stop_loss).dividedBy(this.strategy.leverage);
		const stopLossPrice: number = <number>this._utils.alterNumberByPercentage(
			entry,
			this.side == "LONG" ? realStopLossPercent.times(-1): realStopLossPercent
		);

		// Finally, return the item
		return {
			levelNumber: levelNumber,
			level: current,
			nextLevel: next,
			market: currentPrice || trades[trades.length - 1].price,
			entry: entry,
			target: target,
			stopLoss: stopLossPrice,
			increase: increase,
			liquidation: liquidation
		}
	}



	/**
	 * Calculates the target and increase prices based on the
	 * current level and the entry price.
	 * @param level 
	 * @param entryPrice 
	 * @param liquidationPrice 
	 * @returns {target: number, increase: number}
	 */
	 private calculateTargetAndIncrease(
		level: IPositionStrategyLevel, 
		entryPrice: number,
		liquidationPrice: number
	): {target: number, increase: number} { 
		if (this.side == "LONG") {
			return {
				target: <number>this._utils.alterNumberByPercentage(entryPrice, level.target),
				increase: <number>this._utils.alterNumberByPercentage(liquidationPrice, this.strategy.level_increase_requirement),
			}
		} else {
			return {
				target: <number>this._utils.alterNumberByPercentage(entryPrice, -(level.target)),
				increase: <number>this._utils.alterNumberByPercentage(liquidationPrice, -(this.strategy.level_increase_requirement)),
			}
		}
	}










	/* Chart Management */





	/**
	 * Triggers whenever there is a change in the strategy
	 * and plots the new chart.
	 */
	private chartChanged(): void {
		// Init the data series
		let ids: IStrategyLevelID[] = [];
		let markets: number[] = [];
		let entries: number[] = [];
		let targets: number[] = [];
		let stopLosses: number[] = [];
		let increases: number[] = [];
		let liquidations: number[] = [];

		// Iterate over the last state and build the series data
		for (let item of this.hist[this.hist.length - 1]) {
			ids.push(item.level.id);
			markets.push(item.market);
			entries.push(item.entry);
			targets.push(item.target);
			stopLosses.push(item.stopLoss);
			increases.push(item.increase);
			liquidations.push(item.liquidation);
		}

        // Build/Update the chart
        if (this.chart) {
            this.chart.series = [
				{ name: "Market", data: markets, color: this.color.market },
				{ name: "Entry", data: entries, color: this.color.entry },
				{ name: "Target", data: targets, color: this.color.target },
				{ name: "Stop Loss", data: stopLosses, color: this.color.stopLoss },
				{ name: "Increase", data: increases, color: this.color.increase },
				{ name: "Liquidation", data: liquidations, color: this.color.liquidation },
			];
			this.chart!.xaxis.categories = ids;
        } else {
            this.chart = this._chart.getLineChartOptions(
                { 
                    series: [
						{ name: "Market", data: markets, color: this.color.market },
                        { name: "Entry", data: entries, color: this.color.entry },
                        { name: "Target", data: targets, color: this.color.target },
						{ name: "Stop Loss", data: stopLosses, color: this.color.stopLoss },
                        { name: "Increase", data: increases, color: this.color.increase },
                        { name: "Liquidation", data: liquidations, color: this.color.liquidation },
                    ],
                    stroke: {
						curve: "smooth", 
						dashArray:  [0, 0, 0, 10, 3, 0], 
						width: 		[3, 3, 3, 1.5, 3, 5]
					},
					xaxis: { 
						categories: ids, 
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










	/* Form Validations */




	/*
	* Makes sure the entry price is within acceptable ranges.
	* @returns (() => {invalid: boolean}|null)
	* */
	private initPriceValid(): (() => {invalid: boolean}|null) {
		return (): {invalid: boolean}|null => {
			if (this.initPrice && this.initPrice.value) {
				const price: number = Number(this.initPrice.value);
				try {
					const minPrice: number = <number>this._utils.alterNumberByPercentage(this.currentPrice, -99);
					const maxPrice: number = <number>this._utils.alterNumberByPercentage(this.currentPrice, 10000);
					if (price < minPrice || price > maxPrice) {
						return {invalid: true};
					} else {
						return null;
					}
				} catch (e) {
					return {invalid: true};
				}
			} else {
				return {invalid: true};
			}
		};
	}






	/*
	* Makes sure the increase price is within acceptable ranges.
	* @returns (() => {invalid: boolean}|null)
	* */
	private increasePriceValid(): (() => {invalid: boolean}|null) {
		return (): {invalid: boolean}|null => {
			if (this.increasePrice && this.increasePrice.value && this.active) {
				const price: number = Number(this.increasePrice.value);
				try {
					/**
					 * If it is a long, the price must be greater than the liquidation price and less 
					 * than the min increase price.
					 */
					if (this.side == "LONG") {
						if (price > this.active.increase || price < this.active.liquidation) {
							return {invalid: true};
						} else {
							return null;
						}
					}

					/**
					 * If it is a short, the price must be less than the liquidation price and greater 
					 * than the min increase price.
					 */
					else {
						if (price < this.active.increase || price > this.active.liquidation) {
							return {invalid: true};
						} else {
							return null;
						}
					}
				} catch (e) {
					return {invalid: true};
				}
			} else {
				return {invalid: true};
			}
		};
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
