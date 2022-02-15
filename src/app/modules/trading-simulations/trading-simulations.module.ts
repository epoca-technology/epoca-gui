import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TradingSimulationsRoutingModule } from './trading-simulations-routing.module';
import { TradingSimulationsComponent } from './trading-simulations/trading-simulations.component';


@NgModule({
  declarations: [
    TradingSimulationsComponent
  ],
  imports: [
    CommonModule,
    TradingSimulationsRoutingModule
  ]
})
export class TradingSimulationsModule { }
