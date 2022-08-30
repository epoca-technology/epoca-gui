import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { AuthGuard } from "../../services";
import { BacktestsComponent } from "./backtests/backtests.component";
import { ClassificationSelectionComponent } from "./classification-selection/classification-selection.component";
import { ClassificationTrainingDataComponent } from "./classification-training-data/classification-training-data.component";
import { KerasClassificationsComponent } from "./keras-classifications/keras-classifications.component";
import { KerasRegressionsComponent } from "./keras-regressions/keras-regressions.component";
import { RegressionSelectionComponent } from "./regression-selection/regression-selection.component";
import { XgbClassificationsComponent } from "./xgb-classifications/xgb-classifications.component";
import { XgbRegressionsComponent } from "./xgb-regressions/xgb-regressions.component";



const routes: Routes = [
	{
		path: "kerasRegressions",
		component: KerasRegressionsComponent,
		canActivate: [AuthGuard]
	},
	{
		path: "xgbRegressions",
		component: XgbRegressionsComponent,
		canActivate: [AuthGuard]
	},
	{
		path: "regressionSelection",
		component: RegressionSelectionComponent,
		canActivate: [AuthGuard]
	},
	{
		path: "classificationTrainingData",
		component: ClassificationTrainingDataComponent,
		canActivate: [AuthGuard]
	},
	{
		path: "kerasClassifications",
		component: KerasClassificationsComponent,
		canActivate: [AuthGuard]
	},
	{
		path: "xgbClassifications",
		component: XgbClassificationsComponent,
		canActivate: [AuthGuard]
	},
	{
		path: "classificationSelection",
		component: ClassificationSelectionComponent,
		canActivate: [AuthGuard]
	},
	{
		path: "backtests",
		component: BacktestsComponent,
		canActivate: [AuthGuard]
	},
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EpochBuilderRoutingModule { }
