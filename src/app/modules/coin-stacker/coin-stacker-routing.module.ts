import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from "../../services";
import { CoinStackerComponent } from './coin-stacker/coin-stacker.component';

const routes: Routes = [
	{
		path: "",
		component: CoinStackerComponent,
		canActivate: [AuthGuard]
	},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CoinStackerRoutingModule { }
