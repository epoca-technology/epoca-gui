import { Injectable } from '@angular/core';
import { PositionService } from './position.service';
import { UtilsService } from '../utils';
import { IBinancePositionSide, IPositionTrade,  } from './interfaces';
import { 
	IPositionDataService, 
	IPositionDataItem, 
	IItemElement, 
	IPosition
} from './position-data.interfaces';

@Injectable({
  providedIn: 'root'
})
export class PositionDataService implements IPositionDataService {
	// Date Range
	public start: number = 0;
	public end: number = 0;

	// The list of positions ordered by date asc
	public positions: IPosition[] = [];

	// The reversed list of positions (ordered by date desc)
	public rPositions: IPosition[] = [];

	// Bottom Line Values
	public subTotal: number = 0;
	public feesTotal: number = 0;
	public netProfit: number = 0;

	// Position Count by Side
	public longPositions: number = 0;
	public shortPositions: number = 0;

	// Realized PNL
	public pnl: IPositionDataItem = this.getDefaultItemBuild();
	public longPNL: IPositionDataItem = this.getDefaultItemBuild();
	public shortPNL: IPositionDataItem = this.getDefaultItemBuild();

	// Comissions / Fees
	public fees: IPositionDataItem = this.getDefaultItemBuild();
	public longFees: IPositionDataItem = this.getDefaultItemBuild();
	public shortFees: IPositionDataItem = this.getDefaultItemBuild();

	// Position Prices
	public prices: IPositionDataItem = this.getDefaultItemBuild();
	public longPrices: IPositionDataItem = this.getDefaultItemBuild();
	public shortPrices: IPositionDataItem = this.getDefaultItemBuild();

	// Position Amounts in USDT
	public amounts: IPositionDataItem = this.getDefaultItemBuild();
	public longAmounts: IPositionDataItem = this.getDefaultItemBuild();
	public shortAmounts: IPositionDataItem = this.getDefaultItemBuild();

  	constructor(
		private _position: PositionService,
		private _utils: UtilsService
	) { }











	/***************
	 * Initializer *
	 ***************/





	/**
	 * Initializes the Position Data Instance for the full range.
	 * @param startAt 
	 * @param endAt 
	 * @returns Promise<void>
	 */
	public async initialize(startAt: number, endAt: number): Promise<void> {
		// Init the date range
		this.start = startAt;
		this.end = endAt;

		// Download and build the positions
		this.positions = await this.downloadAndBuildPositions(startAt, endAt);
		this.rPositions = this.positions.slice().reverse();

		// Reset the counters
		this.longPositions = 0;
		this.shortPositions = 0;

		// Init the lists that will be built
		let pnl: IItemElement[] = [];
		let longPNL: IItemElement[] = [];
		let shortPNL: IItemElement[] = [];
		let fees: IItemElement[] = [];
		let longFees: IItemElement[] = [];
		let shortFees: IItemElement[] = [];
		let prices: IItemElement[] = [];
		let longPrices: IItemElement[] = [];
		let shortPrices: IItemElement[] = [];
		let amounts: IItemElement[] = [];
		let longAmounts: IItemElement[] = [];
		let shortAmounts: IItemElement[] = [];

		// Iterate over each trade
		for (let position of this.positions) {
			// Add the PNL Item
			pnl.push({ x: position.openTime, y: position.pnl });

			// Add the fee item
			fees.push({ x: position.openTime, y: position.fee });

			// Add the price item
			prices.push({ x: position.openTime, y: position.openPrice });

			// Add the amount item
			amounts.push({ x: position.openTime, y: position.openAmount });

			// Handle a long position
			if (position.side == "LONG") {
				// Increment the position numbers
				this.longPositions += 1;

				// Add the Long PNL Item
				longPNL.push({ x: position.openTime, y: position.pnl });

				// Add the Long Fee Item
				longFees.push({ x: position.openTime, y: position.fee });

				// Add the Long Price Item
				longPrices.push({ x: position.openTime, y: position.openPrice });

				// Add the Long Amount Item
				longAmounts.push({ x: position.openTime, y: position.openAmount });
			} 

			// Otherwise, handle a short position trade
			else {
				// Increment the position numbers
				this.shortPositions += 1;

				// Add the Short PNL Item
				shortPNL.push({ x: position.openTime, y: position.pnl});

				// Add the Short Fee Item
				shortFees.push({ x: position.openTime, y: position.fee });

				// Add the Short Price Item
				shortPrices.push({ x: position.openTime, y: position.openPrice });

				// Add the Short Amount Item
				shortAmounts.push({ x: position.openTime, y: position.openAmount });
			}
		}

		// Build the Data Items
		this.pnl = this.buildItem("PNL", pnl);
		this.longPNL = this.buildItem("Long PNL", longPNL);
		this.shortPNL = this.buildItem("Short PNL", shortPNL);
		this.fees = this.buildItem("Fees", fees);
		this.longFees = this.buildItem("Long Fees", longFees);
		this.shortFees = this.buildItem("Short Fees", shortFees);
		this.prices = this.buildItem("Prices", prices, true);
		this.longPrices = this.buildItem("Long Prices", longPrices, true);
		this.shortPrices = this.buildItem("Short Prices", shortPrices, true);
		this.amounts = this.buildItem("Amounts", amounts);
		this.longAmounts = this.buildItem("Long Amounts", longAmounts);
		this.shortAmounts = this.buildItem("Short Amounts", shortAmounts);

		// Calculate the bottom line
		this.subTotal = <number>this._utils.outputNumber(this.pnl.lastAccum);
		this.feesTotal = <number>this._utils.outputNumber(this.fees.lastAccum);
		this.netProfit = <number>this._utils.outputNumber(this.subTotal - this.feesTotal);
	}







