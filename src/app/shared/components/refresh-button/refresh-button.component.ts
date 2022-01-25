import { Component, Input, Output, OnDestroy, OnInit, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-refresh-button',
  templateUrl: './refresh-button.component.html',
  styleUrls: ['./refresh-button.component.scss']
})
export class RefreshButtonComponent implements OnInit, OnDestroy {

    // If a number is provided, it will call the refresh function in an interval
    private interval: any;
    @Input() intervalSeconds?: number;

    // Refresh Event Emitter
    @Output() refresh = new EventEmitter<void>();

    constructor() { }


    ngOnInit(): void {
        if (typeof this.intervalSeconds == "number") {
            this.interval = setInterval(() => { this.performRefresh() }, this.intervalSeconds * 1000);
        }
    }



    ngOnDestroy(): void {
        if (this.interval) clearInterval(this.interval)
    }






    /**
     * Performs a refresh of the data in the parent component.
     */
    public performRefresh(): void { this.refresh.emit() }
}
