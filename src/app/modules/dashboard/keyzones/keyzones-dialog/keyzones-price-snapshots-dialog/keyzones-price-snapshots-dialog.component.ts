import { Component, OnInit, Inject } from '@angular/core';
import {MatDialogRef, MAT_DIALOG_DATA} from "@angular/material/dialog";
import * as moment from "moment";
import {  ICandlestick } from '../../../../../core';
import {  ChartService, ICandlestickChartOptions } from '../../../../../services';
import { IKeyZonesPriceSnapshotsDialogComponent } from './interfaces';

@Component({
  selector: 'app-keyzones-price-snapshots-dialog',
  templateUrl: './keyzones-price-snapshots-dialog.component.html',
  styleUrls: ['./keyzones-price-snapshots-dialog.component.scss']
})
export class KeyzonesPriceSnapshotsDialogComponent implements OnInit, IKeyZonesPriceSnapshotsDialogComponent {
    public snapshots!: ICandlestickChartOptions;
	constructor(
		public dialogRef: MatDialogRef<KeyzonesPriceSnapshotsDialogComponent>,
		@Inject(MAT_DIALOG_DATA) private snaps: ICandlestick[],
		private _chart: ChartService,
	) { 
		let candlesticks: ICandlestick[] = [];
		const initialOT: number = this.snaps[0].ot;
		let currentOT: number = initialOT;
		for (let snap of snaps) {
			const nextOT: number = moment(currentOT).add(30, "seconds").valueOf();
			candlesticks.push({
				ot: currentOT,
				ct: nextOT - 1,
				o: snap.o,
				h: snap.h,
				l: snap.l,
				c: snap.c,
				v: snap.v,
			});
			currentOT = nextOT;
		}
		this.snapshots = this._chart.getCandlestickChartOptions(
			candlesticks, 
			undefined, 
			false,
			true,
			undefined,
			250
		);
		this.snapshots.chart.zoom = {enabled: false};
		this.snapshots.xaxis.tooltip = { enabled: false }

	}

	ngOnInit(): void {
	}

	
	/*
	* Closes the dialog.
	* @returns void
	* */
	public close(): void { this.dialogRef.close() }

}
