import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Routing
import { PredictionsRoutingModule } from './predictions-routing.module';

// Shared Module
import {SharedModule} from "../../shared";

// Component
import { PredictionsComponent } from './predictions/predictions.component';


@NgModule({
  declarations: [
    PredictionsComponent
  ],
  imports: [
    CommonModule,
    PredictionsRoutingModule,
    SharedModule
  ]
})
export class PredictionsModule { }
