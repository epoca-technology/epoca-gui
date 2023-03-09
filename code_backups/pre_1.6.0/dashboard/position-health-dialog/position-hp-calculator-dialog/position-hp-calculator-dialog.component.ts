import { Component, OnInit, Inject } from '@angular/core';
import {MatDialogRef, MAT_DIALOG_DATA} from "@angular/material/dialog";
import { 
	IBinancePositionSide, 
	IMarketState, 
	IPositionHealthWeights, 
	IPositionSideHealth, 
	IPrediction, 
	IPredictionState, 
	IPredictionStateIntesity, 
	ITAIntervalID, 
	PositionService, 
	UtilsService
} from '../../../../core';
import { AppService, NavService } from '../../../../services';
import { 
	IPositionHpCalculatorDialogComponent, 
	IPositionHpCalculatorDialogData, 
	IHPResult 
} from './interfaces';

@Component({
  selector: 'app-position-hp-calculator-dialog',
  templateUrl: './position-hp-calculator-dialog.component.html',
  styleUrls: ['./position-hp-calculator-dialog.component.scss']
})
export class PositionHpCalculatorDialogComponent implements OnInit, IPositionHpCalculatorDialogComponent {
	// Inherited data
	private side!: IBinancePositionSide;
	private health!: IPositionSideHealth;

	// Prediction & Market State Data
	private pred!: IPrediction;
	private predState!: IPredictionState;
	private predStateIntensity!: IPredictionStateIntesity;
	private ms!: IMarketState;

	// Weights
	private weights!: IPositionHealthWeights;

	// HP Results
	public hp: number = 0;
	public results: IHPResult[] = [];
	
	// Load state
	public loaded: boolean = false;

	constructor(
		private dialogRef: MatDialogRef<PositionHpCalculatorDialogComponent>,
		@Inject(MAT_DIALOG_DATA) private data: IPositionHpCalculatorDialogData,
		public _nav: NavService,
		public _app: AppService,
		private _position: PositionService,
		private _utils: UtilsService
	) { }

	async ngOnInit(): Promise<void> {
		// Init inherited data
		this.side = this.data.side;
		this.health = this.data.health;

		try {
			// Load the weights
			this.weights = await this._position.getPositionHealthWeights();

			// Populate the required data
			this.pred = this._app.prediction.value!;
			this.predState = this._app.predictionState.value!;
			this.predStateIntensity = this._app.predictionStateIntensity.value!;
			this.ms = this._app.marketState.value!;

			// Finally, calculate the HP
			this.calculateHP();
		} catch (e) { this._app.error(e) }
		this.loaded = true;
	}








	/* Calculator */




	/**
	 * Calculates each HP component and totalizes the points.
	 */
	private calculateHP(): void {
		// Evaluate the trend sum
		this.results.push(this.evaluateTrendSum());

		// Evaluate the trend state
		this.results.push(this.evaluateTrendState());

		// Evalute technicals
		this.results.push(this.evaluateTechnicalAnalysis("15m"));
		this.results.push(this.evaluateTechnicalAnalysis("30m"));
		this.results.push(this.evaluateTechnicalAnalysis("1h"));
		this.results.push(this.evaluateTechnicalAnalysis("2h"));
		this.results.push(this.evaluateTechnicalAnalysis("4h"));
		this.results.push(this.evaluateTechnicalAnalysis("1d"));

		// Evaluate the open interest
		this.results.push(this.evaluateOpenInterest());
		this.results.push(this.evaluateOpenInterestState());

		// Evalute the long/short ratio
		this.results.push(this.evaluateLongShortRatio());
		this.results.push(this.evaluateLongShortRatioState());

		// Evaluate the volume
		this.results.push(this.evaluateVolumeDirection());

		// Finally, calculate the total HP
		this.hp = this.results.reduce((partialSum, b) => partialSum + b.points, 0);
	}






