import { Component, OnInit } from '@angular/core';
import { IStrategyBuilderDialogComponent } from './interfaces';

@Component({
  selector: 'app-strategy-builder-dialog',
  templateUrl: './strategy-builder-dialog.component.html',
  styleUrls: ['./strategy-builder-dialog.component.scss']
})
export class StrategyBuilderDialogComponent implements OnInit, IStrategyBuilderDialogComponent {

  constructor() { }

  ngOnInit(): void {
  }

}
