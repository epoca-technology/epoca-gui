import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../../services/nav/auth.guard';
import { PriceChartComponent } from './price-chart/price-chart.component';

const routes: Routes = [
    {
		path: '',
		component: PriceChartComponent,
		canActivate: [AuthGuard]
	},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PriceChartRoutingModule { }
