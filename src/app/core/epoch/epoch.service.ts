import { Injectable } from "@angular/core";
import { ApiService } from "../api";
import { IBackgroundTaskInfo } from "../background-task";
import { IPredictionModelCertificate, IRegressionTrainingCertificate } from "../epoch-builder";
import { IEpochListItem, IEpochRecord, IEpochService } from "./interfaces";

@Injectable({
  providedIn: "root"
})
export class EpochService implements IEpochService {

	constructor(
		private _api: ApiService
	) { }




	/* Epoch Retriever Endpoints */




	/**
	 * Retrieves an Epoch Record. In case it doesn"t exist, it returns undefined.
	 * @param epochID
	 * @returns Promise<IEpochRecord|undefined>
	 */
	public getEpochRecord(epochID: string): Promise<IEpochRecord|undefined> {
		return this._api.request(
			"get","epoch/getEpochRecord", 
			{
				epochID: epochID
			}, 
			true
		);
	}






	/**
	 * Retrieves the list of epochs based on a given starting point and limit.
	 * @param startAt
	 * @param limit
	 * @returns Promise<IEpochListItem[]>
	 */
	public listEpochs(startAt: number, limit: number): Promise<IEpochListItem[]> {
		return this._api.request(
			"get","epoch/listEpochs", 
			{
				startAt: startAt,
				limit: limit
			}, 
			true
		);
	}








	

	/* Epoch Install Endpoints */



	

	/**
	 * Initializes the Epoch's Installation Background Task
	 * @param epochID
	 * @param otp
	 * @returns Promise<void>
	 */
	public install(epochID: string, otp: string): Promise<IBackgroundTaskInfo> {
		return this._api.request("post","epoch/install", {epochID: epochID}, true, otp);
	}





	/**
	 * Retrieves the Epoch's Installation Background Task
	 * @returns Promise<IBackgroundTaskInfo>
	 */
	public getInstallTask(): Promise<IBackgroundTaskInfo> {
		return this._api.request("get","epoch/getInstallTask", {}, true);
	}




	

	/**
	 * Initializes the Epoch's Uninstallation Background Task
	 * @param otp
	 * @returns Promise<void>
	 */
	public uninstall(otp: string): Promise<IBackgroundTaskInfo> {
		return this._api.request("post","epoch/uninstall", {}, true, otp);
	}





	/**
	 * Retrieves the Epoch's Uninstallation Background Task
	 * @returns Promise<IBackgroundTaskInfo>
	 */
	public getUninstallTask(): Promise<IBackgroundTaskInfo> {
		return this._api.request("get","epoch/getUninstallTask", {}, true);
	}








	/* Certificate Retriever Endpoints */




	

	/**
	 * Retrieves a Prediction Model Certificate based on its ID.
	 * @param id
	 * @returns Promise<IPredictionModelCertificate>
	 */
	public getPredictionModelCertificate(id: string): Promise<IPredictionModelCertificate> {
		return this._api.request("get","epoch/getPredictionModelCertificate", {id: id}, true);
	}






	/**
	 * Retrieves a Regression Certificate based on its ID.
	 * @param id
	 * @returns Promise<IRegressionTrainingCertificate>
	 */
	 public getRegressionCertificate(id: string): Promise<IRegressionTrainingCertificate> {
		return this._api.request("get","epoch/getRegressionCertificate", {id: id}, true);
	}
}
