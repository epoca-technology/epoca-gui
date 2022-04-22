import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Routing
import { PredictionBacktestingRoutingModule } from './prediction-backtesting-routing.module';

// Shared Module
import {SharedModule} from "../../shared";

// Components
import { PredictionBacktestingComponent } from './prediction-backtesting/prediction-backtesting.component';
import { BacktestPositionDialogComponent } from './prediction-backtesting/backtest-position-dialog/backtest-position-dialog.component';


@NgModule({
  declarations: [
    PredictionBacktestingComponent,
    BacktestPositionDialogComponent
  ],
  imports: [
    CommonModule,
    PredictionBacktestingRoutingModule,
    SharedModule
  ]
})
export class PredictionBacktestingModule { }
