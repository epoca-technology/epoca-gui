import { Component, OnInit } from '@angular/core';
import { DatabaseManagementService } from '../../../core';
import { NavService, SnackbarService } from '../../../services';
import { IDatabaseComponent } from './interfaces';

@Component({
  selector: 'app-database',
  templateUrl: './database.component.html',
  styleUrls: ['./database.component.scss']
})
export class DatabaseComponent implements OnInit, IDatabaseComponent {

    // Submission State
    public submitting = false;

    // Load State
    public loaded = false;

    constructor(
        public _nav: NavService,
        private _db: DatabaseManagementService,
        private _snackbar: SnackbarService
    ) { }

    ngOnInit(): void {
        this.loaded = true;
    }









}
