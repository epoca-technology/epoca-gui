import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { AuthGuard } from "../../services";
import { EpochsComponent } from "./epochs/epochs.component";

const routes: Routes = [
	{
		path: "",
		component: EpochsComponent,
		canActivate: [AuthGuard]
	},
	{
		path: ":epochID",
		component: EpochsComponent,
		canActivate: [AuthGuard]
	},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EpochsRoutingModule { }
