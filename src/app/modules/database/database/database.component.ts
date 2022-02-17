import { Component, OnInit } from '@angular/core';
import { IDatabaseComponent } from './interfaces';
import { NavService } from '../../../services';

@Component({
  selector: 'app-database',
  templateUrl: './database.component.html',
  styleUrls: ['./database.component.scss']
})
export class DatabaseComponent implements OnInit, IDatabaseComponent {

    // Load State
    public loaded = false;

    constructor(
        public _nav: NavService
    ) { }

    ngOnInit(): void {
        this.loaded = true;
    }

}
