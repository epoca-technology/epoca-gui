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



@NgModule({
  declarations: [
    BacktestsComponent,
    ClassificationTrainingDataComponent,
    KerasClassificationsComponent,
    KerasRegressionsComponent,
    RegressionSelectionComponent,
    XgbClassificationsComponent,
    XgbRegressionsComponent,
  ],
  imports: [
    CommonModule,
    EpochBuilderRoutingModule,
    SharedModule
  ]
})
export class EpochBuilderModule { }
