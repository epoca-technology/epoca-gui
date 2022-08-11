import { Component, OnInit } from "@angular/core";
import { IBacktestsComponent } from "./interfaces";

@Component({
  selector: "app-backtests",
  templateUrl: "./backtests.component.html",
  styleUrls: ["./backtests.component.scss"]
})
export class BacktestsComponent implements OnInit, IBacktestsComponent {

	constructor() { }

	ngOnInit(): void {
	}

}
