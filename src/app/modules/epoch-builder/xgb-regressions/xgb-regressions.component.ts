import { Component, OnInit } from "@angular/core";
import { IXGBRegressionsComponent } from "./interfaces";

@Component({
  selector: "app-xgb-regressions",
  templateUrl: "./xgb-regressions.component.html",
  styleUrls: ["./xgb-regressions.component.scss"]
})
export class XgbRegressionsComponent implements OnInit, IXGBRegressionsComponent {

  constructor() { }

  ngOnInit(): void {
  }

}
