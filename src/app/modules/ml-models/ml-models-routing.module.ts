import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../../services';
import { MlModelsComponent } from './ml-models/ml-models.component';

const routes: Routes = [
    {
		path: '',
		component: MlModelsComponent,
		canActivate: [AuthGuard]
	},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MlModelsRoutingModule { }
