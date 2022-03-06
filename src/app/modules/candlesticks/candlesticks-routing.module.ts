import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../../services/nav/auth.guard';
import { CandlesticksComponent } from './candlesticks/candlesticks.component';

const routes: Routes = [
    {
		path: '',
		component: CandlesticksComponent,
		canActivate: [AuthGuard]
	},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CandlesticksRoutingModule { }
