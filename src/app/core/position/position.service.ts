import { Injectable } from '@angular/core';
import { BigNumber } from "bignumber.js";
import { ApiService } from "../api";
import { UtilsService } from '../utils';
import { 
	IPositionService, 
	IPositionStrategy, 
	IPositionRecord,
	IPositionHeadline,
	IPositionActionKind,
	IPositionActionRecord,
	IEstimatedPositionFees
} from './interfaces';

@Injectable({
providedIn: 'root'
})
export class PositionService implements IPositionService {






	constructor(
		private _api: ApiService,
		private _utils: UtilsService
	) { }










	/***********************
	 * Position Retrievers *
	 ***********************/




	/**
	 * Retrieves a position record by ID.
	 * @param id
	 * @returns Promise<IPositionRecord>
	 */
	public getPositionRecord(id: string): Promise<IPositionRecord> {
		return this._api.request("get","position/getPositionRecord", {id: id}, true);
	}








	/**
	 * Retrieves a list of headlines based on given date range.
	 * @param startAt
	 * @param endAt
	 * @returns Promise<IPositionHeadline[]>
	 */
	public listPositionHeadlines(startAt: number, endAt: number): Promise<IPositionHeadline[]> {
		return this._api.request("get","position/listPositionHeadlines", {startAt: startAt, endAt: endAt}, true);
	}






	/**
	 * Retrieves a list of position action payloads based on given kind & date range.
	 * @param kind
	 * @param startAt
	 * @param endAt
	 * @returns Promise<IPositionActionRecord[]>
	 */
	public listPositionActionPayloads(kind: IPositionActionKind, startAt: number, endAt: number): Promise<IPositionActionRecord[]> {
		return this._api.request("get","position/listPositionActionPayloads", {kind: kind, startAt: startAt, endAt: endAt}, true);
	}











	/********************
	 * Position Actions *
	 ********************/




	/**
	 * Closes an active position for the given symbol.
	 * @param symbol
	 * @param otp
	 * @returns Promise<void>
	 */
	public closePosition(symbol: string, otp: string): Promise<void> { 
		return this._api.request("post","position/closePosition", {symbol: symbol}, true, otp);
	}


















	/*********************
	 * Position Strategy *
	 *********************/





	/**
	 * Retrieves the current position strategy.
	 * @returns Promise<IPositionStrategy>
	 */
	public getStrategy(): Promise<IPositionStrategy> {
		return this._api.request("get","position/getStrategy", {}, true);
	}




	/**
	 * Updates the trading strategy.
	 * @param newStrategy
	 * @param otp
	 * @returns Promise<void>
	 */
	public updateStrategy(newStrategy: IPositionStrategy, otp: string): Promise<void> { 
		return this._api.request("post","position/updateStrategy", {newStrategy: newStrategy}, true, otp);
	}














	/***************************
	 * Position Fee Calculator *
	 ***************************/




	/**
	 * Calculates the estimated open and close fees.
	 * @param positionAmount 
	 * @param entryPrice 
	 * @param closePrice 
	 * @returns IEstimatedPositionFees
	 */
	public calculateEstimatedFee(positionAmount: number, entryPrice: number, closePrice: number): IEstimatedPositionFees {
		const posAmount: number = Math.abs(positionAmount);
		const entry: BigNumber = new BigNumber(entryPrice);
		const close: BigNumber = new BigNumber(closePrice);
		const entryAmountNotional: BigNumber = entry.times(posAmount);
		const closeAmountNotional: BigNumber = close.times(posAmount);
		const openFee: number = <number>this._utils.outputNumber(entryAmountNotional.times(0.0004), {dp: 4, ru: true});
		const closeFee: number = <number>this._utils.outputNumber(closeAmountNotional.times(0.0004), {dp: 4, ru: true});
		const totalFee: number = <number>this._utils.outputNumber(openFee + closeFee, {dp: 4, ru: true});
		return { open: openFee, close: closeFee, total: totalFee}
	}
}