	/**
	 * Downloads the trades and builds the list of positions within the
	 * epoch (date range).
	 * @param startAt 
	 * @param endAt 
	 * @returns Promise<IPosition[]>
	 */
	private async downloadAndBuildPositions(startAt: number, endAt: number): Promise<IPosition[]> {
		// Download the list of trades for the range
		const trades: IPositionTrade[] = await this._position.listTrades(startAt, endAt);

		// Build the positions by side
		const longs: IPosition[] = this.buildPositionsForSide("LONG", trades.filter((t) => t.ps == "LONG"));
		const shorts: IPosition[] = this.buildPositionsForSide("SHORT", trades.filter((t) => t.ps == "SHORT"));
		let positions: IPosition[] = longs.concat(shorts);

		// Sort them by open time ascendingly
		positions.sort((a, b) => (a.openTime > b.openTime) ? 1 : -1);

		// Finally, return the list
		return positions;
	}





	/**
	 * Builds the positions for a side based on a given list of
	 * filtered trades
	 * @param side 
	 * @param trades 
	 * @returns IPosition[]
	 */
	private buildPositionsForSide(side: IBinancePositionSide, trades: IPositionTrade[]): IPosition[] {
		// Init the positions
		let positions: IPosition[] = [];

		// Iterate over each trade building the full positions
		let openTrades: IPositionTrade[] = [];
		let closeTrades: IPositionTrade[] = [];
		for (let i = 0; i < trades.length; i++) {
			// Handle the long side
			if (side == "LONG") {
				/**
				 * If the close trades have been registered and a new open is found, 
				 * close the position and open the new one.
				 */
				if (closeTrades.length && trades[i].s == "BUY") {
					// Build the position and add it to the list
					positions.push(this.buildPosition(side, openTrades, closeTrades));

					// Reset the list and incorporate the new trade into a position
					openTrades = [trades[i]];
					closeTrades = [];
				}

				// Include an open trade
				else if (trades[i].s == "BUY") { openTrades.push(trades[i]) }

				// if the trade sequence has ended and the last trade is a close, process the position.
				else if (i == trades.length - 1 && trades[i].s == "SELL") { 
					// Append the trade to the close
					closeTrades.push(trades[i]);

					// Build and push the position
					positions.push(this.buildPosition(side, openTrades, closeTrades));

					// Reset the lists
					openTrades = [];
					closeTrades = [];
				}

				// Include a close trade
				else { closeTrades.push(trades[i]) }
			}

			// Handle the short side
			else {
				/**
				 * If the close trades have been registered and a new open is found, 
				 * close the position and open the new one.
				 */
				if (closeTrades.length && trades[i].s == "SELL") {
					// Build the position and add it to the list
					positions.push(this.buildPosition(side, openTrades, closeTrades));

					// Reset the list and incorporate the new trade into a position
					openTrades = [trades[i]];
					closeTrades = [];
				}

				// Include an open trade
				else if (trades[i].s == "SELL") { openTrades.push(trades[i]) }

				// if the trade sequence has ended and the last trade is a close, process the position.
				else if (i == trades.length - 1 && trades[i].s == "BUY") { 
					// Append the trade to the close
					closeTrades.push(trades[i]);

					// Build and push the position
					positions.push(this.buildPosition(side, openTrades, closeTrades));

					// Reset the lists
					openTrades = [];
					closeTrades = [];
				}

				// Include a close trade
				else { closeTrades.push(trades[i]) }
			}
		}

		// Finally, return the list
		return positions;
	}





