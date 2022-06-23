import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Routing
import { PredictionBacktestingRoutingModule } from './prediction-backtesting-routing.module';

// Shared Module
import {SharedModule} from "../../shared";

// Components
import { BacktestsComponent } from './backtests/backtests.component';
import { BacktestPositionDialogComponent } from './backtests/backtest-position-dialog/backtest-position-dialog.component';
import { RegressionSelectionComponent } from './regression-selection/regression-selection.component';
import { RegressionTrainingCertificatesComponent } from './regression-training-certificates/regression-training-certificates.component';
import { ClassificationTrainingDataComponent } from './classification-training-data/classification-training-data.component';
import { ClassificationTrainingCertificatesComponent } from './classification-training-certificates/classification-training-certificates.component';
import { ClassificationTrainingCertificatesConfigDialogComponent } from './classification-training-certificates/classification-training-certificates-config-dialog';
import { RegressionTrainingCertificatesConfigDialogComponent } from './regression-training-certificates/regression-training-certificates-config-dialog/regression-training-certificates-config-dialog.component';

@NgModule({
  declarations: [
    BacktestsComponent,
    BacktestPositionDialogComponent,
    ClassificationTrainingDataComponent,
    ClassificationTrainingCertificatesComponent,
    RegressionTrainingCertificatesComponent,
    RegressionSelectionComponent,
    ClassificationTrainingCertificatesConfigDialogComponent,
    RegressionTrainingCertificatesConfigDialogComponent
  ],
  imports: [
    CommonModule,
    PredictionBacktestingRoutingModule,
    SharedModule
  ]
})
export class PredictionBacktestingModule { }