    /**
     * Calculates the prediction HP based on the initial and the current
     * sum.
     * @param side 
     * @param openSum 
     * @returns IHPResult
     */
    private evaluateTrendSum(): IHPResult {
        // Init the score
        let score: number = 0.5;

        // Calculate the absolute difference
        const absDiff: number = this.calculateAbsoluteTrendSumDifference(this.health.os, this.pred.s);

        // Evaluate a trend sum that is increasing
        if (this.pred.s > this.health.os) {
            if        (absDiff >= 1.05)   { score = this.side == "LONG" ? 1: 0 } 
            else if   (absDiff >= 1.01)   { score = this.side == "LONG" ? 0.99: 0.01 }
            else if   (absDiff >= 0.99)   { score = this.side == "LONG" ? 0.98: 0.02 }
            else if   (absDiff >= 0.96)   { score = this.side == "LONG" ? 0.97: 0.03 }
            else if   (absDiff >= 0.93)   { score = this.side == "LONG" ? 0.96: 0.04 }
            else if   (absDiff >= 0.90)   { score = this.side == "LONG" ? 0.95: 0.05 }
            else if   (absDiff >= 0.87)   { score = this.side == "LONG" ? 0.94: 0.06 }
            else if   (absDiff >= 0.84)   { score = this.side == "LONG" ? 0.93: 0.07 }
            else if   (absDiff >= 0.81)   { score = this.side == "LONG" ? 0.92: 0.08 }
            else if   (absDiff >= 0.78)   { score = this.side == "LONG" ? 0.91: 0.09 }
            else if   (absDiff >= 0.75)   { score = this.side == "LONG" ? 0.90: 0.10 }
            else if   (absDiff >= 0.72)   { score = this.side == "LONG" ? 0.89: 0.11 }
            else if   (absDiff >= 0.69)   { score = this.side == "LONG" ? 0.88: 0.12 }
            else if   (absDiff >= 0.66)   { score = this.side == "LONG" ? 0.87: 0.13 }
            else if   (absDiff >= 0.63)   { score = this.side == "LONG" ? 0.86: 0.14 }
            else if   (absDiff >= 0.60)   { score = this.side == "LONG" ? 0.85: 0.15 }
            else if   (absDiff >= 0.57)   { score = this.side == "LONG" ? 0.84: 0.16 }
            else if   (absDiff >= 0.54)   { score = this.side == "LONG" ? 0.83: 0.17 }
            else if   (absDiff >= 0.51)   { score = this.side == "LONG" ? 0.82: 0.18 }
            else if   (absDiff >= 0.48)   { score = this.side == "LONG" ? 0.81: 0.19 }
            else if   (absDiff >= 0.45)   { score = this.side == "LONG" ? 0.80: 0.20 }
            else if   (absDiff >= 0.42)   { score = this.side == "LONG" ? 0.79: 0.21 }
            else if   (absDiff >= 0.39)   { score = this.side == "LONG" ? 0.78: 0.22 }
            else if   (absDiff >= 0.36)   { score = this.side == "LONG" ? 0.77: 0.23 }
            else if   (absDiff >= 0.33)   { score = this.side == "LONG" ? 0.76: 0.24 }
            else if   (absDiff >= 0.30)   { score = this.side == "LONG" ? 0.75: 0.25 }
            else if   (absDiff >= 0.28)   { score = this.side == "LONG" ? 0.74: 0.26 }
            else if   (absDiff >= 0.26)   { score = this.side == "LONG" ? 0.73: 0.27 }
            else if   (absDiff >= 0.24)   { score = this.side == "LONG" ? 0.72: 0.28 }
            else if   (absDiff >= 0.22)   { score = this.side == "LONG" ? 0.71: 0.29 }
            else if   (absDiff >= 0.20)   { score = this.side == "LONG" ? 0.70: 0.30 }
            else if   (absDiff >= 0.19)   { score = this.side == "LONG" ? 0.69: 0.31 }
            else if   (absDiff >= 0.18)   { score = this.side == "LONG" ? 0.68: 0.32 }
            else if   (absDiff >= 0.17)   { score = this.side == "LONG" ? 0.67: 0.33 }
            else if   (absDiff >= 0.16)   { score = this.side == "LONG" ? 0.66: 0.34 }
            else if   (absDiff >= 0.15)   { score = this.side == "LONG" ? 0.65: 0.35 }
            else if   (absDiff >= 0.14)   { score = this.side == "LONG" ? 0.64: 0.36 }
            else if   (absDiff >= 0.13)   { score = this.side == "LONG" ? 0.63: 0.37 }
            else if   (absDiff >= 0.12)   { score = this.side == "LONG" ? 0.62: 0.38 }
            else if   (absDiff >= 0.11)   { score = this.side == "LONG" ? 0.61: 0.39 }
            else if   (absDiff >= 0.10)   { score = this.side == "LONG" ? 0.60: 0.40 }
            else if   (absDiff >= 0.09)   { score = this.side == "LONG" ? 0.59: 0.41 }
            else if   (absDiff >= 0.08)   { score = this.side == "LONG" ? 0.58: 0.42 }
            else if   (absDiff >= 0.07)   { score = this.side == "LONG" ? 0.57: 0.43 }
            else if   (absDiff >= 0.06)   { score = this.side == "LONG" ? 0.56: 0.44 }
            else if   (absDiff >= 0.05)   { score = this.side == "LONG" ? 0.55: 0.45 }
            else if   (absDiff >= 0.04)   { score = this.side == "LONG" ? 0.54: 0.46 }
            else if   (absDiff >= 0.03)   { score = this.side == "LONG" ? 0.53: 0.47 }
            else if   (absDiff >= 0.02)   { score = this.side == "LONG" ? 0.52: 0.48 }
            else if   (absDiff >= 0.01)   { score = this.side == "LONG" ? 0.51: 0.49 }
        }

        // Evaluate a trend sum that is decreasing
        else if (this.pred.s < this.health.os) {
            if        (absDiff >= 1.05)   { score = this.side == "SHORT" ? 1: 0 } 
            else if   (absDiff >= 1.01)   { score = this.side == "SHORT" ? 0.99: 0.01 }
            else if   (absDiff >= 0.99)   { score = this.side == "SHORT" ? 0.98: 0.02 }
            else if   (absDiff >= 0.96)   { score = this.side == "SHORT" ? 0.97: 0.03 }
            else if   (absDiff >= 0.93)   { score = this.side == "SHORT" ? 0.96: 0.04 }
            else if   (absDiff >= 0.90)   { score = this.side == "SHORT" ? 0.95: 0.05 }
            else if   (absDiff >= 0.87)   { score = this.side == "SHORT" ? 0.94: 0.06 }
            else if   (absDiff >= 0.84)   { score = this.side == "SHORT" ? 0.93: 0.07 }
            else if   (absDiff >= 0.81)   { score = this.side == "SHORT" ? 0.92: 0.08 }
            else if   (absDiff >= 0.78)   { score = this.side == "SHORT" ? 0.91: 0.09 }
            else if   (absDiff >= 0.75)   { score = this.side == "SHORT" ? 0.90: 0.10 }
            else if   (absDiff >= 0.72)   { score = this.side == "SHORT" ? 0.89: 0.11 }
            else if   (absDiff >= 0.69)   { score = this.side == "SHORT" ? 0.88: 0.12 }
            else if   (absDiff >= 0.66)   { score = this.side == "SHORT" ? 0.87: 0.13 }
            else if   (absDiff >= 0.63)   { score = this.side == "SHORT" ? 0.86: 0.14 }
            else if   (absDiff >= 0.60)   { score = this.side == "SHORT" ? 0.85: 0.15 }
            else if   (absDiff >= 0.57)   { score = this.side == "SHORT" ? 0.84: 0.16 }
            else if   (absDiff >= 0.54)   { score = this.side == "SHORT" ? 0.83: 0.17 }
            else if   (absDiff >= 0.51)   { score = this.side == "SHORT" ? 0.82: 0.18 }
            else if   (absDiff >= 0.48)   { score = this.side == "SHORT" ? 0.81: 0.19 }
            else if   (absDiff >= 0.45)   { score = this.side == "SHORT" ? 0.80: 0.20 }
            else if   (absDiff >= 0.42)   { score = this.side == "SHORT" ? 0.79: 0.21 }
            else if   (absDiff >= 0.39)   { score = this.side == "SHORT" ? 0.78: 0.22 }
            else if   (absDiff >= 0.36)   { score = this.side == "SHORT" ? 0.77: 0.23 }
            else if   (absDiff >= 0.33)   { score = this.side == "SHORT" ? 0.76: 0.24 }
            else if   (absDiff >= 0.30)   { score = this.side == "SHORT" ? 0.75: 0.25 }
            else if   (absDiff >= 0.28)   { score = this.side == "SHORT" ? 0.74: 0.26 }
            else if   (absDiff >= 0.26)   { score = this.side == "SHORT" ? 0.73: 0.27 }
            else if   (absDiff >= 0.24)   { score = this.side == "SHORT" ? 0.72: 0.28 }
            else if   (absDiff >= 0.22)   { score = this.side == "SHORT" ? 0.71: 0.29 }
            else if   (absDiff >= 0.20)   { score = this.side == "SHORT" ? 0.70: 0.30 }
            else if   (absDiff >= 0.19)   { score = this.side == "SHORT" ? 0.69: 0.31 }
            else if   (absDiff >= 0.18)   { score = this.side == "SHORT" ? 0.68: 0.32 }
            else if   (absDiff >= 0.17)   { score = this.side == "SHORT" ? 0.67: 0.33 }
            else if   (absDiff >= 0.16)   { score = this.side == "SHORT" ? 0.66: 0.34 }
            else if   (absDiff >= 0.15)   { score = this.side == "SHORT" ? 0.65: 0.35 }
            else if   (absDiff >= 0.14)   { score = this.side == "SHORT" ? 0.64: 0.36 }
            else if   (absDiff >= 0.13)   { score = this.side == "SHORT" ? 0.63: 0.37 }
            else if   (absDiff >= 0.12)   { score = this.side == "SHORT" ? 0.62: 0.38 }
            else if   (absDiff >= 0.11)   { score = this.side == "SHORT" ? 0.61: 0.39 }
            else if   (absDiff >= 0.10)   { score = this.side == "SHORT" ? 0.60: 0.40 }
            else if   (absDiff >= 0.09)   { score = this.side == "SHORT" ? 0.59: 0.41 }
            else if   (absDiff >= 0.08)   { score = this.side == "SHORT" ? 0.58: 0.42 }
            else if   (absDiff >= 0.07)   { score = this.side == "SHORT" ? 0.57: 0.43 }
            else if   (absDiff >= 0.06)   { score = this.side == "SHORT" ? 0.56: 0.44 }
            else if   (absDiff >= 0.05)   { score = this.side == "SHORT" ? 0.55: 0.45 }
            else if   (absDiff >= 0.04)   { score = this.side == "SHORT" ? 0.54: 0.46 }
            else if   (absDiff >= 0.03)   { score = this.side == "SHORT" ? 0.53: 0.47 }
            else if   (absDiff >= 0.02)   { score = this.side == "SHORT" ? 0.52: 0.48 }
            else if   (absDiff >= 0.01)   { score = this.side == "SHORT" ? 0.51: 0.49 }
        }

        // Finally, return the score
        return {
			id: "trend_sum",
			name: "Trend Sum",
			points: this.weights.trend_sum * score,
			maxPoints: this.weights.trend_sum,
			percentage: score*100
		};
    }




	

