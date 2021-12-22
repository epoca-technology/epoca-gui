import { Component, OnInit } from '@angular/core';
import { IDashboardComponent } from './interfaces';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, IDashboardComponent {

  constructor() { }

  ngOnInit(): void {
  }

}