	/**
	 * Once the trade sequence reaches the end, the position is built.
	 * @param side 
	 * @param openTrades 
	 * @param closeTrades 
	 * @returns IPosition
	 */
	private buildPosition(
		side: IBinancePositionSide, 
		openTrades: IPositionTrade[], 
		closeTrades: IPositionTrade[]
	): IPosition {
		// Calculate the open and close prices
		const { openPrice, closePrice } = this.calculateOpenAndClosePrices(openTrades, closeTrades);

		// Init values
		let openAmount: number = 0;
		let closeAmount: number = 0;
		let pnl: number = 0;
		let fee: number = 0;

		// Iterate over each open trade
		for (let trade of openTrades) {
			openAmount += trade.qqty;
			pnl += trade.rpnl;
			fee += trade.c;
		}

		// Iterate over each close trade
		for (let trade of closeTrades) {
			closeAmount += trade.qqty;
			pnl += trade.rpnl;
			fee += trade.c;
		}

		// Finally, return the position
		return {
			side: side,
			openTime: openTrades[0].t,
			closeTime: closeTrades[closeTrades.length - 1].t,
			openPrice: openPrice,
			closePrice: closePrice,
			openAmount: <number>this._utils.outputNumber(openAmount),
			closeAmount: <number>this._utils.outputNumber(closeAmount),
			pnl: <number>this._utils.outputNumber(pnl),
			fee: <number>this._utils.outputNumber(fee),
			openTrades: openTrades,
			closeTrades: closeTrades
		}
	}





	/**
	 * Based on a list of open and close trades, it will calculate the weighted 
	 * open and close prices.
	 * @param openTrades 
	 * @param closeTrades 
	 * @returns {openPrice: number, closePrice: number}
	 */
	private calculateOpenAndClosePrices(
		openTrades: IPositionTrade[], 
		closeTrades: IPositionTrade[]
	): {openPrice: number, closePrice: number} {
		// Calculate the weighted open price
		const open = this._position.calculatePositionPriceRange(
			"LONG",	// Placeholder
			2,		// Placeholder
			openTrades.map((t) => { return { price: t.p, margin: t.qqty}})
		);

		// Calculate the weighted close price
		const close = this._position.calculatePositionPriceRange(
			"LONG",	// Placeholder
			2,		// Placeholder
			closeTrades.map((t) => { return { price: t.p, margin: t.qqty}})
		);

		// Finally, return the prices
		return { openPrice: open.entry, closePrice: close.entry}
	}










	/**
	 * Builds an item based on a list of numbers.
	 * @param name
	 * @param values
	 * @param ignoreAccum?
	 * @returns IPositionDataItem
	 */
	private buildItem(name: string, values: IItemElement[], ignoreAccum?: boolean): IPositionDataItem {
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
				if (!ignoreAccum) {
					accum.push({
						x: v.x,
						y: accum.length ? <number>this._utils.outputNumber(accum[accum.length - 1].y + v.y): v.y
					});
				}
			}

			// Finally, return the build
			return {
				name: name,
				elements: values,
				elementsAccum: accum,
				min: <number>this._utils.getMin(rawValues),
				max: <number>this._utils.getMax(rawValues),
				mean: <number>this._utils.getMean(rawValues),
				last: values[values.length - 1].y,
				lastAccum: ignoreAccum ? 0: accum[accum.length - 1].y
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
			name: "",
			elements: [],
			elementsAccum: [],
			min: 0,
			max: 0,
			mean: 0,
			last: 0,
			lastAccum: 0,
		}
	}

















	/*******************
	 * Position Queries
	 *******************/




	/**
	 * Returns a position record based on a given timestamp.
	 * @param timestamp 
	 * @returns IPosition|undefined
	 */
	public getPositionByTimestamp(timestamp: number): IPosition|undefined {
		return this.positions.filter((p) => p.openTime == timestamp)[0];
	}




	/**
	 * Retrieves a position based on a timestamp range.
	 * @param startAt 
	 * @param endAt 
	 * @returns IPosition|undefined
	 */
	public getPositionByRange(startAt: number, endAt: number): IPosition|undefined {
		return this.positions.filter((p) => p.openTime >= startAt && p.openTime <= endAt)[0];
	}
}
