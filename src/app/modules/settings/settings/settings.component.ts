import { Component, OnInit } from '@angular/core';
import { ISettingsComponent } from './interfaces';
import { NavService } from '../../../services';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit, ISettingsComponent {

    // Load State
    public loaded = false;

    constructor(
        public _nav: NavService
    ) { }

    ngOnInit(): void {
        this.loaded = true;
    }

}
