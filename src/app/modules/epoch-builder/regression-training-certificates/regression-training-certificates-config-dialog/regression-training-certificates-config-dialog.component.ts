import { Component, OnInit } from '@angular/core';
import {MatDialogRef} from "@angular/material/dialog";
import { AppService } from '../../../../services';
import { IRegressionCertificatesOrder } from '../../../../core';
import { IRegressionTrainingCertificatesConfigDialogComponent, IConfigResponse, IOrder } from './interfaces';

@Component({
  selector: 'app-regression-training-certificates-config-dialog',
  templateUrl: './regression-training-certificates-config-dialog.component.html',
  styleUrls: ['./regression-training-certificates-config-dialog.component.scss']
})
export class RegressionTrainingCertificatesConfigDialogComponent implements IRegressionTrainingCertificatesConfigDialogComponent, OnInit {
	public orders: IOrder[] = [
		{
			id: "general_points", 
			name: "General Evaluation", 
			description: "Certificates will be ordered by the points accumulated during the pre and post training general evaluation.",
			icon: "query_stats"
		},
		{
			id: "reg_eval_points", 
			name: "Regr. Evaluation Points", 
			description: "Certificates will be ordered by the point medians received during the Regression Evaluation.",
			icon: "attach_money"
		}
	]
	public order: IRegressionCertificatesOrder|undefined;
	public quantities: number[] = [ 5, 10, 15, 20, 40, 60, 80, 100, 150, 200, 500, 1000 ]

    constructor(
		public dialogRef: MatDialogRef<RegressionTrainingCertificatesConfigDialogComponent>,
		public _app: AppService
	) { }

    ngOnInit(): void {
    }





	/**
	 * Toggles an order ID.
	 * @param orderID 
	 * @returns void
	 */
	public toggleOrder(orderID: IRegressionCertificatesOrder): void {
		this.order = orderID == this.order ? undefined: orderID
	}




	/*
	* Closes the dialog.
	* @returns void
	* */
	public close(limit?: number): void { 
		if (typeof limit == "number") {
			this.dialogRef.close(<IConfigResponse>{ order: this.order, limit: limit})
		} else {
			this.dialogRef.close(undefined) 
		}
	}
}
