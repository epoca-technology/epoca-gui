import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

// Routing
import { EpochBuilderRoutingModule } from "./epoch-builder-routing.module";

// Shared Module
import {SharedModule} from "../../shared";

// Components
import { BacktestsComponent } from "./backtests/backtests.component";
import { ClassificationTrainingDataComponent } from "./classification-training-data/classification-training-data.component";
import { KerasClassificationsComponent } from "./keras-classifications/keras-classifications.component";
import { KerasRegressionsComponent } from "./keras-regressions/keras-regressions.component";
import { RegressionSelectionComponent } from "./regression-selection/regression-selection.component";
import { XgbClassificationsComponent } from "./xgb-classifications/xgb-classifications.component";
import { XgbRegressionsComponent } from "./xgb-regressions/xgb-regressions.component";

// Shared Components
import { DiscoveryPayloadRecordsViewComponent } from './shared/discovery-payload-records-view/discovery-payload-records-view.component';
import { EbePointsBarChartComponent } from './shared/ebe-points-bar-chart/ebe-points-bar-chart.component';
import { EpochBuilderConfigDialogComponent } from './shared/epoch-builder-config-dialog';
import { EpochBuilderEvaluationComponent } from './shared/epoch-builder-evaluation';
import { KerasTrainingEpochsBarChartComponent } from './shared/keras-training-epochs-bar-chart/keras-training-epochs-bar-chart.component';
import { KerasHyperparamsViewComponent } from './shared/keras-hyperparams-view/keras-hyperparams-view.component';



@NgModule({
  declarations: [
    // Components
    BacktestsComponent,
    ClassificationTrainingDataComponent,
    KerasClassificationsComponent,
    KerasRegressionsComponent,
    RegressionSelectionComponent,
    XgbClassificationsComponent,
    XgbRegressionsComponent,

    // Shared Components
    DiscoveryPayloadRecordsViewComponent,
    EbePointsBarChartComponent,
    EpochBuilderConfigDialogComponent,
    EpochBuilderEvaluationComponent,
    KerasTrainingEpochsBarChartComponent,
    DiscoveryPayloadRecordsViewComponent,
    KerasHyperparamsViewComponent,
  ],
  imports: [
    CommonModule,
    EpochBuilderRoutingModule,
    SharedModule
  ]
})
export class EpochBuilderModule { }
