import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Routing
import { ForecastRoutingModule } from './forecast-routing.module';

// Shared Module
import {SharedModule} from "../../shared";

// Component
import { ForecastComponent } from './forecast/forecast.component';


@NgModule({
  declarations: [
    ForecastComponent,
  ],
  imports: [
    CommonModule,
    ForecastRoutingModule,
    SharedModule
  ]
})
export class ForecastModule { }
