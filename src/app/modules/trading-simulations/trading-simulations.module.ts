import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Routing
import { TradingSimulationsRoutingModule } from './trading-simulations-routing.module';

// Shared Module
import {SharedModule} from "../../shared";

// Component
import { TradingSimulationsComponent } from './trading-simulations/trading-simulations.component';


@NgModule({
  declarations: [
    TradingSimulationsComponent
  ],
  imports: [
    CommonModule,
    TradingSimulationsRoutingModule,
    SharedModule
  ]
})
export class TradingSimulationsModule { }
