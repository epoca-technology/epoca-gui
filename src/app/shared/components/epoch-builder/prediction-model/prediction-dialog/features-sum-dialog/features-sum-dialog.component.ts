import { Component, OnInit, Inject } from "@angular/core";
import {MatDialogRef, MAT_DIALOG_DATA} from "@angular/material/dialog";
import { NavService } from "../../../../../../services";
import { 
	IPredictionModelConfig, 
	IPredictionResult, 
	IPredictionResultIcon, 
	PredictionService 
} from "../../../../../../core";
import { IFeaturesSumDialogComponent, IFeaturesSumDialogData } from "./interfaces";

@Component({
  selector: "app-features-sum-dialog",
  templateUrl: "./features-sum-dialog.component.html",
  styleUrls: ["./features-sum-dialog.component.scss"]
})
export class FeaturesSumDialogComponent implements OnInit, IFeaturesSumDialogComponent {
	public sum: number;
	public features: number[];
	public result: IPredictionResult;
	public resultIcon: IPredictionResultIcon;
	public model: IPredictionModelConfig;


	constructor(
		public dialogRef: MatDialogRef<FeaturesSumDialogComponent>,
		@Inject(MAT_DIALOG_DATA) private data: IFeaturesSumDialogData,
		public _nav: NavService,
		private _prediction: PredictionService
	) { 
		this.sum = this.data.sum;
		this.features = this.data.features;
		this.result = this.data.result;
		this.resultIcon = this._prediction.resultIconNames[this.result];
		this.model = this.data.model;
	}

	ngOnInit(): void {
	}






	/*
	* Closes the dialog.
	* @returns void
	* */
	public close(): void { this.dialogRef.close() }
}
