import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../../services';
import { ForecastModelsComponent } from './forecast-models/forecast-models.component';

const routes: Routes = [
    {
		path: '',
		component: ForecastModelsComponent,
		canActivate: [AuthGuard]
	},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ForecastModelsRoutingModule { }
