import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Routing
import { PredictionBacktestingRoutingModule } from './prediction-backtesting-routing.module';

// Shared Module
import {SharedModule} from "../../shared";

// Components
import { BacktestsComponent } from './backtests/backtests.component';
import { BacktestPositionDialogComponent } from './backtests/backtest-position-dialog/backtest-position-dialog.component';
import { ClassificationTrainingDataComponent } from './classification-training-data/classification-training-data.component';
import { ClassificationTrainingCertificatesComponent } from './classification-training-certificates/classification-training-certificates.component';
import { RegressionTrainingCertificatesComponent } from './regression-training-certificates/regression-training-certificates.component';

@NgModule({
  declarations: [
    BacktestsComponent,
    BacktestPositionDialogComponent,
    ClassificationTrainingDataComponent,
    ClassificationTrainingCertificatesComponent,
    RegressionTrainingCertificatesComponent
  ],
  imports: [
    CommonModule,
    PredictionBacktestingRoutingModule,
    SharedModule
  ]
})
export class PredictionBacktestingModule { }
