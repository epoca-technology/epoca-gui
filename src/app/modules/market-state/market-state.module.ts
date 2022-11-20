import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Routing
import { MarketStateRoutingModule } from './market-state-routing.module';

// Shared Module
import {SharedModule} from "../../shared";

// Component
import { MarketStateComponent } from './market-state/market-state.component';
import { KeyzoneStateDialogComponent } from './market-state/keyzone-state-dialog';
import { KeyzoneReversalsDialogComponent } from './market-state/keyzone-state-dialog/keyzone-reversals-dialog';


@NgModule({
  declarations: [
    MarketStateComponent,
    KeyzoneStateDialogComponent,
    KeyzoneReversalsDialogComponent
  ],
  imports: [
    CommonModule,
    MarketStateRoutingModule,
    SharedModule
  ]
})
export class MarketStateModule { }
