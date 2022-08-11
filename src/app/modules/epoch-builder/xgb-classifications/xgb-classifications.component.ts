import { Component, OnInit } from "@angular/core";
import { IXGBClassificationsComponent } from "./interfaces";

@Component({
  selector: "app-xgb-classifications",
  templateUrl: "./xgb-classifications.component.html",
  styleUrls: ["./xgb-classifications.component.scss"]
})
export class XgbClassificationsComponent implements OnInit, IXGBClassificationsComponent {

	constructor() { }

	ngOnInit(): void {
	}

}
