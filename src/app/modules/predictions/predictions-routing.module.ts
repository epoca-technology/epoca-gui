import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { AuthGuard } from "../../services";
import { PredictionsComponent } from "./predictions/predictions.component";

const routes: Routes = [
  	{
		path: "",
		component: PredictionsComponent,
		canActivate: [AuthGuard]
	},
	{
	  path: ":epochID",
	  component: PredictionsComponent,
	  canActivate: [AuthGuard]
  	},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PredictionsRoutingModule { }