    /**
     * Calculates the prediction state HP based on the current state and side.
     * @returns IHPResult
     */
    private evaluateTrendState(): IHPResult {
        // Init the score
        let score: number = 0.5;

        // Evaluate an increasing trend state with low intensity
        if (this.predState >= 9 && this.predStateIntensity == 1) {
            score = this.side =="LONG" ? 0.68: 0.32;
        } else if (this.predState == 8 && this.predStateIntensity == 1) {
            score = this.side =="LONG" ? 0.66: 0.34;
        } else if (this.predState == 7 && this.predStateIntensity == 1) {
            score = this.side =="LONG" ? 0.64: 0.36;
        } else if (this.predState == 6 && this.predStateIntensity == 1) {
            score = this.side =="LONG" ? 0.62: 0.38;
        } else if (this.predState == 5 && this.predStateIntensity == 1) {
            score = this.side =="LONG" ? 0.60: 0.40;
        } else if (this.predState == 4 && this.predStateIntensity == 1) {
            score = this.side =="LONG" ? 0.58: 0.42;
        } else if (this.predState == 3 && this.predStateIntensity == 1) {
            score = this.side =="LONG" ? 0.56: 0.44;
        } else if (this.predState == 2 && this.predStateIntensity == 1) {
            score = this.side =="LONG" ? 0.54: 0.46;
        } else if (this.predState == 1 && this.predStateIntensity == 1) {
            score = this.side =="LONG" ? 0.52: 0.48;
        }

        // Evaluate an increasing trend state with high intensity
        else if (this.predState >= 9 && this.predStateIntensity == 2) {
            score = this.side =="LONG" ? 1: 0;
        } else if (this.predState == 8 && this.predStateIntensity == 2) {
            score = this.side =="LONG" ? 0.95: 0.05;
        } else if (this.predState == 7 && this.predStateIntensity == 2) {
            score = this.side =="LONG" ? 0.90: 0.10;
        } else if (this.predState == 6 && this.predStateIntensity == 2) {
            score = this.side =="LONG" ? 0.85: 0.15;
        } else if (this.predState == 5 && this.predStateIntensity == 2) {
            score = this.side =="LONG" ? 0.80: 0.20;
        } else if (this.predState == 4 && this.predStateIntensity == 2) {
            score = this.side =="LONG" ? 0.75: 0.25;
        } else if (this.predState == 3 && this.predStateIntensity == 2) {
            score = this.side =="LONG" ? 0.70: 0.30;
        } else if (this.predState == 2 && this.predStateIntensity == 2) {
            score = this.side =="LONG" ? 0.65: 0.35;
        } else if (this.predState == 1 && this.predStateIntensity == 2) {
            score = this.side =="LONG" ? 0.55: 0.45;
        }

        // Evaluate a decreasing trend state with low intensity
        else if (this.predState == -1 && this.predStateIntensity == -1) {
            score = this.side =="SHORT" ? 0.52: 0.48;
        } else if (this.predState == -2 && this.predStateIntensity == -1) {
            score = this.side =="SHORT" ? 0.54: 0.46;
        } else if (this.predState == -3 && this.predStateIntensity == -1) {
            score = this.side =="SHORT" ? 0.56: 0.44;
        } else if (this.predState == -4 && this.predStateIntensity == -1) {
            score = this.side =="SHORT" ? 0.58: 0.42;
        } else if (this.predState == -5 && this.predStateIntensity == -1) {
            score = this.side =="SHORT" ? 0.60: 0.40;
        } else if (this.predState == -6 && this.predStateIntensity == -1) {
            score = this.side =="SHORT" ? 0.62: 0.38;
        } else if (this.predState == -7 && this.predStateIntensity == -1) {
            score = this.side =="SHORT" ? 0.64: 0.36;
        } else if (this.predState == -8 && this.predStateIntensity == -1) {
            score = this.side =="SHORT" ? 0.66: 0.34;
        } else if (this.predState <= -9 && this.predStateIntensity == -1) {
            score = this.side =="SHORT" ? 0.68: 0.32;
        }

        // Evaluate a decreasing trend state with high intensity
        else if (this.predState == -1 && this.predStateIntensity == -2) {
            score = this.side =="SHORT" ? 0.55: 0.45;
        } else if (this.predState == -2 && this.predStateIntensity == -2) {
            score = this.side =="SHORT" ? 0.65: 0.35;
        } else if (this.predState == -3 && this.predStateIntensity == -2) {
            score = this.side =="SHORT" ? 0.70: 0.30;
        } else if (this.predState == -4 && this.predStateIntensity == -2) {
            score = this.side =="SHORT" ? 0.75: 0.25;
        } else if (this.predState == -5 && this.predStateIntensity == -2) {
            score = this.side =="SHORT" ? 0.80: 0.20;
        } else if (this.predState == -6 && this.predStateIntensity == -2) {
            score = this.side =="SHORT" ? 0.85: 0.15;
        } else if (this.predState == -7 && this.predStateIntensity == -2) {
            score = this.side =="SHORT" ? 0.90: 0.10;
        } else if (this.predState == -8 && this.predStateIntensity == -2) {
            score = this.side =="SHORT" ? 0.95: 0.05;
        } else if (this.predState <= -9 && this.predStateIntensity == -2) {
            score = this.side =="SHORT" ? 1: 0;
        }

		// Finally, return the score
		return {
			id: "trend_state",
			name: "Trend State",
			points: this.weights.trend_state * score,
			maxPoints: this.weights.trend_state,
			percentage: score*100
		};
    }






