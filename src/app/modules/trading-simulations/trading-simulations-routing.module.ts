import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { AuthGuard } from "../../services";
import { TradingSimulationsComponent } from "./trading-simulations/trading-simulations.component";

const routes: Routes = [
    {
		path: "",
		component: TradingSimulationsComponent,
		canActivate: [AuthGuard]
	},
    {
		path: ":epochID",
		component: TradingSimulationsComponent,
		canActivate: [AuthGuard]
	},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TradingSimulationsRoutingModule { }
