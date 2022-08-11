import { Component, OnInit } from "@angular/core";
import { IRegressionSelectionComponent } from "./interfaces";

@Component({
  selector: "app-regression-selection",
  templateUrl: "./regression-selection.component.html",
  styleUrls: ["./regression-selection.component.scss"]
})
export class RegressionSelectionComponent implements OnInit, IRegressionSelectionComponent {

	constructor() { }

	ngOnInit(): void {
	}

}
