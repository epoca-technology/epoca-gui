import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from "../../services";
import { PositionsComponent } from './positions/positions.component';

const routes: Routes = [
	{
		path: "",
		component: PositionsComponent,
		canActivate: [AuthGuard]
	},
    {
		path: ":epochID",
		component: PositionsComponent,
		canActivate: [AuthGuard]
	},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PositionsRoutingModule { }
