import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Routing
import { PredictionBacktestingRoutingModule } from './prediction-backtesting-routing.module';

// Shared Module
import {SharedModule} from "../../shared";

// Components
import { PredictionBacktestingComponent } from './prediction-backtesting/prediction-backtesting.component';

// Charts
import { NgApexchartsModule } from "ng-apexcharts";


@NgModule({
  declarations: [
    PredictionBacktestingComponent
  ],
  imports: [
    CommonModule,
    PredictionBacktestingRoutingModule,
    SharedModule,
    NgApexchartsModule
  ]
})
export class PredictionBacktestingModule { }