    /**
     * Calculates the technical analysis HP based on the current state.
     * @returns IHPResult
     */
    private evaluateTechnicalAnalysis(taInterval: ITAIntervalID): IHPResult {
        // Init the score
        let score: number = 0.5;

        // Evaluate the current state score based on the side
        if      (this.ms.technical_analysis[taInterval].s.a == -2) { score = this.side == "SHORT" ? 1: 0 } 
        else if (this.ms.technical_analysis[taInterval].s.a == -1) { score = this.side == "SHORT" ? 0.75: 0.25 } 
        else if (this.ms.technical_analysis[taInterval].s.a == 1)  { score = this.side == "LONG"  ? 0.75: 0.25 } 
        else if (this.ms.technical_analysis[taInterval].s.a == 2)  { score = this.side == "LONG"  ? 1: 0 }

        // Finally, return the score
		return {
			id: `ta_${taInterval}`,
			name: `Technicals ${taInterval}`,
			points: this.weights[`ta_${taInterval}`] * score,
			maxPoints: this.weights[`ta_${taInterval}`],
			percentage: score*100
		};
    }





    /**
     * Calculates the open interest HP based on the difference between
     * the initial value and the current one.
     * @returns IHPResult
     */
    private evaluateOpenInterest(): IHPResult {
        // Init the score
        let score: number = 0.5;

        // Initialize the current open interest value
        const current: number = this.ms.open_interest.interest[this.ms.open_interest.interest.length - 1];

        // Evaluate an open interest that is increasing
        if (current > this.health.ooi) {
            if        (current >= this._utils.alterNumberByPercentage(this.health.ooi, 10)) {
                score = this.side == "LONG" ? 1: 0;
            } else if (current >= this._utils.alterNumberByPercentage(this.health.ooi, 9.5)) {
                score = this.side == "LONG" ? 0.97: 0.03;
            } else if (current >= this._utils.alterNumberByPercentage(this.health.ooi, 9)) {
                score = this.side == "LONG" ? 0.94: 0.06;
            } else if (current >= this._utils.alterNumberByPercentage(this.health.ooi, 8.5)) {
                score = this.side == "LONG" ? 0.91: 0.09;
            } else if (current >= this._utils.alterNumberByPercentage(this.health.ooi, 8)) {
                score = this.side == "LONG" ? 0.88: 0.12;
            } else if (current >= this._utils.alterNumberByPercentage(this.health.ooi, 7.5)) {
                score = this.side == "LONG" ? 0.85: 0.15;
            } else if (current >= this._utils.alterNumberByPercentage(this.health.ooi, 7)) {
                score = this.side == "LONG" ? 0.82: 0.18;
            } else if (current >= this._utils.alterNumberByPercentage(this.health.ooi, 6.5)) {
                score = this.side == "LONG" ? 0.79: 0.21;
            } else if (current >= this._utils.alterNumberByPercentage(this.health.ooi, 6)) {
                score = this.side == "LONG" ? 0.76: 0.24;
            } else if (current >= this._utils.alterNumberByPercentage(this.health.ooi, 5.5)) {
                score = this.side == "LONG" ? 0.73: 0.27;
            } else if (current >= this._utils.alterNumberByPercentage(this.health.ooi, 5)) {
                score = this.side == "LONG" ? 0.70: 0.30;
            } else if (current >= this._utils.alterNumberByPercentage(this.health.ooi, 4.5)) {
                score = this.side == "LONG" ? 0.67: 0.33;
            } else if (current >= this._utils.alterNumberByPercentage(this.health.ooi, 4)) {
                score = this.side == "LONG" ? 0.64: 0.36;
            } else if (current >= this._utils.alterNumberByPercentage(this.health.ooi, 3.5)) {
                score = this.side == "LONG" ? 0.61: 0.39;
            } else if (current >= this._utils.alterNumberByPercentage(this.health.ooi, 3)) {
                score = this.side == "LONG" ? 0.60: 0.40;
            } else if (current >= this._utils.alterNumberByPercentage(this.health.ooi, 2.5)) {
                score = this.side == "LONG" ? 0.58: 0.42;
            } else if (current >= this._utils.alterNumberByPercentage(this.health.ooi, 2)) {
                score = this.side == "LONG" ? 0.56: 0.44;
            } else if (current >= this._utils.alterNumberByPercentage(this.health.ooi, 1.5)) {
                score = this.side == "LONG" ? 0.55: 0.45;
            } else if (current >= this._utils.alterNumberByPercentage(this.health.ooi, 1)) {
                score = this.side == "LONG" ? 0.54: 0.46;
            } else if (current >= this._utils.alterNumberByPercentage(this.health.ooi, 0.5)) {
                score = this.side == "LONG" ? 0.53: 0.47;
            }
        }

        // Evaluate an open interest that is decreasing
        else if (current < this.health.ooi) {
            if        (current <= this._utils.alterNumberByPercentage(this.health.ooi, -10)) {
                score = this.side == "SHORT" ? 1: 0;
            } else if (current <= this._utils.alterNumberByPercentage(this.health.ooi, -9.5)) {
                score = this.side == "SHORT" ? 0.97: 0.03;
            } else if (current <= this._utils.alterNumberByPercentage(this.health.ooi, -9)) {
                score = this.side == "SHORT" ? 0.94: 0.06;
            } else if (current <= this._utils.alterNumberByPercentage(this.health.ooi, -8.5)) {
                score = this.side == "SHORT" ? 0.91: 0.09;
            } else if (current <= this._utils.alterNumberByPercentage(this.health.ooi, -8)) {
                score = this.side == "SHORT" ? 0.88: 0.12;
            } else if (current <= this._utils.alterNumberByPercentage(this.health.ooi, -7.5)) {
                score = this.side == "SHORT" ? 0.85: 0.15;
            } else if (current <= this._utils.alterNumberByPercentage(this.health.ooi, -7)) {
                score = this.side == "SHORT" ? 0.82: 0.18;
            } else if (current <= this._utils.alterNumberByPercentage(this.health.ooi, -6.5)) {
                score = this.side == "SHORT" ? 0.79: 0.21;
            } else if (current <= this._utils.alterNumberByPercentage(this.health.ooi, -6)) {
                score = this.side == "SHORT" ? 0.76: 0.24;
            } else if (current <= this._utils.alterNumberByPercentage(this.health.ooi, -5.5)) {
                score = this.side == "SHORT" ? 0.73: 0.27;
            } else if (current <= this._utils.alterNumberByPercentage(this.health.ooi, -5)) {
                score = this.side == "SHORT" ? 0.70: 0.30;
            } else if (current <= this._utils.alterNumberByPercentage(this.health.ooi, -4.5)) {
                score = this.side == "SHORT" ? 0.67: 0.33;
            } else if (current <= this._utils.alterNumberByPercentage(this.health.ooi, -4)) {
                score = this.side == "SHORT" ? 0.64: 0.36;
            } else if (current <= this._utils.alterNumberByPercentage(this.health.ooi, -3.5)) {
                score = this.side == "SHORT" ? 0.61: 0.39;
            } else if (current <= this._utils.alterNumberByPercentage(this.health.ooi, -3)) {
                score = this.side == "SHORT" ? 0.60: 0.40;
            } else if (current <= this._utils.alterNumberByPercentage(this.health.ooi, -2.5)) {
                score = this.side == "SHORT" ? 0.58: 0.42;
            } else if (current <= this._utils.alterNumberByPercentage(this.health.ooi, -2)) {
                score = this.side == "SHORT" ? 0.56: 0.44;
            } else if (current <= this._utils.alterNumberByPercentage(this.health.ooi, -1.5)) {
                score = this.side == "SHORT" ? 0.55: 0.45;
            } else if (current <= this._utils.alterNumberByPercentage(this.health.ooi, -1)) {
                score = this.side == "SHORT" ? 0.54: 0.46;
            } else if (current <= this._utils.alterNumberByPercentage(this.health.ooi, -0.5)) {
                score = this.side == "SHORT" ? 0.53: 0.47;
            }
        }

        // Finally, return the score
		return {
			id: `open_interest`,
			name: `Open Interest`,
			points: this.weights.open_interest * score,
			maxPoints: this.weights.open_interest,
			percentage: score*100
		};
    }






