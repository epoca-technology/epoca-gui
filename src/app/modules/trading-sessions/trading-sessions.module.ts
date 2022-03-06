import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Routing
import { TradingSessionsRoutingModule } from './trading-sessions-routing.module';

// Shared Module
import {SharedModule} from "../../shared";

// Component
import { TradingSessionsComponent } from './trading-sessions/trading-sessions.component';


@NgModule({
  declarations: [
    TradingSessionsComponent
  ],
  imports: [
    CommonModule,
    TradingSessionsRoutingModule,
    SharedModule
  ]
})
export class TradingSessionsModule { }
