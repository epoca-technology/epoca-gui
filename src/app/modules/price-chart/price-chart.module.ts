import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Routing
import { PriceChartRoutingModule } from './price-chart-routing.module';

// Shared Module
import {SharedModule} from "../../shared";

// Component
import { PriceChartComponent } from './price-chart/price-chart.component';


@NgModule({
  declarations: [
    PriceChartComponent,
  ],
  imports: [
    CommonModule,
    PriceChartRoutingModule,
    SharedModule
  ]
})
export class PriceChartModule { }