    /**
     * Calculates the open interest HP based on the current state.
     * @returns IHPResult
     */
    private evaluateOpenInterestState(): IHPResult {
        // Init the score
        let score: number = 0.5;

        // Evaluate the current state score based on the side
        if      (this.ms.open_interest.state == 2)  { score = this.side == "LONG"  ? 1: 0 } 
        else if (this.ms.open_interest.state == 1)  { score = this.side == "LONG"  ? 0.75: 0.25 } 
        else if (this.ms.open_interest.state == -1) { score = this.side == "SHORT" ? 0.75: 0.25 } 
        else if (this.ms.open_interest.state == -2) { score = this.side == "SHORT" ? 1: 0 }

        // Finally, return the score
		return {
			id: `open_interest_state`,
			name: `Open Interest State`,
			points: this.weights.open_interest_state * score,
			maxPoints: this.weights.open_interest_state,
			percentage: score*100
		};
    }







    /**
     * Calculates the long/short ratio HP based on the difference between
     * the initial value and the current one.
     * @returns IHPResult
     */
    private evaluateLongShortRatio(): IHPResult {
        // Init the score
        let score: number = 0.5;

        // Initialize the current long/short ratio value
        const current: number = this.ms.long_short_ratio.ratio[this.ms.long_short_ratio.ratio.length - 1];

        // Evaluate a long/short ratio that is increasing
        if (current > this.health.olsr) {
            if        (current >= this._utils.alterNumberByPercentage(this.health.olsr, 20)) {
                score = this.side == "LONG" ? 1: 0;
            } else if (current >= this._utils.alterNumberByPercentage(this.health.olsr, 19)) {
                score = this.side == "LONG" ? 0.97: 0.03;
            } else if (current >= this._utils.alterNumberByPercentage(this.health.olsr, 18)) {
                score = this.side == "LONG" ? 0.94: 0.06;
            } else if (current >= this._utils.alterNumberByPercentage(this.health.olsr, 17)) {
                score = this.side == "LONG" ? 0.91: 0.09;
            } else if (current >= this._utils.alterNumberByPercentage(this.health.olsr, 16)) {
                score = this.side == "LONG" ? 0.88: 0.12;
            } else if (current >= this._utils.alterNumberByPercentage(this.health.olsr, 15)) {
                score = this.side == "LONG" ? 0.85: 0.15;
            } else if (current >= this._utils.alterNumberByPercentage(this.health.olsr, 14)) {
                score = this.side == "LONG" ? 0.82: 0.18;
            } else if (current >= this._utils.alterNumberByPercentage(this.health.olsr, 13)) {
                score = this.side == "LONG" ? 0.79: 0.21;
            } else if (current >= this._utils.alterNumberByPercentage(this.health.olsr, 12)) {
                score = this.side == "LONG" ? 0.76: 0.24;
            } else if (current >= this._utils.alterNumberByPercentage(this.health.olsr, 11)) {
                score = this.side == "LONG" ? 0.73: 0.27;
            } else if (current >= this._utils.alterNumberByPercentage(this.health.olsr, 10)) {
                score = this.side == "LONG" ? 0.70: 0.30;
            } else if (current >= this._utils.alterNumberByPercentage(this.health.olsr, 9)) {
                score = this.side == "LONG" ? 0.67: 0.33;
            } else if (current >= this._utils.alterNumberByPercentage(this.health.olsr, 8)) {
                score = this.side == "LONG" ? 0.64: 0.36;
            } else if (current >= this._utils.alterNumberByPercentage(this.health.olsr, 7)) {
                score = this.side == "LONG" ? 0.61: 0.39;
            } else if (current >= this._utils.alterNumberByPercentage(this.health.olsr, 6)) {
                score = this.side == "LONG" ? 0.60: 0.40;
            } else if (current >= this._utils.alterNumberByPercentage(this.health.olsr, 5)) {
                score = this.side == "LONG" ? 0.58: 0.42;
            } else if (current >= this._utils.alterNumberByPercentage(this.health.olsr, 4)) {
                score = this.side == "LONG" ? 0.56: 0.44;
            } else if (current >= this._utils.alterNumberByPercentage(this.health.olsr, 3)) {
                score = this.side == "LONG" ? 0.55: 0.45;
            } else if (current >= this._utils.alterNumberByPercentage(this.health.olsr, 2)) {
                score = this.side == "LONG" ? 0.54: 0.46;
            } else if (current >= this._utils.alterNumberByPercentage(this.health.olsr, 1)) {
                score = this.side == "LONG" ? 0.53: 0.47;
            }
        }

        // Evaluate a long/short ratio that is decreasing
        else if (current < this.health.olsr) {
            if        (current <= this._utils.alterNumberByPercentage(this.health.olsr, -20)) {
                score = this.side == "SHORT" ? 1: 0;
            } else if (current <= this._utils.alterNumberByPercentage(this.health.olsr, -19)) {
                score = this.side == "SHORT" ? 0.97: 0.03;
            } else if (current <= this._utils.alterNumberByPercentage(this.health.olsr, -18)) {
                score = this.side == "SHORT" ? 0.94: 0.06;
            } else if (current <= this._utils.alterNumberByPercentage(this.health.olsr, -17)) {
                score = this.side == "SHORT" ? 0.91: 0.09;
            } else if (current <= this._utils.alterNumberByPercentage(this.health.olsr, -16)) {
                score = this.side == "SHORT" ? 0.88: 0.12;
            } else if (current <= this._utils.alterNumberByPercentage(this.health.olsr, -15)) {
                score = this.side == "SHORT" ? 0.85: 0.15;
            } else if (current <= this._utils.alterNumberByPercentage(this.health.olsr, -14)) {
                score = this.side == "SHORT" ? 0.82: 0.18;
            } else if (current <= this._utils.alterNumberByPercentage(this.health.olsr, -13)) {
                score = this.side == "SHORT" ? 0.79: 0.21;
            } else if (current <= this._utils.alterNumberByPercentage(this.health.olsr, -12)) {
                score = this.side == "SHORT" ? 0.76: 0.24;
            } else if (current <= this._utils.alterNumberByPercentage(this.health.olsr, -11)) {
                score = this.side == "SHORT" ? 0.73: 0.27;
            } else if (current <= this._utils.alterNumberByPercentage(this.health.olsr, -10)) {
                score = this.side == "SHORT" ? 0.70: 0.30;
            } else if (current <= this._utils.alterNumberByPercentage(this.health.olsr, -9)) {
                score = this.side == "SHORT" ? 0.67: 0.33;
            } else if (current <= this._utils.alterNumberByPercentage(this.health.olsr, -8)) {
                score = this.side == "SHORT" ? 0.64: 0.36;
            } else if (current <= this._utils.alterNumberByPercentage(this.health.olsr, -7)) {
                score = this.side == "SHORT" ? 0.61: 0.39;
            } else if (current <= this._utils.alterNumberByPercentage(this.health.olsr, -6)) {
                score = this.side == "SHORT" ? 0.60: 0.40;
            } else if (current <= this._utils.alterNumberByPercentage(this.health.olsr, -5)) {
                score = this.side == "SHORT" ? 0.58: 0.42;
            } else if (current <= this._utils.alterNumberByPercentage(this.health.olsr, -4)) {
                score = this.side == "SHORT" ? 0.56: 0.44;
            } else if (current <= this._utils.alterNumberByPercentage(this.health.olsr, -3)) {
                score = this.side == "SHORT" ? 0.55: 0.45;
            } else if (current <= this._utils.alterNumberByPercentage(this.health.olsr, -2)) {
                score = this.side == "SHORT" ? 0.54: 0.46;
            } else if (current <= this._utils.alterNumberByPercentage(this.health.olsr, -1)) {
                score = this.side == "SHORT" ? 0.53: 0.47;
            }
        }

        // Finally, return the score
		return {
			id: `long_short_ratio`,
			name: `Long/Short Ratio`,
			points: this.weights.long_short_ratio * score,
			maxPoints: this.weights.long_short_ratio,
			percentage: score*100
		};
    }






