import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { AuthGuard } from "../../services";
import { BacktestsComponent } from "./backtests/backtests.component";
import { ClassificationTrainingDataComponent } from "./classification-training-data/classification-training-data.component";
import { KerasClassificationsComponent } from "./keras-classifications/keras-classifications.component";
import { KerasRegressionsComponent } from "./keras-regressions/keras-regressions.component";
import { RegressionSelectionComponent } from "./regression-selection/regression-selection.component";
import { XgbClassificationsComponent } from "./xgb-classifications/xgb-classifications.component";
import { XgbRegressionsComponent } from "./xgb-regressions/xgb-regressions.component";



const routes: Routes = [
	{
		path: "backtests",
		component: BacktestsComponent,
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
		path: "kerasRegressions",
		component: KerasRegressionsComponent,
		canActivate: [AuthGuard]
	},
	{
		path: "regressionSelection",
		component: RegressionSelectionComponent,
		canActivate: [AuthGuard]
	},
	{
		path: "xgbClassifications",
		component: XgbClassificationsComponent,
		canActivate: [AuthGuard]
	},
	{
		path: "xgbRegressions",
		component: XgbRegressionsComponent,
		canActivate: [AuthGuard]
	},
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EpochBuilderRoutingModule { }
