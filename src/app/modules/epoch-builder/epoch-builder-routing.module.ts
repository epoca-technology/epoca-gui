import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { AuthGuard } from "../../services";
import { RegressionsComponent } from "./regressions/regressions.component";
import { PredictionModelsComponent } from "./prediction-models/prediction-models.component";



const routes: Routes = [
	{
		path: "regressions",
		component: RegressionsComponent,
		canActivate: [AuthGuard]
	},
	{
		path: "predictionModels",
		component: PredictionModelsComponent,
		canActivate: [AuthGuard]
	},
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EpochBuilderRoutingModule { }
