import { Component, Inject, OnInit } from "@angular/core";
import {MatDialogRef, MAT_DIALOG_DATA} from "@angular/material/dialog";
import { BigNumber } from "bignumber.js";
import { 
	IPrediction, 
	IPredictionModelConfig, 
	PredictionService, 
	UtilsService 
} from "../../../../../core";
import { NavService } from "../../../../../services";
import { IPredictionDialogComponent, IPredictionDialogData } from "./interfaces";

@Component({
  selector: "app-prediction-dialog",
  templateUrl: "./prediction-dialog.component.html",
  styleUrls: ["./prediction-dialog.component.scss"]
})
export class PredictionDialogComponent implements OnInit, IPredictionDialogComponent {
	// Init main data
	public model: IPredictionModelConfig;
	public prediction: IPrediction;
	public featuresSum: number;

	// Prediction Result Name
	public resultName: string;


	// Load State
	public loaded: boolean = false;


    constructor(
		public dialogRef: MatDialogRef<PredictionDialogComponent>,
		@Inject(MAT_DIALOG_DATA) private data: IPredictionDialogData,
		private _utils: UtilsService,
		public _nav: NavService,
		private _prediction: PredictionService,
	) { 
		// Main Data
		this.model = this.data.model;
		this.prediction = this.data.prediction;
		this.featuresSum = <number>this._utils.outputNumber(BigNumber.sum.apply(null, this.prediction.f), { dp: 6 });

		// Prediction Result Details
		this.resultName = this._prediction.resultNames[this.prediction.r];
	}



    async ngOnInit(): Promise<void> {
		this.loaded = true;
    }












	/* Misc Helpers */




	/*
	* Closes the dialog.
	* @returns void
	* */
	public close(): void { this.dialogRef.close() }
}
