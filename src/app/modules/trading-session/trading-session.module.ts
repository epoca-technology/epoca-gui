import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Routing
import { TradingSessionRoutingModule } from './trading-session-routing.module';

// Shared Module
import {SharedModule} from "../../shared";

// Component
import { TradingSessionComponent } from './trading-session/trading-session.component';


@NgModule({
  declarations: [
    TradingSessionComponent
  ],
  imports: [
    CommonModule,
    TradingSessionRoutingModule,
    SharedModule
  ]
})
export class TradingSessionModule { }
