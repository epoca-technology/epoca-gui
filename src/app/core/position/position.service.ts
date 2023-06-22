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
	IBinancePositionSide,
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
	 * Simulates a reversal state event and opens/increases
	 * the position for a given side if possible.
	 * @param side
	 * @param otp
	 * @returns Promise<void>
	 */
	public onReversalStateEvent(side: IBinancePositionSide, otp: string): Promise<void> { 
		return this._api.request("post","position/onReversalStateEvent", {side: side}, true, otp);
	}




	/**
	 * Closes an active position for the given side.
	 * @param side
	 * @param otp
	 * @returns Promise<void>
	 */
	public closePosition(side: IBinancePositionSide, otp: string): Promise<void> { 
		return this._api.request("post","position/closePosition", {side: side}, true, otp);
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
}
