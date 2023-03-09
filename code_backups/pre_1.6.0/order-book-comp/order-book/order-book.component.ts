import { Component, OnInit } from "@angular/core";
import * as moment from "moment";
import { IOrderBook, IOrderBookItem, OrderBookService, UtilsService } from "../../../core";
import { AppService, NavService } from "../../../services";
import { IOrderBookComponent } from "./interfaces";

@Component({
  selector: "app-order-book",
  templateUrl: "./order-book.component.html",
  styleUrls: ["./order-book.component.scss"]
})
export class OrderBookComponent implements OnInit, IOrderBookComponent {
	// The latest state of the book
	public book?: IOrderBook;

	// Sync state of the book
	public synced: boolean = false;

	// Load State
	public loaded = false;



	constructor(
		private _utils: UtilsService,
		public _nav: NavService,
		public _app: AppService,
		private _orderBook: OrderBookService
	) { }

	ngOnInit(): void { this.refreshBook() }




	/**
	 * Retrieves the latest known order book state and
	 * process it.
	 * @returns Promise<void>
	 */
	public async refreshBook(): Promise<void> {
		// Set loading state
		this.loaded = false;

		try {
			// Retrieve the current state
			this.book = await this._orderBook.getBook();

			// Check if the book was retrieved
			if (this.book) {
				// Populate the metadata if the book was retrieved
				this.book.bids = this.populateSideMetadata(this.book.bids);
				this.book.asks = this.populateSideMetadata(this.book.asks);

				// Check if the book is synced
				this.synced = this.book.last_update > moment(this._app.serverTime.value).subtract(2, "minutes").valueOf();
			}
		} catch (e) { this._app.error(e) }

		// Set loading state
		this.loaded = true;
	}




	/**
	 * Given a list of order book items, it will calculate the %
	 * each one represents.
	 * @param side 
	 * @returns Array<IOrderBookItem>
	 */
	private populateSideMetadata(side: Array<IOrderBookItem>): Array<IOrderBookItem> {
		// Calculate the total quantity
		const total: number = side.reduce((partialSum, a) => partialSum + a.quantity, 0);

		// Finally, return the items including the percent they represent
		return side.map((item) => {
			return {...item, percent: <number>this._utils.calculatePercentageOutOfTotal(item.quantity, total, {dp: 0})}
		})
	}
}
