import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../../services';
import { TradingSessionComponent } from './trading-session/trading-session.component';

const routes: Routes = [
    {
		path: '',
		component: TradingSessionComponent,
		canActivate: [AuthGuard]
	},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TradingSessionRoutingModule { }