    /**
     * Calculates the long short ratio HP based on the current state.
     * @returns IHPResult
     */
    private evaluateLongShortRatioState(): IHPResult {
        // Init the score
        let score: number = 0.5;

        // Evaluate the current state score based on the side
        if      (this.ms.long_short_ratio.state == 2)  { score = this.side == "LONG"  ? 1: 0 } 
        else if (this.ms.long_short_ratio.state == 1)  { score = this.side == "LONG"  ? 0.75: 0.25 } 
        else if (this.ms.long_short_ratio.state == -1) { score = this.side == "SHORT" ? 0.75: 0.25 } 
        else if (this.ms.long_short_ratio.state == -2) { score = this.side == "SHORT" ? 1: 0 }

        // Finally, return the score
		return {
			id: `long_short_ratio_state`,
			name: `Long/Short Ratio State`,
			points: this.weights.long_short_ratio_state * score,
			maxPoints: this.weights.long_short_ratio_state,
			percentage: score*100
		};
    }







    /**
     * Calculates the volume direction HP based on the current state.
     * @returns IHPResult
     */
    private evaluateVolumeDirection(): IHPResult {
        // Init the score
        let score: number = 0.5;

        // Evaluate the direction based on the current volume state
        if (this.ms.volume.state == 2) {
            if      (this.ms.volume.direction == 2)  { score = this.side == "LONG"  ? 1: 0 } 
            else if (this.ms.volume.direction == 1)  { score = this.side == "LONG"  ? 0.75: 0.25 } 
            else if (this.ms.volume.direction == -1) { score = this.side == "SHORT" ? 0.75: 0.25 } 
            else if (this.ms.volume.direction == -2) { score = this.side == "SHORT" ? 1: 0 }
        } else if (this.ms.volume.state == 1) {
            if      (this.ms.volume.direction == 2)  { score = this.side == "LONG"  ? 0.85: 0.15 } 
            else if (this.ms.volume.direction == 1)  { score = this.side == "LONG"  ? 0.65: 0.35 } 
            else if (this.ms.volume.direction == -1) { score = this.side == "SHORT" ? 0.65: 0.35 } 
            else if (this.ms.volume.direction == -2) { score = this.side == "SHORT" ? 0.85: 0.15 }
        } else {
            if      (this.ms.volume.direction == 2)  { score = this.side == "LONG"  ? 0.75: 0.25 } 
            else if (this.ms.volume.direction == 1)  { score = this.side == "LONG"  ? 0.60: 0.40 } 
            else if (this.ms.volume.direction == -1) { score = this.side == "SHORT" ? 0.60: 0.40 } 
            else if (this.ms.volume.direction == -2) { score = this.side == "SHORT" ? 0.75: 0.25 }
        }

        // Finally, return the score
		return {
			id: `volume_direction`,
			name: `Volume Direction`,
			points: this.weights.volume_direction * score,
			maxPoints: this.weights.volume_direction,
			percentage: score*100
		};
    }











	/* Misc Helpers */




    /**
     * Calculates the absolute trend sum difference based on an initial and a current trend sum.
     * @param initialSum 
     * @param currentSum 
     * @returns number
     */
    public calculateAbsoluteTrendSumDifference(initialSum: number, currentSum: number): number {
        // Handle an increased trend sum
        if (currentSum > initialSum) {
            return Math.abs(currentSum - initialSum);
        }

        // Handle a decreased trend sum
        else if (initialSum > currentSum) {
            return Math.abs(initialSum - currentSum);
        }

        // Otherwise, there is no difference
        else {
            return 0;
        }
    }










	/*
	* Closes the dialog.
	* @returns void
	* */
	public close(): void { this.dialogRef.close() }
}
