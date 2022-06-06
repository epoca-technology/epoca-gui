import { Component, OnInit } from '@angular/core';
import {MatDialogRef} from "@angular/material/dialog";
import { AppService } from '../../../../services';
import { IClassificationCertificatesOrder } from '../../../../core';
import { IClassificationTrainingCertificatesConfigDialogComponent, IConfigResponse, IOrder } from './interfaces';


@Component({
  selector: 'app-classification-training-certificates-config-dialog',
  templateUrl: './classification-training-certificates-config-dialog.component.html',
  styleUrls: ['./classification-training-certificates-config-dialog.component.scss']
})
export class ClassificationTrainingCertificatesConfigDialogComponent implements IClassificationTrainingCertificatesConfigDialogComponent, OnInit {
	public orders: IOrder[] = [
		{
			id: "general_points", 
			name: "General Evaluation", 
			description: "Certificates will be ordered by the points accumulated during the pre and post training general evaluation.",
			icon: "query_stats"
		},
		{
			id: "acc", 
			name: "Classification Evaluation", 
			description: "Certificates will be ordered by the general accuracy achieved during the Classification Evaluation.",
			icon: "rule"
		},
		{
			id: "test_ds_acc", 
			name: "Test Dataset Evaluation", 
			description: "Certificates will be ordered by the accuracy achieved during the evaluation with the Test Dataset.",
			icon: "playlist_add_check"
		}
	]
	public order: IClassificationCertificatesOrder|undefined;
	public quantities: number[] = [ 5, 10, 15, 20, 40, 60, 80, 100, 150, 200, 500, 1000 ]

    constructor(
		public dialogRef: MatDialogRef<ClassificationTrainingCertificatesConfigDialogComponent>,
		public _app: AppService
	) { }

    ngOnInit(): void {
    }





	/**
	 * Toggles an order ID.
	 * @param orderID 
	 * @returns void
	 */
	public toggleOrder(orderID: IClassificationCertificatesOrder): void {
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
