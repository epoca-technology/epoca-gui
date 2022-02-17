import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../../services';
import { ApiErrorsComponent } from './api-errors/api-errors.component';

const routes: Routes = [
    {
		path: '',
		component: ApiErrorsComponent,
		canActivate: [AuthGuard]
	},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ApiErrorsRoutingModule { }
