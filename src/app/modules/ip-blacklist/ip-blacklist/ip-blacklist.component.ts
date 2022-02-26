import { Component, OnInit } from '@angular/core';
import { IIpBlacklist } from './interfaces';
import { NavService } from '../../../services';

@Component({
  selector: 'app-ip-blacklist',
  templateUrl: './ip-blacklist.component.html',
  styleUrls: ['./ip-blacklist.component.scss']
})
export class IpBlacklistComponent implements OnInit, IIpBlacklist {

    // Load State
    public loaded = false;

    constructor(
        public _nav: NavService
    ) { }

    ngOnInit(): void {
        this.loaded = true;
    }

}
