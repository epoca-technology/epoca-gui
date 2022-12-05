import { Injectable } from '@angular/core';
import { PositionService } from './position.service';
import { UtilsService } from '../utils';
import { IPositionTrade,  } from './interfaces';
import { IPositionDataService, IPositionDataItem, IItemElement } from './position-data.interfaces';

@Injectable({
  providedIn: 'root'
})
export class PositionDataService implements IPositionDataService {
	// The property holding all the trades ordered by date asc
	public db: IPositionTrade[] = [];

	// The real date range downloaded from the API
	public realStart: number = 0;
	public realEnd: number = 0;

	/* Query Results */

	// The list of trades ordered by date asc
	public query: IPositionTrade[] = [];
	public queryReversed: IPositionTrade[] = [];
	
	// Date Range
	public start: number = 0;
	public end: number = 0;

	// Bottom Line Values
	public subTotal: number = 0;
	public feesTotal: number = 0;
	public netProfit: number = 0;

	// Trades by Side
	public longTrades: number = 0;
	public longIncreaseTrades: number = 0;
	public longCloseTrades: number = 0;
	public shortTrades: number = 0;
	public shortIncreaseTrades: number = 0;
	public shortCloseTrades: number = 0;

	// Realized PNL
	public pnl: IPositionDataItem = this.getDefaultItemBuild();
	public longPNL: IPositionDataItem = this.getDefaultItemBuild();
	public shortPNL: IPositionDataItem = this.getDefaultItemBuild();

	// Comissions / Fees
	public fees: IPositionDataItem = this.getDefaultItemBuild();
	public longFees: IPositionDataItem = this.getDefaultItemBuild();
	public shortFees: IPositionDataItem = this.getDefaultItemBuild();

	// Trade Prices
	public prices: IPositionDataItem = this.getDefaultItemBuild();
	public longPrices: IPositionDataItem = this.getDefaultItemBuild();
	public longIncreasePrices: IPositionDataItem = this.getDefaultItemBuild();
	public longClosePrices: IPositionDataItem = this.getDefaultItemBuild();
	public shortPrices: IPositionDataItem = this.getDefaultItemBuild();
	public shortIncreasePrices: IPositionDataItem = this.getDefaultItemBuild();
	public shortClosePrices: IPositionDataItem = this.getDefaultItemBuild();

	// Trade Amounts in USDT
	public amounts: IPositionDataItem = this.getDefaultItemBuild();
	public longAmounts: IPositionDataItem = this.getDefaultItemBuild();
	public longIncreaseAmounts: IPositionDataItem = this.getDefaultItemBuild();
	public longCloseAmounts: IPositionDataItem = this.getDefaultItemBuild();
	public shortAmounts: IPositionDataItem = this.getDefaultItemBuild();
	public shortIncreaseAmounts: IPositionDataItem = this.getDefaultItemBuild();
	public shortCloseAmounts: IPositionDataItem = this.getDefaultItemBuild();

  	constructor(
		private _position: PositionService,
		private _utils: UtilsService
	) { }




	/* Initializer */



	/**
	 * Initializes the Position Data Instance for the full range.
	 * @param startAt 
	 * @param endAt 
	 * @returns Promise<void>
	 */
	public async initialize(startAt: number, endAt: number): Promise<void> {
		// Load the entire list of trades
		this.db = await this._position.listTrades(startAt, endAt);
		this.realStart = startAt;
		this.realEnd = endAt;
	}




	/**
	 * Resets the instance to a pristine state.
	 */
	public reset(): void {
		this.db = [];
	}








	/* Resizing Management */



