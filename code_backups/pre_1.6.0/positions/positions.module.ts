import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Routing
import { PositionsRoutingModule } from './positions-routing.module';

// Shared Module
import {SharedModule} from "../../shared";

// Component
import { PositionsComponent } from './positions/positions.component';
import { PositionDataItemDialogComponent } from './positions/position-data-item-dialog';
import { PositionDialogComponent, PositionTradeDialogComponent, PositionHistoryDialogComponent } from './positions/position-dialog';


@NgModule({
  declarations: [
    PositionsComponent,
    PositionDataItemDialogComponent,
    PositionDialogComponent,
    PositionTradeDialogComponent,
    PositionHistoryDialogComponent,
  ],
  imports: [
    CommonModule,
    PositionsRoutingModule,
    SharedModule
  ]
})
export class PositionsModule { }
