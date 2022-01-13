import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Routing
import { PriceChartRoutingModule } from './price-chart-routing.module';

// Shared Module
import {SharedModule} from "../../shared";

// Component
import { PriceChartComponent } from './price-chart/price-chart.component';
import { PriceChartConfigComponent } from './price-chart/price-chart-config/price-chart-config.component';


@NgModule({
  declarations: [
    PriceChartComponent,
    PriceChartConfigComponent,
  ],
  imports: [
    CommonModule,
    PriceChartRoutingModule,
    SharedModule
  ]
})
export class PriceChartModule { }
