import { Component, OnInit } from "@angular/core";
import { NavService } from "../../../services";
import { IOrderBookComponent } from "./interfaces";

@Component({
  selector: "app-order-book",
  templateUrl: "./order-book.component.html",
  styleUrls: ["./order-book.component.scss"]
})
export class OrderBookComponent implements OnInit, IOrderBookComponent {



	// Load State
	public loaded = false;



	constructor(
		public _nav: NavService
	) { }

	ngOnInit(): void {
		this.loaded = true;
	}

}
