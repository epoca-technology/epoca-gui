import { Component, OnInit } from "@angular/core";
import { IKerasClassificationsComponent } from "./interfaces";

@Component({
  selector: "app-keras-classifications",
  templateUrl: "./keras-classifications.component.html",
  styleUrls: ["./keras-classifications.component.scss"]
})
export class KerasClassificationsComponent implements OnInit, IKerasClassificationsComponent {

	constructor() { }

	ngOnInit(): void {
	}

}
