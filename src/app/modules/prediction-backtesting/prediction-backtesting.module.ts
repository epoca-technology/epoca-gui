import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Routing
import { PredictionBacktestingRoutingModule } from './prediction-backtesting-routing.module';

// Shared Module
import {SharedModule} from "../../shared";

// Components
import { BacktestsComponent } from './backtests/backtests.component';
import { BacktestPositionDialogComponent } from './backtests/backtest-position-dialog/backtest-position-dialog.component';
import { TrainingDataComponent } from './training-data/training-data.component';
import { ModelsTrainingComponent } from './models-training/models-training.component';

@NgModule({
  declarations: [
    BacktestsComponent,
    BacktestPositionDialogComponent,
    TrainingDataComponent,
    ModelsTrainingComponent
  ],
  imports: [
    CommonModule,
    PredictionBacktestingRoutingModule,
    SharedModule
  ]
})
export class PredictionBacktestingModule { }
