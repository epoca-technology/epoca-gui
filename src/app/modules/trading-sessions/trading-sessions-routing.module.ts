import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { AuthGuard } from "../../services";
import { TradingSessionsComponent } from "./trading-sessions/trading-sessions.component";

const routes: Routes = [
    {
		path: "",
		component: TradingSessionsComponent,
		canActivate: [AuthGuard]
	},
    {
		path: ":epochID",
		component: TradingSessionsComponent,
		canActivate: [AuthGuard]
	},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TradingSessionsRoutingModule { }
