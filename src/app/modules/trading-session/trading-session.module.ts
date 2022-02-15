import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TradingSessionRoutingModule } from './trading-session-routing.module';
import { TradingSessionComponent } from './trading-session/trading-session.component';


@NgModule({
  declarations: [
    TradingSessionComponent
  ],
  imports: [
    CommonModule,
    TradingSessionRoutingModule
  ]
})
export class TradingSessionModule { }
