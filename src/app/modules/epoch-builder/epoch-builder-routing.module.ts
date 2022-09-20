import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { AuthGuard } from "../../services";
import { RegressionsComponent } from "./regressions/regressions.component";



const routes: Routes = [
	{
		path: "regressions",
		component: RegressionsComponent,
		canActivate: [AuthGuard]
	},
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EpochBuilderRoutingModule { }