	/**
	 * Alters the size of the current subset, does not reload
	 * the trades.
	 * @param startAt 
	 * @param endAt 
	 */
	public setSize(startAt: number, endAt: number): void {
		// Init the current query
		this.query = this.db.filter((trade) => trade.t >= startAt && trade.t <= endAt);
		this.queryReversed = this.query.slice().reverse();

		// Reset the counters
		this.longTrades = 0;
		this.longIncreaseTrades = 0;
		this.longCloseTrades = 0;
		this.shortTrades = 0;
		this.shortIncreaseTrades = 0;
		this.shortCloseTrades = 0;

		// Init the lists that will be built
		let pnl: IItemElement[] = [];
		let longPNL: IItemElement[] = [];
		let shortPNL: IItemElement[] = [];
		let fees: IItemElement[] = [];
		let longFees: IItemElement[] = [];
		let shortFees: IItemElement[] = [];
		let prices: IItemElement[] = [];
		let longPrices: IItemElement[] = [];
		let longIncreasePrices: IItemElement[] = [];
		let longClosePrices: IItemElement[] = [];
		let shortPrices: IItemElement[] = [];
		let shortIncreasePrices: IItemElement[] = [];
		let shortClosePrices: IItemElement[] = [];
		let amounts: IItemElement[] = [];
		let longAmounts: IItemElement[] = [];
		let longIncreaseAmounts: IItemElement[] = [];
		let longCloseAmounts: IItemElement[] = [];
		let shortAmounts: IItemElement[] = [];
		let shortIncreaseAmounts: IItemElement[] = [];
		let shortCloseAmounts: IItemElement[] = [];

		// Iterate over each trade
		for (let trade of this.query) {
			// Add the PNL Item
			if (trade.rpnl != 0) pnl.push({ x: trade.t, y: trade.rpnl });

			// Add the fee item
			fees.push({ x: trade.t, y: trade.c });

			// Add the price item
			prices.push({ x: trade.t, y: trade.p });

			// Add the amount item
			amounts.push({ x: trade.t, y: trade.qqty });

			// Handle a long position trade
			if (trade.ps == "LONG") {
				// Increment the position numbers
				this.longTrades += 1;

				// Add the Long PNL Item
				if (trade.rpnl != 0) longPNL.push({ x: trade.t, y: trade.rpnl });

				// Add the Long Fee Item
				longFees.push({ x: trade.t, y: trade.c });

				// Add the Long Price Item
				longPrices.push({ x: trade.t, y: trade.p });

				// Add the Long Amount Item
				longAmounts.push({ x: trade.t, y: trade.qqty });

				// The long position was increased
				if (trade.s == "BUY") {
					// Increase the counter
					this.longIncreaseTrades += 1;

					// Add the long increase price item
					longIncreasePrices.push({ x: trade.t, y: trade.p });

					// Add the long increase amount
					longIncreaseAmounts.push({ x: trade.t, y: trade.qqty });
				}

				// The long position was closed
				else {
					// Increase the counter
					this.longCloseTrades += 1;

					// Add the long close price item
					longClosePrices.push({ x: trade.t, y: trade.p });

					// Add the long close amount
					longCloseAmounts.push({ x: trade.t, y: trade.qqty });
				}
			} 

			// Otherwise, handle a short position trade
			else {
				// Increment the position numbers
				this.shortTrades += 1;

				// Add the Short PNL Item
				if (trade.rpnl != 0) shortPNL.push({ x: trade.t, y: trade.rpnl});

				// Add the Short Fee Item
				shortFees.push({ x: trade.t, y: trade.c });

				// Add the Short Price Item
				shortPrices.push({ x: trade.t, y: trade.p });

				// Add the Short Amount Item
				shortAmounts.push({ x: trade.t, y: trade.qqty });

				// The short position was increased
				if (trade.s == "SELL") {
					// Increment counters
					this.shortIncreaseTrades += 1;

					// Add the short increase price item
					shortIncreasePrices.push({ x: trade.t, y: trade.p });

					// Add the short increase amount
					shortIncreaseAmounts.push({ x: trade.t, y: trade.qqty });
				}

				// The short position was closed
				else {
					// Increment counters
					this.shortCloseTrades += 1;

					// Add the short close price item
					shortClosePrices.push({ x: trade.t, y: trade.p });

					// Add the short close amount
					shortCloseAmounts.push({ x: trade.t, y: trade.qqty });
				}
			}
		}

		/* Finally, render the values */

		// Init the date range
		this.start = startAt;
		this.end = endAt;

		// Build the Items
		this.pnl = this.buildItem(pnl);
		this.longPNL = this.buildItem(longPNL);
		this.shortPNL = this.buildItem(shortPNL);
		this.fees = this.buildItem(fees);
		this.longFees = this.buildItem(longFees);
		this.shortFees = this.buildItem(shortFees);
		this.prices = this.buildItem(prices);
		this.longPrices = this.buildItem(longPrices);
		this.longIncreasePrices = this.buildItem(longIncreasePrices);
		this.longClosePrices = this.buildItem(longClosePrices);
		this.shortPrices = this.buildItem(shortPrices);
		this.shortIncreasePrices = this.buildItem(shortIncreasePrices);
		this.shortClosePrices = this.buildItem(shortClosePrices);
		this.amounts = this.buildItem(amounts);
		this.longAmounts = this.buildItem(longAmounts);
		this.longIncreaseAmounts = this.buildItem(longIncreaseAmounts);
		this.longCloseAmounts = this.buildItem(longCloseAmounts);
		this.shortAmounts = this.buildItem(shortAmounts);
		this.shortIncreaseAmounts = this.buildItem(shortIncreaseAmounts);
		this.shortCloseAmounts = this.buildItem(shortCloseAmounts);

		// Calculate the bottom line
		this.subTotal = this.pnl.lastAccum;
		this.feesTotal = this.fees.lastAccum;
		this.netProfit = this.subTotal - this.feesTotal;
	}









