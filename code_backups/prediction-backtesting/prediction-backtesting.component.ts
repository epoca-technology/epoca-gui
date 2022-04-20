import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { AppService, ChartService, ILayout, NavService } from '../../../services';
import { IPredictionBacktestingComponent } from './interfaces';

@Component({
  selector: 'app-prediction-backtesting',
  templateUrl: './prediction-backtesting.component.html',
  styleUrls: ['./prediction-backtesting.component.scss']
})
export class PredictionBacktestingComponent implements OnInit, OnDestroy, IPredictionBacktestingComponent {
	// Layout
	public layout: ILayout = this._app.layout.value;
	private layoutSub?: Subscription;
  
	// Loading State
	public loaded: boolean = false;

	// Submission State
	public submitting: boolean = false;


	// Charts
	public pointDist = this.getPointDist();
	public points = this.getPointsConfig();
	public accuracy = this.getAccuracy();
	public positions = this.getPositions();
	public duration = this.getDurationConfig();
	public prediction = this.getPrediction();

	constructor(
		public _nav: NavService,
		private _app: AppService,
		private _chart: ChartService
	) { }

	ngOnInit(): void {
		// Initialize layout
		this.layoutSub = this._app.layout.subscribe((nl: ILayout) => this.layout = nl);

		// Set the loading state
		this.loaded = true;
	}

	ngOnDestroy(): void {
		if (this.layoutSub) this.layoutSub.unsubscribe();
	}





	/* Points Distribution */


	private getPointDist(): any {
		return {
			series: [{
				name: 'Points',
				data: [254, -28, 121, 50, 16.5, 34.5, -43, 125, -46.5, -75.8]
			}],
			chart: {height: 600, type: 'bar',animations: { enabled: false}, toolbar: {show: false}},
			colors: this._chart.colors.slice(0, 10),
			plotOptions: {bar: {borderRadius: 4, horizontal: true, distributed: true}},
			dataLabels: {enabled: false},
			grid: {show: false},
			xaxis: {
				categories: ['ARIMA101', 'ARIMA102', 'ARIMA103', 'ARIMA104', 'ARIMA105', 'ARIMA106', 'ARIMA107', 'ARIMA108', 'ARIMA109', 'ARIMA110'],
			}
		};
	}






	/* Point Lines */



	private getPointsConfig(): any {
		return {
			series: [
				{name: "ARIMA101",data: this.buildPointsLine(156), color: this._chart.colors[0]},
				{name: "ARIMA102",data: this.buildPointsLine(217), color: this._chart.colors[1]},
				{name: "ARIMA103",data: this.buildPointsLine(155), color: this._chart.colors[2]},
				{name: "ARIMA104",data: this.buildPointsLine(391), color: this._chart.colors[3]},
				{name: "ARIMA105",data: this.buildPointsLine(187), color: this._chart.colors[4]},
				{name: "ARIMA106",data: this.buildPointsLine(121), color: this._chart.colors[5]},
				{name: "ARIMA107",data: this.buildPointsLine(155), color: this._chart.colors[6]},
				{name: "ARIMA108",data: this.buildPointsLine(136), color: this._chart.colors[7]},
				{name: "ARIMA109",data: this.buildPointsLine(110), color: this._chart.colors[8]},
				{name: "ARIMA110",data: this.buildPointsLine(333), color: this._chart.colors[9]},
			],
			chart: {
				height: 600,
				type: "line",
				toolbar: {
					show: false,
					//tools: {selection: false,zoom: false,zoomin: false,zoomout: false,pan: false,reset: false,download: true},
					//export: {png: {filename: "Points"}}
				},
				animations: { enabled: false},
			},
			dataLabels: { enabled: false },
			stroke: {curve: "straight"},
			grid: {row: { opacity: 0.5 }},
			xaxis: {labels: { show: false } }
		};
	}




	private buildPointsLine(qty: number): number[] {
		let points = 0;
		let final: number[] = [points]
		for (let i = 0; i < qty; i++) {
			points = Math.random() > 0.4 ? points+=1: points-=1.2
			final.push(Math.round((points + Number.EPSILON) * 100) / 100)
		}
		return final;
	}






	/* Accuracy */


	private getAccuracy(): any {
		return this._chart.getBarChartOptions(
			[
				{
					name: 'Long Accuracy',
					data: [65, 51, 72, 45, 55, 35.95, 53.65, 68.75, 65.15, 28.9],
					
				},
				{
					name: 'Short Accuracy',
					data: [45.85, 51.65, 75.25, 61.54, 58.89, 39.45, 49.45, 35.45, 61.12, 58.45],
					
				},
				{
					name: 'General Accuracy',
					data: [58.85, 65.75, 79.41, 64.35, 50.12, 48.75, 62.55, 71.15, 54.6, 60.55],
					
				},
			],
			['ARIMA101', 'ARIMA102', 'ARIMA103', 'ARIMA104', 'ARIMA105', 'ARIMA106', 'ARIMA107', 'ARIMA108', 'ARIMA109', 'ARIMA110'],
			undefined,
			600,
			[this._chart.upwardColor, this._chart.downwardColor, '#000000']
		)
	}







	/* Positions count */

	private getPositions(): any {
		return this._chart.getBarChartOptions(
			[
				{
					name: 'Longs',
					data: [101, 35, 45, 81, 66, 218, 165, 55, 144, 28],
					
				},
				{
					name: 'Shorts',
					data: [42, 75, 32, 125, 51, 154, 225, 79, 172, 32],
					
				},
				{
					name: 'Total',
					data: [143, 110, 77, 206, 117, 372, 390, 134, 316, 40],
					
				},
			],
			['ARIMA101', 'ARIMA102', 'ARIMA103', 'ARIMA104', 'ARIMA105', 'ARIMA106', 'ARIMA107', 'ARIMA108', 'ARIMA109', 'ARIMA110'],
			undefined,
			600,
			[this._chart.upwardColor, this._chart.downwardColor, '#000000']
		)
	}












	/* Duration */


	private getDurationConfig(): any {
		return this._chart.getBarChartOptions(
			[{
				name: 'Minutes',
				data: [33, 45, 66, 125, 44, 245, 1050, 655, 501, 451]
			}],
			['ARIMA101', 'ARIMA102', 'ARIMA103', 'ARIMA104', 'ARIMA105', 'ARIMA106', 'ARIMA107', 'ARIMA108', 'ARIMA109', 'ARIMA110'],
			undefined,
			600,
			undefined,
			undefined,
			true
		)
	}







	/* Prediction */


	private getPrediction(): any {
		return {
			series: [
				{
					name: "Prediction",
					data: [100,101.5,101.9,102.1,103.75, 102.85, 103.24, 105.62, 104.11, 104.49, 105.25, 104.99, 105.59, 106.81, 106.45,], 
					color: this._chart.upwardColor,
					
				},
				{
					name: "Real",
					data: [100,101.5,101.9,102.1,103.75], 
					color: '#000000'
				},
			],
			chart: {
				height: 600,
				type: "line",
				toolbar: {
					show: false
				},
				animations: { enabled: false},
			},
			
			dataLabels: { enabled: false },
			stroke: {curve: "straight", dashArray: [8, 0]},
			grid: {row: { opacity: 0.5 }},
			xaxis: {labels: { show: false } }
		};
	}
}
