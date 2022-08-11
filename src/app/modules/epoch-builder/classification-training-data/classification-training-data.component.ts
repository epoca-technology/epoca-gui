import { Component, OnInit } from "@angular/core";
import { IClassificationTrainingDataComponent } from "./interfaces";

@Component({
  selector: "app-classification-training-data",
  templateUrl: "./classification-training-data.component.html",
  styleUrls: ["./classification-training-data.component.scss"]
})
export class ClassificationTrainingDataComponent implements OnInit, IClassificationTrainingDataComponent {

	constructor() { }

	ngOnInit(): void {
	}

}
