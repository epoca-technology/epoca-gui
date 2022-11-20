import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from "../../services";
import { MarketStateComponent } from './market-state/market-state.component';

const routes: Routes = [
	{
		path: "",
		component: MarketStateComponent,
		canActivate: [AuthGuard]
	},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MarketStateRoutingModule { }
