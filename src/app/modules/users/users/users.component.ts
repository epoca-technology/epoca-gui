import { Component, OnInit } from '@angular/core';
import { IUsersComponent } from './interfaces';
import { NavService } from '../../../services';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit, IUsersComponent {

    // Load State
    public loaded = false;

    constructor(
        public _nav: NavService
    ) { }

    ngOnInit(): void {
        this.loaded = true;
    }

}
