import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Routing
import { PositionsRoutingModule } from './positions-routing.module';

// Shared Module
import {SharedModule} from "../../shared";

// Component
import { PositionsComponent } from './positions/positions.component';


@NgModule({
  declarations: [
    PositionsComponent
  ],
  imports: [
    CommonModule,
    PositionsRoutingModule,
    SharedModule
  ]
})
export class PositionsModule { }
