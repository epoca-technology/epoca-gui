import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Routing
import { PositionsRoutingModule } from './positions-routing.module';

// Shared Module
import {SharedModule} from "../../shared";

// Component
import { PositionsComponent } from './positions/positions.component';
import { PositionTradeDialogComponent } from './positions/position-trade-dialog';
import { PositionDataItemDialogComponent } from './positions/position-data-item-dialog/position-data-item-dialog.component';


@NgModule({
  declarations: [
    PositionsComponent,
    PositionTradeDialogComponent,
    PositionDataItemDialogComponent
  ],
  imports: [
    CommonModule,
    PositionsRoutingModule,
    SharedModule
  ]
})
export class PositionsModule { }
