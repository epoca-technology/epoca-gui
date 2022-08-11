import { Component, OnInit } from "@angular/core";
import { IKerasRegressionsComponent } from "./interfaces";

@Component({
  selector: "app-keras-regressions",
  templateUrl: "./keras-regressions.component.html",
  styleUrls: ["./keras-regressions.component.scss"]
})
export class KerasRegressionsComponent implements OnInit, IKerasRegressionsComponent {

  constructor() { }

  ngOnInit(): void {
  }

}
