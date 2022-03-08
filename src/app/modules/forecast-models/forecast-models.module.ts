import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Routing
import { ForecastModelsRoutingModule } from './forecast-models-routing.module';

// Shared Module
import {SharedModule} from "../../shared";

// Component
import { ForecastModelsComponent } from './forecast-models/forecast-models.component';


@NgModule({
  declarations: [
    ForecastModelsComponent
  ],
  imports: [
    CommonModule,
    ForecastModelsRoutingModule,
    SharedModule
  ]
})
export class ForecastModelsModule { }