	/* Misc Helpers */




	/**
	 * Builds an item based on a list of numbers.
	 * @param values 
	 * @returns IPositionDataItem
	 */
	private buildItem(values: IItemElement[]): IPositionDataItem {
		// Make sure there are items in the list
		if (values.length) {
			// Init values
			let rawValues: number[] = [];
			let accum: IItemElement[] = [];

			// Iterate over each value and build the accumulator
			for (let v of values) {
				// Push the raw value
				rawValues.push(v.y);

				// Add the accumulation to the list
				accum.push({
					x: v.x,
					y: accum.length ? <number>this._utils.outputNumber(accum[accum.length - 1].y + v.y): v.y
				});
			}

			// Finally, return the build
			return {
				elements: values,
				elementsAccum: accum,
				min: <number>this._utils.getMin(rawValues),
				max: <number>this._utils.getMax(rawValues),
				mean: <number>this._utils.getMean(rawValues),
				last: values[values.length - 1].y,
				lastAccum: accum[accum.length - 1].y,
			}
		} 
		
		// Otherwise, return the default build
		else { return this.getDefaultItemBuild() }
	}





	/**
	 * Builds the default item object.
	 * @returns IPositionDataItem
	 */
	private getDefaultItemBuild(): IPositionDataItem {
		return {
			elements: [],
			elementsAccum: [],
			min: 0,
			max: 0,
			mean: 0,
			last: 0,
			lastAccum: 0,
		}
	}








	/* Trade Queries */




	/**
	 * Returns a trade record based on a given timestamp.
	 * @param timestamp 
	 * @returns IPositionTrade|undefined
	 */
	public getTradeByTimestamp(timestamp: number): IPositionTrade|undefined {
		return this.query.filter((t) => t.t == timestamp)[0];
	}




	/**
	 * Retrieves a trade based on a timestamp range.
	 * @param startAt 
	 * @param endAt 
	 * @returns IPositionTrade|undefined
	 */
	public getTradeByRange(startAt: number, endAt: number): IPositionTrade|undefined {
		return this.query.filter((t) => t.t >= startAt || t.t <= endAt)[0];
	}
}
