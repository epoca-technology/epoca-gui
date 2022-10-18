import { Component, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import { IBackgroundTaskInfo } from 'src/app/core';
import { IBackgroundTaskComponent } from './interfaces';

@Component({
  selector: 'app-background-task',
  templateUrl: './background-task.component.html',
  styleUrls: ['./background-task.component.scss']
})
export class BackgroundTaskComponent implements OnInit, OnDestroy, IBackgroundTaskComponent {
	// Task
	public t!: IBackgroundTaskInfo;
	@Input() set task(val: IBackgroundTaskInfo) {
		// Init value
		this.t = val;

		// If the task is running and the interval has not been initialized, do so.
		if (this.t && this.t.state == "running" && !this.interval) {
			this.initInterval();
		}

		// If the task has completed or errored, disable the interval
		if (this.t &&  (this.t.state == "completed" || this.t.state == "errored") && this.interval) {
			this.clearInterval();
		}
	}

	// Refresher
    @Output() refresh = new EventEmitter<void>();
	private interval: any;
	private refreshIntervalSeconds: number = 10;

	constructor() { }

	ngOnInit(): void {
	}


	ngOnDestroy(): void {
		this.clearInterval();
	}




	/**
	 * Initializes the interval that will keep the task updated.
	 */
	private initInterval(): void {
		this.interval = setInterval(() => { this.refresh.emit() }, this.refreshIntervalSeconds * 1000);
	}



	/**
	 * Clears the interval in case it is running.
	 */
	private clearInterval(): void { 
		if (this.interval) {
			clearInterval(this.interval);
			this.interval = undefined;
		}
	}




}
