import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from 'src/app/services/nav/auth.guard';
import { ForecastComponent } from './forecast/forecast.component';

const routes: Routes = [
    {
		path: '',
		component: ForecastComponent,
		canActivate: [AuthGuard]
	},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ForecastRoutingModule { }
