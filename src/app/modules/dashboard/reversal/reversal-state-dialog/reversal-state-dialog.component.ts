import { Component, OnInit } from '@angular/core';
import { IReversalStateDialogComponent } from './interfaces';

@Component({
  selector: 'app-reversal-state-dialog',
  templateUrl: './reversal-state-dialog.component.html',
  styleUrls: ['./reversal-state-dialog.component.scss']
})
export class ReversalStateDialogComponent implements OnInit, IReversalStateDialogComponent {

  constructor() { }

  ngOnInit(): void {
  }

}
