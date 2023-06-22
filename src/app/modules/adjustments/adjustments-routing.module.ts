import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../../services';
import { AdjustmentsComponent } from './adjustments/adjustments.component';

const routes: Routes = [
  {
		path: '',
		component: AdjustmentsComponent,
		canActivate: [AuthGuard]
	}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdjustmentsRoutingModule { }
