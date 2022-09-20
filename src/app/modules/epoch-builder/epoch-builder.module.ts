import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

// Routing
import { EpochBuilderRoutingModule } from "./epoch-builder-routing.module";

// Shared Module
import {SharedModule} from "../../shared";

// Components
import { RegressionsComponent } from './regressions/regressions.component';

// Shared Components
import { EbePointsBarChartComponent } from './shared/ebe-points-bar-chart/ebe-points-bar-chart.component';
import { EpochBuilderConfigDialogComponent } from './shared/epoch-builder-config-dialog';
import { EpochBuilderEvaluationComponent } from './shared/epoch-builder-evaluation';
import { KerasTrainingEpochsBarChartComponent } from './shared/keras-training-epochs-bar-chart/keras-training-epochs-bar-chart.component';
import { KerasHyperparamsViewComponent } from './shared/keras-hyperparams-view/keras-hyperparams-view.component';
import { KerasTrainingEpochsTableComponent } from './shared/keras-training-epochs-table/keras-training-epochs-table.component';
import { LearningCurveComponent } from './shared/learning-curve/learning-curve.component';
import { RegressionTrainingDatasetComponent } from './shared/regression-training-dataset/regression-training-dataset.component';
import { DiscoveryViewComponent } from './shared/discovery-view/discovery-view.component';
import { MultiDiscoveryViewComponent } from './shared/multi-discovery-view/multi-discovery-view.component';



@NgModule({
  declarations: [
    // Components
    RegressionsComponent,

    // Shared Components
    EbePointsBarChartComponent,
    EpochBuilderConfigDialogComponent,
    EpochBuilderEvaluationComponent,
    KerasTrainingEpochsBarChartComponent,
    KerasHyperparamsViewComponent,
    KerasTrainingEpochsTableComponent,
    LearningCurveComponent,
    RegressionTrainingDatasetComponent,
    DiscoveryViewComponent,
    MultiDiscoveryViewComponent,
  ],
  imports: [
    CommonModule,
    EpochBuilderRoutingModule,
    SharedModule
  ]
})
export class EpochBuilderModule { }
